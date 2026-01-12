import { useGetReportsQuery } from '@/store/apiSlice'
import {
  Card,
  CardContent,
  Typography,
  Stack,
  Box,
  TextField,
} from '@mui/material'
import { useMemo, useState } from 'react'

export const Balance = () => {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const params = useMemo(
    () => ({
      startDate: from,
      endDate: to,
    }),
    [from, to]
  )

  const { data: report, isLoading } = useGetReportsQuery(params)

  if (isLoading) return <p>Загрузка...</p>
  if (!report) {
    return (
      <Box p={2}>
        <p>Нет данных за выбранный период</p>
      </Box>
    )
  }

  return (
    <Box p={2}>
      <TextField
        sx={{ mr: 2 }}
        label="С"
        type="date"
        name="from"
        id="from"
        value={from}
        onChange={e => setFrom(e.target.value)}
      />
      <TextField
        label="По"
        type="date"
        name="to"
        id="to"
        value={to}
        onChange={e => setTo(e.target.value)}
      />
      <Card sx={{ p: 2, maxWidth: 400, mx: 'auto', mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📊 Финансовый отчёт
          </Typography>

          <Stack spacing={1}>
            <Typography color="success.main">
              Доходы: <b>{report.incomeTotal?.toLocaleString()} ₽</b>
            </Typography>

            <Typography color="error.main">
              Расходы: <b>{report.expenseTotal?.toLocaleString()} ₽</b>
            </Typography>

            <Typography variant="h6" sx={{ mt: 1 }}>
              Баланс:{' '}
              <b
                style={{
                  color: report.balance >= 0 ? 'green' : 'red',
                }}
              >
                {report.balance?.toLocaleString()} ₽
              </b>
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}
