import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Box, Typography } from '@mui/material'

import type { CategoryData } from '@/types/categoryData'
import { CustomLegend } from './CustomLegend'
import { CustomTooltip } from './CustomTooltip '
import type { Transactions } from '@/types/transaction'

interface RadialTransactionChartProps {
  transactions: Transactions[]
  type: 'income' | 'expense'
}

// Простая палитра цветов
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
  // Фильтруем по типу и группируем по категориям
  const filteredTransactions = transactions.filter(t => t.type === type)

  const categoryMap = new Map<string, number>()
  filteredTransactions.forEach(t => {
    categoryMap.set(
      t.categoryName,
      (categoryMap.get(t.categoryName) || 0) + t.amount
    )
  })

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
        <Typography color="textSecondary">
          Нет {type === 'income' ? 'доходов' : 'расходов'} для отображения
        </Typography>
      </Box>
    )
  }

  return (
    <Box textAlign="center">
      <Typography variant="h6" gutterBottom>
        {type === 'income' ? 'Доходы' : 'Расходы'} по категориям
      </Typography>
      <Box sx={{ height: 300, position: 'relative', width: '100%' }}>
        <ResponsiveContainer width="100%" height={300} minWidth="100%">
          <BarChart data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            {data.map((entry, index) => (
              <Bar
                key={`bar-${index}`}
                dataKey="value"
                fill={entry.fill}
                isAnimationActive={true}
              />
            ))}
            <Tooltip content={<CustomTooltip />} />
          </BarChart>
        </ResponsiveContainer>
      </Box>
      <Box>
        <CustomLegend payload={data} />
      </Box>
    </Box>
  )
}
