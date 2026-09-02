export interface Transaction {
  id: string
  type: 'income' | 'expense'
  amount: number
  description: string | null
  date: string
  category_id: string | null
  // Универсальный тип: может быть и объект, и массив
  categories?: { name: string } | { name: string }[] | null
}

export type TxResponse = {
  data: Transaction[] | null
  error: { message: string } | null
}

export const getCategoryName = (tx: Transaction): string => {
  if (!tx.categories) return 'Без категории'

  // Если это массив — берем первый элемент
  if (Array.isArray(tx.categories)) {
    return tx.categories[0]?.name || 'Без категории'
  }

  // Если это объект — берем name напрямую
  return (tx.categories as { name: string }).name || 'Без категории'
}
