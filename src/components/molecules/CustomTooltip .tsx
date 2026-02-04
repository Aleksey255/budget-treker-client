import { Box, Typography } from '@mui/material'

// Интерфейс для одного элемента payload
interface PayloadItem {
  name: string
  value: number
}
interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    payload?: PayloadItem
    value?: number
    name?: string
  }>
}

export const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length > 0) {
    const first = payload[0]
    const data = first.payload || first
    const name = data.name
    const value = data.value

    if (!name || value === undefined) return null
    return (
      <Box
        bgcolor="white"
        border="1px solid #ccc"
        borderRadius="4px"
        p="8px"
        fontSize="12px"
        boxShadow="0 2px 6px rgba(0,0,0,0.15)"
      >
        <Typography
          component="div"
          fontSize="12px"
          fontWeight="bold"
          color="black"
        >
          {name}
        </Typography>
        <Typography component="div" fontSize="12px" color="black">
          Сумма: <strong>{value} ₽</strong>
        </Typography>
      </Box>
    )
  }
  return null
}
