import { createClient } from '@supabase/supabase-js'
import fs from 'fs/promises'

const SUPABASE_URL = 'https://kyofwtmipwvzqezkepsu.supabase.co'
const SUPABASE_SERVICE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5b2Z3dG1pcHd2enFlemtlcHN1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzA2MzA3MiwiZXhwIjoyMTAyNjM5MDcyfQ.pZTocvMM5sibXOJkXaEkpzAyF1o8cEofDV3T0ThtUtA'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

function extractId(field) {
  if (!field) return null
  if (typeof field === 'string') return field
  if (field.$oid) return field.$oid
  if (field.toString && field.toString() !== '[object Object]')
    return field.toString()
  return null
}

function parseDate(dateField) {
  if (!dateField) return new Date().toISOString()

  // MongoDB формат: { $date: "2026-02-09T11:56:43.009Z" }
  if (dateField.$date) {
    return new Date(dateField.$date).toISOString()
  }

  // Обычная строка или Date объект
  try {
    const date = new Date(dateField)
    if (isNaN(date.getTime())) return new Date().toISOString()
    return date.toISOString()
  } catch {
    return new Date().toISOString()
  }
}

async function migrate() {
  console.log('🚀 Начинаем финальную миграцию...\n')

  try {
    const usersData = JSON.parse(await fs.readFile('users.json', 'utf-8'))
    const categoriesData = JSON.parse(
      await fs.readFile('categories.json', 'utf-8')
    )
    const transactionsData = JSON.parse(
      await fs.readFile('transactions.json', 'utf-8')
    )

    const users = Array.isArray(usersData) ? usersData : []
    const categories = Array.isArray(categoriesData) ? categoriesData : []
    const transactions = Array.isArray(transactionsData) ? transactionsData : []

    console.log(
      `📊 Найдено: ${users.length} пользователей, ${categories.length} категорий, ${transactions.length} транзакций\n`
    )

    // 1. Получаем существующих пользователей
    const {
      data: { users: existingUsers },
    } = await supabase.auth.admin.listUsers()
    const emailToSupabaseId = new Map()
    existingUsers.forEach(u => emailToSupabaseId.set(u.email, u.id))

    const userMapping = new Map()
    const categoryMapping = new Map()

    // 2. Синхронизируем пользователей
    console.log('👥 Синхронизируем пользователей...')
    for (const user of users) {
      const oldId = extractId(user._id) || user.id
      let newId = emailToSupabaseId.get(user.email)

      if (!newId) {
        const { data, error } = await supabase.auth.admin.createUser({
          email: user.email,
          password: 'TempPass123!',
          email_confirm: true,
          user_metadata: { full_name: user.name || 'User' },
        })
        if (!error) {
          newId = data.user.id
          emailToSupabaseId.set(user.email, newId)
        }
      }
      if (oldId && newId) {
        userMapping.set(oldId, newId)
      }
    }
    console.log(`✅ Сопоставлено пользователей: ${userMapping.size}\n`)

    // 3. Мигрируем категории (ИСПРАВЛЕНО: поле 'user' вместо 'user_id')
    console.log(' Мигрируем категории...')
    for (const cat of categories) {
      // Проверяем все возможные варианты названия поля
      const oldUserId =
        extractId(cat.user) || extractId(cat.user_id) || extractId(cat.userId)
      const oldCatId = extractId(cat._id) || cat.id

      const newUserId = userMapping.get(oldUserId)

      if (!newUserId) {
        console.log(
          `  ⚠️ Пропуск "${cat.name}": не найден владелец (oldUserId: ${oldUserId})`
        )
        continue
      }

      const { data, error } = await supabase
        .from('categories')
        .insert({
          user_id: newUserId,
          name: cat.name,
          type: cat.type || 'expense',
        })
        .select()
        .single()

      if (error) {
        console.log(`  ❌ Ошибка "${cat.name}": ${error.message}`)
        continue
      }

      if (data) {
        categoryMapping.set(oldCatId, data.id)
        console.log(`  ✅ Создано: ${cat.name}`)
      }
    }
    console.log(`\n✅ Категорий создано: ${categoryMapping.size}\n`)

    // 4. Мигрируем транзакции (ИСПРАВЛЕНО: обработка дат)
    console.log('💰 Мигрируем транзакции...')
    let txCount = 0
    let errorCount = 0

    for (const tx of transactions) {
      const oldUserId =
        extractId(tx.user) || extractId(tx.user_id) || extractId(tx.userId)
      const oldCatId =
        extractId(tx.category) ||
        extractId(tx.category_id) ||
        extractId(tx.categoryId)
      const newUserId = userMapping.get(oldUserId)

      if (!newUserId) continue

      const newCatId = oldCatId ? categoryMapping.get(oldCatId) : null

      const { error } = await supabase.from('transactions').insert({
        user_id: newUserId,
        category_id: newCatId,
        amount: parseFloat(tx.amount) || 0,
        type: tx.type || 'expense',
        date: parseDate(tx.date),
        description: tx.description || null,
      })

      if (error) {
        errorCount++
        if (errorCount <= 3) {
          // Показываем только первые 3 ошибки
          console.log(`  ⚠️ Ошибка транзакции: ${error.message}`)
        }
      } else {
        txCount++
      }
    }
    console.log(`✅ Транзакций создано: ${txCount}`)
    if (errorCount > 0) {
      console.log(`⚠️ Ошибок при создании: ${errorCount}`)
    }

    console.log('\n✨ МИГРАЦИЯ УСПЕШНО ЗАВЕРШЕНА!')
    console.log('Обновите страницу в браузере (Ctrl + F5)')
  } catch (error) {
    console.error('❌ КРИТИЧЕСКАЯ ОШИБКА:', error.message)
    console.error(error)
  }
}

migrate()
