export interface Transactions {
  _id: string
  type: 'income' | 'expense'
  amount: number
  categoryId: string
  description: string
  date: string
}
