export interface Transactions {
  _id: string
  type: 'income' | 'expense'
  amount: number
  categoryId: string
  description: string
  date: string
}

export type NewTransaction = Omit<Transactions, '_id'>
