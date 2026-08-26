import { type Transaction } from '@/types/transaction'

// Расширяем тип, чтобы добавить локальные флаги
export interface LocalTransaction extends Transaction {
  id: string
  tempId?: string
  user_id?: string
  isPending?: boolean
  category_name?: string
}

const PENDING_KEY = 'pending_transactions'

export const getPendingTransactions = (): LocalTransaction[] => {
  const stored = localStorage.getItem(PENDING_KEY)
  return stored ? JSON.parse(stored) : []
}

export const savePendingTransaction = (tx: LocalTransaction) => {
  const pending = getPendingTransactions()
  pending.push(tx)
  localStorage.setItem(PENDING_KEY, JSON.stringify(pending))
}

export const clearPendingTransactions = () => {
  localStorage.removeItem(PENDING_KEY)
}
