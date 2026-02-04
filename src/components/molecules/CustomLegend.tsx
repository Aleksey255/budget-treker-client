import type { CategoryData } from '@/types/categoryData'
import { Box, Typography } from '@mui/material'
import type { LegendPayload } from 'recharts'

interface CustomLegendProps {
  payload?: LegendPayload[] | CategoryData[]
}

export const CustomLegend = ({ payload }: CustomLegendProps) => {
  if (!payload || payload.length === 0) return null

  return (
    <Box mt={2}>
      {payload.map((entry, index) => {
        // Определяем, откуда данные: из LegendPayload или напрямую
        const value =
          'value' in entry ? entry.value : (entry as CategoryData).name
        const color =
          'color' in entry ? entry.color : (entry as CategoryData).fill
        const amount =
          'payload' in entry
            ? entry.payload?.value
            : (entry as CategoryData).value

        return (
          <Box
            key={`legend-item-${index}`}
            display="flex"
            alignItems="center"
            mb={1}
            fontSize="14px"
          >
            <Box
              width="12px"
              height="12px"
              bgcolor={color}
              borderRadius="50%"
              mr={1}
              flexShrink={0}
            />
            <Typography component="span" variant="body2">
              {value}: <strong>{amount.toLocaleString()} ₽</strong>
            </Typography>
          </Box>
        )
      })}
    </Box>
  )
}
