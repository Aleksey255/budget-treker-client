import { useGetReportsQuery } from '@/store/apiSlice'
import { Card, CardContent, Typography, Stack, Box } from '@mui/material'
import { useCallback, useMemo, useState } from 'react'
import { DateRangePicker } from '../molecules/DateRangePicker'

export const Balance = () => {
  const [from, setFrom] = useState<Date | null>(null)
  const [to, setTo] = useState<Date | null>(null)

  const formatDateForBackend = (date: Date | null) => {
    if (!date) return ''
    const d = new Date(date)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }
  const params = useMemo(
    () => ({
      startDate: formatDateForBackend(from),
      endDate: formatDateForBackend(to),
    }),
    [from, to]
  )

  const handleDateChange = useCallback(
    (range: { from: Date | null; to: Date | null }) => {
      setFrom(range.from)
      setTo(range.to)
    },
    []
  )

  const { data: report, isLoading } = useGetReportsQuery(params)

  if (isLoading) return <p>Загрузка...</p>
  if (
    !report ||
    typeof report.incomeTotal !== 'number' ||
    typeof report.expenseTotal !== 'number' ||
    typeof report.balance !== 'number'
  ) {
    return (
      <Box p={2}>
        <p>Нет данных за выбранный период</p>
      </Box>
    )
  }

  return (
    <Box p={2}>
      <DateRangePicker onDateChange={handleDateChange} />
      <Card sx={{ p: 2, maxWidth: 400, mx: 'auto', mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📊 Финансовый отчёт
          </Typography>

          <Stack spacing={1}>
            <Typography color="success.main">
              Доходы: <b>{report.incomeTotal.toLocaleString()} ₽</b>
            </Typography>

            <Typography color="error.main">
              Расходы: <b>{report.expenseTotal.toLocaleString()} ₽</b>
            </Typography>

            <Typography variant="h6" sx={{ mt: 1 }}>
              Баланс:{' '}
              <Typography
                component="b"
                sx={{
                  color: report.balance >= 0 ? 'green' : 'red',
                }}
              >
                {report.balance.toLocaleString()} ₽
              </Typography>
            </Typography>
          </Stack>
        </CardContent>
      </Card>
      {/* </LocalizationProvider> */}
    </Box>
  )
}
