import type { CategoryData } from '@/types/categoryData'
import { Box, Typography } from '@mui/material'

interface CustomLegendProps {
  payload: CategoryData[]
}

export const CustomLegend = ({ payload }: CustomLegendProps) => {
  if (!payload || payload.length === 0) return null

  return (
    <Box mt={2}>
      {payload.map((entry, index) => (
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
            bgcolor={entry.fill}
            borderRadius="50%"
            mr={1}
            flexShrink={0}
          />
          <Typography component="span" variant="body2">
            {entry.name}: <strong>{entry.value.toLocaleString()} ₽</strong>
          </Typography>
        </Box>
      ))}
    </Box>
  )
}
