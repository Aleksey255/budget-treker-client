import { useGetReportsQuery } from '@/store/apiSlice'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { ru } from 'date-fns/locale/ru'
import { Card, CardContent, Typography, Stack, Box } from '@mui/material'
import { useMemo, useState } from 'react'

export const Balance = () => {
  const [from, setFrom] = useState<Date | undefined>(undefined)
  const [to, setTo] = useState<Date | undefined>(undefined)

  const formatDateForBackend = (date: Date | undefined) => {
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
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
        <DesktopDatePicker
          sx={{ mr: 2 }}
          label="С"
          value={from}
          onChange={newValue => setFrom(newValue ?? undefined)}
          slotProps={{
            textField: { fullWidth: false },
          }}
          format="dd.MM.yyyy"
          disableFuture
        />
        <DesktopDatePicker
          label="По"
          value={to}
          onChange={newValue => setTo(newValue ?? undefined)}
          slotProps={{ textField: { fullWidth: false } }}
          format="dd.MM.yyyy"
          disableFuture
          minDate={from}
        />
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
      </LocalizationProvider>
    </Box>
  )
}
