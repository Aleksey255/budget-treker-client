import {
  BarChart,
  Bar,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Box, Typography } from '@mui/material'

import type { CategoryData } from '@/types/categoryData'
import { CustomLegend } from './CustomLegend'
import { CustomTooltip } from './CustomTooltip'
import { getCategoryName, type Transaction } from '@/types/transaction'

interface RadialTransactionChartProps {
  transactions: Transaction[]
  type: 'income' | 'expense'
}

// Палитра цветов
const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884D8',
  '#82CA9D',
  '#FF6B6B',
  '#4ECDC4',
]

export const RadialTransactionChart = ({
  transactions,
  type,
}: RadialTransactionChartProps) => {
  // 1. Фильтруем по типу (доход/расход)
  // Данные уже отфильтрованы по дате на уровне TransactionList!
  const filteredTransactions = transactions.filter(t => t.type === type)

  // 2. Группируем по категориям, используя нашу надежную функцию getCategoryName
  const categoryMap = new Map<string, number>()
  filteredTransactions.forEach(t => {
    // 👇 ИСПРАВЛЕНИЕ: используем getCategoryName вместо t.categories?.name
    const categoryName = getCategoryName(t)

    categoryMap.set(
      categoryName,
      (categoryMap.get(categoryName) || 0) + Number(t.amount)
    )
  })

  // 3. Формируем данные для графика
  const data: CategoryData[] = Array.from(categoryMap.entries()).map(
    ([name, value], index) => ({
      name,
      value,
      fill: COLORS[index % COLORS.length],
    })
  )

  if (data.length === 0) {
    return (
      <Box textAlign="center" p={4}>
        <Typography color="text.secondary">
          Нет {type === 'income' ? 'доходов' : 'расходов'} за выбранный период
        </Typography>
      </Box>
    )
  }

  return (
    <Box textAlign="center" sx={{ width: '100%' }}>
      <Typography variant="h6" gutterBottom>
        {type === 'income' ? 'Доходы' : 'Расходы'} по категориям
      </Typography>

      <Box sx={{ height: 300, width: '100%' }}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            margin={{ top: 5, right: 20, left: -10, bottom: 40 }} // Отступы для наклоненного текста
          >
            <XAxis
              dataKey="name"
              angle={-45} // Наклон текста, чтобы длинные названия не наезжали друг на друга
              textAnchor="end"
              height={60}
              tick={{ fontSize: 12 }}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />

            {/* 👇 ПРАВИЛЬНЫЙ способ раскрасить столбцы в Recharts */}
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>

      <Box sx={{ mt: 2 }}>
        <CustomLegend payload={data} />
      </Box>
    </Box>
  )
}
