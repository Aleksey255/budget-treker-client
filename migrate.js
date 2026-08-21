import { createClient } from '@supabase/supabase-js'
import { MongoClient } from 'mongodb'
import fs from 'fs/promises'

// Конфигурация
const MONGO_URI =
  'mongodb+srv://Aleks:GNKpAgsuTqI6RGDj@budget-tracker.ssnhq8f.mongodb.net/?retryWrites=true&w=majority&appName=budget-tracker'
const MONGO_DB_NAME = 'budget-tracker'

const SUPABASE_URL = 'https://kyofwtmipwvzqezkepsu.supabase.co'
const SUPABASE_SERVICE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5b2Z3dG1pcHd2enFlemtlcHN1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzA2MzA3MiwiZXhwIjoyMTAyNjM5MDcyfQ.pZTocvMM5sibXOJkXaEkpzAyF1o8cEofDV3T0ThtUtA'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// Универсальная функция для извлечения строкового ID из любого формата MongoDB
function extractId(idField) {
  if (!idField) return null
  if (typeof idField === 'string') return idField
  if (idField.$oid) return idField.$oid
  if (idField.toString && idField.toString() !== '[object Object]')
    return idField.toString()
  return null
}

async function migrate() {
  console.log('🚀 Начинаем миграцию из JSON файлов...\n')

  try {
    const usersData = JSON.parse(await fs.readFile('users.json', 'utf-8'))
    const categoriesData = JSON.parse(
      await fs.readFile('categories.json', 'utf-8')
    )
    const transactionsData = JSON.parse(
      await fs.readFile('transactions.json', 'utf-8')
    )

    const users = Array.isArray(usersData)
      ? usersData
      : usersData.data || [usersData]
    const categories = Array.isArray(categoriesData)
      ? categoriesData
      : categoriesData.data || [categoriesData]
    const transactions = Array.isArray(transactionsData)
      ? transactionsData
      : transactionsData.data || [transactionsData]

    console.log(
      `📊 Найдено в файлах: ${users.length} пользователей, ${categories.length} категорий, ${transactions.length} транзакций\n`
    )

    const userMapping = new Map()
    const categoryMapping = new Map()

    // 1. Пользователи
    console.log('📋 Мигрируем пользователей...')
    for (const user of users) {
      const oldUserId = extractId(user._id)
      console.log(`  → Обработка: ${user.email} (Старый ID: ${oldUserId})`)

      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: 'TempPass123!', // Единый временный пароль для всех
        email_confirm: true, // Подтверждаем сразу, без писем
        user_metadata: { full_name: user.name || user.full_name || 'User' },
      })

      if (error) {
        console.error(`  ❌ Ошибка ${user.email}:`, error.message)
        continue
      }

      userMapping.set(oldUserId, data.user.id)
      console.log(`  ✅ Успешно: новый ID в Supabase = ${data.user.id}`)
    }

    console.log(`\n📌 Всего сопоставлено пользователей: ${userMapping.size}\n`)

    // 2. Категории
    console.log('📂 Мигрируем категории...')
    let skippedCategories = 0
    for (const category of categories) {
      const oldUserId = extractId(category.user_id)
      const oldCategoryId = extractId(category._id)
      const newUserId = userMapping.get(oldUserId)

      if (!newUserId) {
        console.warn(
          `  ⚠️ Пропуск категории "${category.name}": не найден пользователь со старым ID ${oldUserId}`
        )
        skippedCategories++
        continue
      }

      const { data, error } = await supabase
        .from('categories')
        .insert({
          user_id: newUserId,
          name: category.name,
          type: category.type || 'expense',
        })
        .select()
        .single()

      if (error) {
        console.error(
          `  ❌ Ошибка категории "${category.name}":`,
          error.message
        )
        continue
      }

      categoryMapping.set(oldCategoryId, data.id)
      console.log(`  ✅ Категория "${category.name}" создана`)
    }

    // 3. Транзакции
    console.log('\n💰 Мигрируем транзакции...')
    let skippedTransactions = 0
    for (const tx of transactions) {
      const oldUserId = extractId(tx.user_id)
      const oldCategoryId = extractId(tx.category_id)
      const newUserId = userMapping.get(oldUserId)

      if (!newUserId) {
        skippedTransactions++
        continue
      }

      const newCategoryId = oldCategoryId
        ? categoryMapping.get(oldCategoryId)
        : null

      const { error } = await supabase.from('transactions').insert({
        user_id: newUserId,
        category_id: newCategoryId,
        amount: parseFloat(tx.amount) || 0,
        type: tx.type || 'expense',
        date: tx.date
          ? new Date(tx.date).toISOString()
          : new Date().toISOString(),
        description: tx.description || null,
      })

      if (error) {
        console.error(`  ❌ Ошибка транзакции:`, error.message)
      }
    }

    console.log('\n✨ МИГРАЦИЯ УСПЕШНО ЗАВЕРШЕНА!')
    console.log(`📊 Пользователей: ${userMapping.size}`)
    console.log(
      `📊 Категорий: ${categoryMapping.size} (пропущено: ${skippedCategories})`
    )
    console.log(
      `📊 Транзакций: ${transactions.length - skippedTransactions} (пропущено: ${skippedTransactions})`
    )
    console.log('\n🔑 ДЛЯ ВХОДА ИСПОЛЬЗУЙТЕ:')
    console.log('   Email: ваш email из базы')
    console.log('   Пароль: TempPass123!')
  } catch (error) {
    console.error('❌ Критическая ошибка:', error)
  }
}

migrate()
