import { createContext, useContext, useState, type ReactNode } from 'react'

export interface DateRange {
  from: Date | null
  to: Date | null
}

interface DateFilterContextType {
  dateRange: DateRange
  setDateRange: (range: DateRange) => void
  resetDateRange: () => void
}

const DateFilterContext = createContext<DateFilterContextType | undefined>(undefined)

// Вспомогательные функции для работы с датами
const getStartOfMonth = () => {
  const today = new Date()
  return new Date(today.getFullYear(), today.getMonth(), 1)
}

const getToday = () => new Date()

// Форматирование даты для Supabase
export const formatDateForQuery = (date: Date | null, isEndDate: boolean): string | null => {
  if (!date) return null
  const d = new Date(date)
  if (isEndDate) {
    d.setHours(23, 59, 59, 999)
  } else {
    d.setHours(0, 0, 0, 0)
  }
  return d.toISOString()
}

export const DateFilterProvider = ({ children }: { children: ReactNode }) => {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: getStartOfMonth(),
    to: getToday(),
  })

  const resetDateRange = () => {
    setDateRange({
      from: getStartOfMonth(),
      to: getToday(),
    })
  }

  return (
    <DateFilterContext.Provider value={{ dateRange, setDateRange, resetDateRange }}>
      {children}
    </DateFilterContext.Provider>
  )
}

export const useDateFilter = () => {
  const context = useContext(DateFilterContext)
  if (!context) {
    throw new Error('useDateFilter must be used within a DateFilterProvider')
  }
  return context
}
