import {
  Card,
  CardContent,
  Typography,
  Stack,
  Box,
  CircularProgress,
  Button,
  Chip,
} from '@mui/material'
import { useCallback, useState, useEffect } from 'react'
import { DateRangePicker } from '../molecules/DateRangePicker'
import { supabase } from '@/lib/supabaseClient'
import { useDateFilter, formatDateForQuery } from '@/context/DateFilterContext'
import {
  getCachedTransactions,
  getPendingTransactions,
} from '@/utils/offlineStorage'

export const Balance = () => {
  const { dateRange, setDateRange, resetDateRange } = useDateFilter()

  const [tempFrom, setTempFrom] = useState<Date | null>(dateRange.from)
  const [tempTo, setTempTo] = useState<Date | null>(dateRange.to)

  const [isLoading, setIsLoading] = useState(false)
  const [incomeTotal, setIncomeTotal] = useState(0)
  const [expenseTotal, setExpenseTotal] = useState(0)

  useEffect(() => {
    setTempFrom(dateRange.from)
    setTempTo(dateRange.to)
  }, [dateRange.from, dateRange.to])

  // 👇 ФУНКЦИЯ РАСЧЕТА БАЛАНСА (вынесена отдельно, чтобы вызывать из разных мест)
  const calculateBalance = useCallback(async () => {
    const startDate = formatDateForQuery(dateRange.from, false)
    const endDate = formatDateForQuery(dateRange.to, true)

    // 1. Берем кэшированные транзакции
    const cachedTxs = getCachedTransactions()
    // 2. Берем локальные (оффлайн) транзакции
    const pendingTxs = getPendingTransactions()
    // 3. Объединяем их
    const allTxs = [...pendingTxs, ...cachedTxs]

    let income = 0
    let expense = 0

    for (const tx of allTxs) {
      const txDateStr = new Date(tx.date).toISOString()
      if (startDate && txDateStr < startDate) continue
      if (endDate && txDateStr > endDate) continue

      const amount = Number(tx.amount)
      if (tx.type === 'income') income += amount
      else if (tx.type === 'expense') expense += amount
    }

    setIncomeTotal(income)
    setExpenseTotal(expense)

    // 4. Если есть интернет — уточняем данные с сервера
    if (navigator.onLine) {
      try {
        let query = supabase.from('transactions').select('amount, type')
        if (startDate) query = query.gte('date', startDate)
        if (endDate) query = query.lte('date', endDate)

        const { data, error: fetchError } = await query
        if (fetchError) throw fetchError

        let serverIncome = 0
        let serverExpense = 0

        if (data) {
          for (const tx of data) {
            const amount = Number(tx.amount)
            if (tx.type === 'income') serverIncome += amount
            else if (tx.type === 'expense') serverExpense += amount
          }
        }

        setIncomeTotal(serverIncome)
        setExpenseTotal(serverExpense)
      } catch (err) {
        console.error('Ошибка загрузки отчёта:', err)
      }
    }

    setIsLoading(false)
  }, [dateRange.from, dateRange.to])

  // 👇 СЛУШАЕМ ИЗМЕНЕНИЯ ТРАНЗАКЦИЙ И ПЕРЕСЧИТЫВАЕМ БАЛАНС
  useEffect(() => {
    const handleUpdate = () => calculateBalance()

    window.addEventListener('transactions-changed', handleUpdate)
    window.addEventListener('pending-updated', handleUpdate)

    // Первоначальный расчет
    calculateBalance()

    return () => {
      window.removeEventListener('transactions-changed', handleUpdate)
      window.removeEventListener('pending-updated', handleUpdate)
    }
  }, [calculateBalance])

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

  return (
    <Box p={2}>
      <DateRangePicker onDateChange={handleDateChange} />

      <Box
        sx={{
          mt: 3,
          mb: 2,
          display: 'flex',
          gap: 1,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Период:
        </Typography>
        <Chip
          label={`С ${formatDate(tempFrom)}`}
          color={tempFrom ? 'primary' : 'default'}
          size="small"
        />
        <Chip
          label={`По ${formatDate(tempTo)}`}
          color={tempTo ? 'primary' : 'default'}
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
        <Button size="small" variant="outlined" onClick={handleReset}>
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
