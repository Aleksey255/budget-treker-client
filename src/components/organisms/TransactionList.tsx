import {
  Box,
  IconButton,
  List,
  Paper,
  Typography,
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
} from '@mui/material'
import { Close, Edit } from '@mui/icons-material'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { RadialTransactionChart } from '../molecules/RadialTransactionChart'
import { getCategoryName, type Transaction } from '@/types/transaction'
import { useDateFilter, formatDateForQuery } from '@/context/DateFilterContext'
import { AddTransaction } from '../molecules/AddTransaction'

export const TransactionList = () => {
  const { dateRange } = useDateFilter()

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isHovered, setIsHovered] = useState<string | null>(null)
  const [editingTx, setEditingTx] = useState<Transaction | null>(null)

  // Загрузка при изменении глобального фильтра
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true)
        setError(null)
        setHasMore(true)

        let query = supabase
          .from('transactions')
          .select(
            `
            id, type, amount, description, date, category_id,
            categories (name)
          `
          )
          .order('date', { ascending: false })

        const startDate = formatDateForQuery(dateRange.from, false)
        const endDate = formatDateForQuery(dateRange.to, true)

        if (startDate) query = query.gte('date', startDate)
        if (endDate) query = query.lte('date', endDate)

        const { data, error } = await query

        if (error) throw error

        setTransactions((data as Transaction[]) || [])
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Ошибка загрузки транзакций'
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactions()

    const handleUpdate = () => fetchTransactions()
    window.addEventListener('transactions-changed', handleUpdate)

    return () => {
      window.removeEventListener('transactions-changed', handleUpdate)
    }
  }, [dateRange.from, dateRange.to]) // 👈 Зависит от глобального фильтра

  // Подгрузка более старых транзакций
  const handleLoadMore = async () => {
    if (transactions.length === 0) return

    setIsLoadingMore(true)
    try {
      const oldestDate = transactions[transactions.length - 1].date

      let query = supabase
        .from('transactions')
        .select(
          `id, type, amount, description, date, category_id, categories (name)`
        )
        .lte('date', oldestDate)
        .order('date', { ascending: false })
        .limit(30)

      // Сохраняем нижнюю границу фильтра
      const startDate = formatDateForQuery(dateRange.from, false)
      if (startDate) query = query.gte('date', startDate)

      const { data, error } = await query

      if (error) throw error

      if (data && data.length > 0) {
        const existingIds = new Set(transactions.map(t => t.id))
        const newTransactions = (data as Transaction[]).filter(
          t => !existingIds.has(t.id)
        )

        if (newTransactions.length > 0) {
          setTransactions(prev => [...prev, ...newTransactions])
        } else {
          setHasMore(false)
        }
      } else {
        setHasMore(false)
      }
    } catch (err) {
      console.error('Ошибка при загрузке:', err)
    } finally {
      setIsLoadingMore(false)
    }
  }

  const handleDelete = async (id: string) => {
    const previousTransactions = [...transactions]
    setTransactions(prev => prev.filter(tx => tx.id !== id))

    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
      if (error) throw error
    } catch (err) {
      setTransactions(previousTransactions)
      const message =
        err instanceof Error ? err.message : 'Не удалось удалить транзакцию'
      alert(`Ошибка: ${message}`)
    }
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    )
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: 3,
        width: '100%',
        alignItems: 'flex-start',
      }}
    >
      <Box
        sx={{
          flex: 1,
          order: { xs: 1, md: 0 },
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <List
          sx={{
            maxHeight: { xs: 300, md: 1000 },
            overflow: 'auto',
            p: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
          }}
        >
          {transactions.length === 0 && (
            <Typography color="text.secondary" sx={{ p: 2 }}>
              Транзакций за выбранный период нет.
            </Typography>
          )}

          {transactions.map(item => {
            const categoryName = getCategoryName(item)

            return (
              <Paper
                key={item.id}
                onMouseEnter={() => setIsHovered(item.id)}
                onMouseLeave={() => setIsHovered(null)}
                component={Box}
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  p: 1.5,
                  mb: 1,
                  borderRadius: 2,
                  boxShadow: 1,
                  bgcolor: 'background.paper',
                  transition: 'box-shadow 0.2s ease, transform 0.1s ease',
                  '&:hover': { boxShadow: 3, transform: 'translateY(-1px)' },
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 1,
                    alignItems: 'center',
                    width: '100%',
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color:
                        item.type === 'income' ? 'success.main' : 'error.main',
                      minWidth: '80px',
                    }}
                  >
                    {item.type === 'income' ? '📥 Доход' : '📤 Расход'}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ minWidth: '120px' }}
                  >
                    {categoryName}
                  </Typography>

                  <Typography
                    variant="body2"
                    fontWeight="bold"
                    color="text.primary"
                  >
                    {item.amount.toLocaleString('ru-RU')} ₽
                  </Typography>

                  {item.description && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontStyle: 'italic', flex: 1 }}
                    >
                      "{item.description}"
                    </Typography>
                  )}

                  <Typography
                    variant="body2"
                    color="text.disabled"
                    sx={{ minWidth: '90px', textAlign: 'right' }}
                  >
                    {new Date(item.date).toLocaleDateString('ru-RU', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </Typography>

                  {/* Кнопка Редактировать */}
                  <IconButton
                    size="small"
                    onClick={() => setEditingTx(item)}
                    title="Изменить транзакцию"
                    sx={{
                      opacity: isHovered === item.id ? 1 : 0,
                      color: 'white',
                      visibility: isHovered === item.id ? 'visible' : 'hidden',
                      transition: 'opacity 0.2s ease',
                    }}
                  >
                    <Edit fontSize="small" />
                  </IconButton>

                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(item.id)}
                    title="Удалить"
                    sx={{
                      opacity: isHovered === item.id ? 1 : 0,
                      visibility: isHovered === item.id ? 'visible' : 'hidden',
                      transition: 'opacity 0.2s ease',
                    }}
                  >
                    <Close fontSize="small" />
                  </IconButton>
                </Box>
              </Paper>
            )
          })}
        </List>

        {hasMore && transactions.length > 0 && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mt: 2,
              width: '100%',
            }}
          >
            <Button
              variant="outlined"
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              startIcon={isLoadingMore ? <CircularProgress size={20} /> : null}
              sx={{ minWidth: '250px' }}
            >
              {isLoadingMore
                ? 'Загрузка...'
                : 'Показать более старые транзакции'}
            </Button>
          </Box>
        )}
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          width: { xs: '100%', md: '40%' },
          minWidth: '250px',
        }}
      >
        <RadialTransactionChart transactions={transactions} type="expense" />
        <RadialTransactionChart transactions={transactions} type="income" />
      </Box>
      {/* Диалог редактирования/добавления */}
      <Dialog
        open={!!editingTx}
        onClose={() => setEditingTx(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogContent>
          {editingTx && (
            <AddTransaction
              editData={editingTx}
              onClose={() => setEditingTx(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  )
}
