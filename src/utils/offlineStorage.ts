import { type Transaction } from '@/types/transaction'

// Расширяем тип, чтобы добавить локальные флаги
export interface LocalTransaction extends Transaction {
  id: string
  tempId?: string
  user_id?: string
  isPending?: boolean
  category_name?: string
}

interface CachedFilters {
  filterCategoryId: string
  searchDescription: string
  dateRange: {
    from: Date | null
    to: Date | null
  }
}

const PENDING_KEY = 'pending_transactions'
const CACHED_TX_KEY = 'cached_transactions'
const CACHED_FILTERS_KEY = 'cached_filters'

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

export const getCachedTransactions = (): Transaction[] => {
  const stored = localStorage.getItem(CACHED_TX_KEY)
  return stored ? JSON.parse(stored) : []
}

export const setCachedTransactions = (transactions: Transaction[]) => {
  localStorage.setItem(CACHED_TX_KEY, JSON.stringify(transactions))
}

export const getCachedFilters = (): CachedFilters | null => {
  const stored = localStorage.getItem(CACHED_FILTERS_KEY)
  return stored ? JSON.parse(stored) : null
}

export const setCachedFilters = (filters: CachedFilters) => {
  localStorage.setItem(CACHED_FILTERS_KEY, JSON.stringify(filters))
}
