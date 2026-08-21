import { createClient } from '@supabase/supabase-js'
import fs from 'fs/promises'
import path from 'path'

// Убедитесь, что пути к файлам правильные!
// Если скрипт лежит в папке client, оставьте как есть.
const TRANSACTIONS_FILE = './transactions.json'
const CATEGORIES_FILE = './categories.json'

const SUPABASE_URL = 'https://kyofwtmipwvzqezkepsu.supabase.co'
const SUPABASE_SERVICE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5b2Z3dG1pcHd2enFlemtlcHN1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzA2MzA3MiwiZXhwIjoyMTAyNjM5MDcyfQ.pZTocvMM5sibXOJkXaEkpzAyF1o8cEofDV3T0ThtUtA' // ТОЛЬКО service_role!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

function extractId(field) {
  if (!field) return null
  if (typeof field === 'string') return field
  if (field.$oid) return field.$oid
  return null
}

async function assignCategories() {
  console.log('🚀 Начинаем назначение категорий...\n')

  try {
    // 1. Читаем JSON
    const txData = JSON.parse(await fs.readFile(TRANSACTIONS_FILE, 'utf-8'))
    const catData = JSON.parse(await fs.readFile(CATEGORIES_FILE, 'utf-8'))

    const jsonTransactions = Array.isArray(txData) ? txData : []
    const jsonCategories = Array.isArray(catData) ? catData : []

    console.log(
      `📊 В файлах: ${jsonTransactions.length} транзакций, ${jsonCategories.length} категорий`
    )

    // 2. Загружаем категории из Supabase и строим карту: oldId -> newId
    const { data: supaCats, error: catErr } = await supabase
      .from('categories')
      .select('id, name')
    if (catErr) throw new Error(`Ошибка категорий: ${catErr.message}`)

    const categoryMap = new Map()
    for (const cat of jsonCategories) {
      const oldId = extractId(cat._id)
      const supaCat = supaCats.find(c => c.name === cat.name)
      if (oldId && supaCat) {
        categoryMap.set(oldId, supaCat.id)
      }
    }
    console.log(`✅ Сопоставлено категорий: ${categoryMap.size}\n`)

    // 3. Загружаем ВСЕ транзакции из Supabase, у которых НЕТ категории
    console.log('⏳ Загружаем транзакции без категории из Supabase...')
    const { data: supaTxs, error: txErr } = await supabase
      .from('transactions')
      .select('id, amount, date, description')
      .is('category_id', null)

    if (txErr) throw new Error(`Ошибка транзакций: ${txErr.message}`)
    console.log(`📋 Найдено ${supaTxs.length} транзакций для обновления.\n`)

    let updatedCount = 0

    // 4. Сопоставляем и обновляем
    for (const supaTx of supaTxs) {
      const supaDate = new Date(supaTx.date).getTime()
      const supaAmount = parseFloat(supaTx.amount)
      const supaDesc = (supaTx.description || '').toLowerCase().trim()

      // Ищем подходящую транзакцию в JSON (совпадение суммы и даты ± 1 день)
      const matchedJsonTx = jsonTransactions.find(jtx => {
        const jDateStr = jtx.date?.$date ? jtx.date.$date : jtx.date
        const jDate = new Date(jDateStr).getTime()
        const jAmount = parseFloat(jtx.amount)
        const jDesc = (jtx.description || '').toLowerCase().trim()

        const dateDiff = Math.abs(supaDate - jDate)
        const isSameDay = dateDiff < 86400000 // Менее 24 часов разницы

        return (
          Math.abs(supaAmount - jAmount) < 0.01 &&
          isSameDay &&
          supaDesc === jDesc
        )
      })

      if (matchedJsonTx) {
        const oldCatId =
          extractId(matchedJsonTx.category_id) ||
          extractId(matchedJsonTx.categoryId)
        const newCatId = categoryMap.get(oldCatId)

        if (newCatId) {
          await supabase
            .from('transactions')
            .update({ category_id: newCatId })
            .eq('id', supaTx.id)

          updatedCount++
          if (updatedCount % 100 === 0) {
            console.log(`  ...обновлено ${updatedCount}`)
          }
        }
      }
    }

    console.log(`\n✨ ГОТОВО!`)
    console.log(`✅ Успешно проставлено категорий: ${updatedCount}`)
    console.log(
      `⚠️ Осталось без категории: ${supaTxs.length - updatedCount} (можно проставить вручную)`
    )
    console.log('Обновите страницу в браузере!')
  } catch (error) {
    console.error('❌ КРИТИЧЕСКАЯ ОШИБКА:', error.message)
  }
}

assignCategories()
