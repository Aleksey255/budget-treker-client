import {
  Card,
  CardContent,
  Typography,
  Stack,
  Box,
  CircularProgress,
  Alert,
  Button,
  Chip,
} from '@mui/material'
import { useCallback, useState, useEffect } from 'react'
import { DateRangePicker } from '../molecules/DateRangePicker'
import { supabase } from '@/lib/supabaseClient'
import { useDateFilter, formatDateForQuery } from '@/context/DateFilterContext'

export const Balance = () => {
  const { dateRange, setDateRange, resetDateRange } = useDateFilter()

  // Временные даты (пока пользователь выбирает)
  const [tempFrom, setTempFrom] = useState<Date | null>(dateRange.from)
  const [tempTo, setTempTo] = useState<Date | null>(dateRange.to)

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [incomeTotal, setIncomeTotal] = useState(0)
  const [expenseTotal, setExpenseTotal] = useState(0)

  // Синхронизируем временные даты с глобальными при изменении
  useEffect(() => {
    setTempFrom(dateRange.from)
    setTempTo(dateRange.to)
  }, [dateRange.from, dateRange.to])

  // Загружаем данные при изменении РАБОЧИХ дат (из контекста)
  useEffect(() => {
    const fetchReport = async () => {
      setIsLoading(true)
      setError(null)

      try {
        let query = supabase.from('transactions').select('amount, type')

        const startDate = formatDateForQuery(dateRange.from, false)
        const endDate = formatDateForQuery(dateRange.to, true)

        if (startDate) query = query.gte('date', startDate)
        if (endDate) query = query.lte('date', endDate)

        const { data, error: fetchError } = await query

        if (fetchError) throw fetchError

        let income = 0
        let expense = 0

        if (data) {
          for (const tx of data) {
            const amount = Number(tx.amount)
            if (tx.type === 'income') income += amount
            else if (tx.type === 'expense') expense += amount
          }
        }

        setIncomeTotal(income)
        setExpenseTotal(expense)
      } catch (err) {
        console.error('Ошибка загрузки отчёта:', err)
        setError('Не удалось загрузить данные')
      } finally {
        setIsLoading(false)
      }
    }

    fetchReport()
  }, [dateRange.from, dateRange.to])

  const handleDateChange = useCallback(
    (range: { from: Date | null; to: Date | null }) => {
      setTempFrom(range.from)
      setTempTo(range.to)
    },
    []
  )

  const handleApplyFilter = () => {
    setDateRange({ from: tempFrom, to: tempTo })
  }

  const handleReset = () => {
    resetDateRange()
  }

  const balance = incomeTotal - expenseTotal

  const formatDate = (date: Date | null) => {
    if (!date) return 'не выбрана'
    return date.toLocaleDateString('ru-RU')
  }

  if (isLoading) {
    return (
      <Box p={2} display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box p={2}>
        <Alert severity="error">{error}</Alert>
      </Box>
    )
  }

  return (
    <Box p={2}>
      <DateRangePicker onDateChange={handleDateChange} />

      <Box sx={{mt: 3, mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Период:
        </Typography>
        <Chip
          label={`С ${formatDate(tempFrom)}`}
          color={tempFrom ? "primary" : "default"}
          size="small"
        />
        <Chip
          label={`По ${formatDate(tempTo)}`}
          color={tempTo ? "primary" : "default"}
          size="small"
        />
        <Button
          size="small"
          variant="contained"
          onClick={handleApplyFilter}
          disabled={!tempFrom || !tempTo}
          sx={{ ml: 1 }}
        >
          Применить
        </Button>
        <Button
          size="small"
          variant="outlined"
          onClick={handleReset}
        >
          Сбросить
        </Button>
      </Box>

      <Card sx={{ p: 2, maxWidth: 400, mx: 'auto', mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📊 Финансовый отчёт
          </Typography>

          <Stack spacing={1}>
            <Typography color="success.main">
              Доходы: <b>{incomeTotal.toLocaleString('ru-RU')} ₽</b>
            </Typography>

            <Typography color="error.main">
              Расходы: <b>{expenseTotal.toLocaleString('ru-RU')} ₽</b>
            </Typography>

            <Typography variant="h6" sx={{ mt: 1 }}>
              Баланс:{' '}
              <Typography
                component="b"
                sx={{ color: balance >= 0 ? 'success.main' : 'error.main' }}
              >
                {balance.toLocaleString('ru-RU')} ₽
              </Typography>
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}
