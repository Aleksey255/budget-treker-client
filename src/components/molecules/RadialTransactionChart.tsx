import { PieChart, Pie, ResponsiveContainer, Tooltip } from 'recharts'
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
      <Box sx={{ height: 200, position: 'relative', width: '100%' }}>
        <ResponsiveContainer width="100%" height={200} minWidth="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="60%"
              outerRadius={80}
              labelLine={false}
              dataKey="value"
              nameKey="name"
            ></Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </Box>
      <Box>
        <CustomLegend payload={data} />
      </Box>
    </Box>
  )
}
