import { createContext } from 'react'
import type { DateRange } from './DateFilterContext'

export interface DateFilterContextType {
  dateRange: DateRange
  setDateRange: (range: DateRange) => void
  resetDateRange: () => void
}

export const DateFilterContext = createContext<DateFilterContextType | undefined>(
  undefined
)
