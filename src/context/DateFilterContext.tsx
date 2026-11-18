import { useState, type ReactNode } from 'react'
import { DateFilterContext } from './date-filter-context'

export interface DateRange {
  from: Date | null
  to: Date | null
}

// Вспомогательные функции для работы с датами
const getStartOfMonth = () => {
  const today = new Date()
  return new Date(today.getFullYear(), today.getMonth(), 1)
}

const getToday = () => new Date()

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
