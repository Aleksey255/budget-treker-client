import { useState, useEffect } from 'react'
import { apiClient } from '@/services/api/apiClient'

interface UseApiResult<T> {
  data: T[]
  loading: boolean
  error: string | null
  addItem: (item: Omit<T, '_id'>) => Promise<void>
  deleteItem: (id: string) => Promise<void>
  updateItem: (id: string, item: Partial<T>) => Promise<void>
  refetch: () => Promise<void>
}

export const useApi = <T extends { _id: string }>(
  endpoint: string,
  options?: {
    retryDelay?: number
    maxRetries?: number
  }
): UseApiResult<T> => {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const maxRetries = options?.maxRetries ?? 3
  const retryDelay = options?.retryDelay ?? 1000

  const fetchData = async (retries = 0): Promise<void> => {
    try {
      setLoading(true)
      const result: T[] = await apiClient.get<T[]>(endpoint)
      setData(result)
      setError(null)
    } catch (err) {
      if (retries < maxRetries) {
        console.warn(`Повтор запроса... (${retries + 1}/${maxRetries})`)
        setTimeout(() => fetchData(retries + 1), retryDelay)
      } else {
        setError('Не удалось загрузить данные')
      }
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const addItem = async (item: Omit<T, '_id'>): Promise<void> => {
    try {
      const newItem: T = await apiClient.post<T>(endpoint, item)
      setData(prev => [...prev, newItem])
    } catch (err) {
      setError('Ошибка при добавлении')
      console.error(err)
    }
  }

  const deleteItem = async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`${endpoint}/${id}`)
      setData(prev => prev.filter(item => item._id !== id))
    } catch (err) {
      setError('Ошибка при удалении')
      console.error(err)
    }
  }

  const updateItem = async (id: string, item: Partial<T>): Promise<void> => {
    try {
      await apiClient.put<never>(`${endpoint}/${id}`, item)
      await fetchData()
    } catch (err) {
      setError('Ошибка при обновлении')
      console.error(err)
    }
  }

  return {
    data,
    loading,
    error,
    addItem,
    deleteItem,
    updateItem,
    refetch: fetchData,
  }
}
