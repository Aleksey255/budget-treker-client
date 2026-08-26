import {
  Box,
  List,
  Paper,
  Typography,
  Alert,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Autocomplete,
  Dialog,
  DialogContent,
  InputAdornment,
} from '@mui/material'
import {
  Search,
  Clear,
  CloudOff,
  CheckCircle,
} from '@mui/icons-material'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { RadialTransactionChart } from '../molecules/RadialTransactionChart'
import { getCategoryName, type Transaction } from '@/types/transaction'
import { useDateFilter, formatDateForQuery } from '@/context/DateFilterContext'
import { AddTransaction } from '../molecules/AddTransaction'
import {
  getPendingTransactions,
  clearPendingTransactions,
  type LocalTransaction,
} from '@/utils/offlineStorage'
import { EditButton } from '../atoms/EditButton'
import { DeleteButton } from '../atoms/DeleteButton'

interface Category {
  id: string
  name: string
  type: 'income' | 'expense' | 'both'
}

export const TransactionList = () => {
  const { dateRange } = useDateFilter()

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [descriptionOptions, setDescriptionOptions] = useState<string[]>([])

  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isHovered, setIsHovered] = useState<string | null>(null)
  const [editingTx, setEditingTx] = useState<Transaction | null>(null)

  // Фильтры
  const [filterCategoryId, setFilterCategoryId] = useState<string>('')
  const [inputDescription, setInputDescription] = useState<string>('')
  const [searchDescription, setSearchDescription] = useState<string>('')

  // Оффлайн-транзакции
  const [pendingTransactions, setPendingTransactions] = useState<
    LocalTransaction[]
  >([])

  // 👇 НОВЫЙ ЭФФЕКТ: Слушаем обновление локальных транзакций
  useEffect(() => {
    const handlePendingUpdate = () => {
      // Читаем актуальные данные из localStorage и обновляем экран
      setPendingTransactions(getPendingTransactions())
    }

    window.addEventListener('pending-updated', handlePendingUpdate)

    // Также загружаем их при первом открытии страницы
    setPendingTransactions(getPendingTransactions())

    return () => {
      window.removeEventListener('pending-updated', handlePendingUpdate)
    }
  }, [])

  // 1. Загрузка локальных транзакций при монтировании
  useEffect(() => {
    setPendingTransactions(getPendingTransactions())
  }, [])

  // 2. Автоматическая синхронизация при появлении интернета
  useEffect(() => {
    const handleOnline = async () => {
      const pending = getPendingTransactions()
      if (pending.length === 0) return

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return

        const txsToSend = pending.map(tx => ({
          type: tx.type,
          amount: tx.amount,
          category_id: tx.category_id,
          description: tx.description || null,
          date: tx.date,
          user_id: user.id,
        }))

        const { error } = await supabase.from('transactions').insert(txsToSend)

        if (!error) {
          clearPendingTransactions()
          setPendingTransactions([])
          window.dispatchEvent(new Event('transactions-changed'))
          console.log('✅ Оффлайн-транзакции успешно синхронизированы!')
        }
      } catch (err) {
        console.error('Ошибка синхронизации:', err)
      }
    }

    window.addEventListener('online', handleOnline)
    if (navigator.onLine) handleOnline()

    return () => window.removeEventListener('online', handleOnline)
  }, [])

  // 3. Загрузка категорий и вариантов описаний
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const { data: catData } = await supabase
          .from('categories')
          .select('id, name, type')
          .order('name')
        if (catData) setCategories(catData)

        const { data: descData } = await supabase
          .from('transactions')
          .select('description')
          .not('description', 'is', null)
          .neq('description', '')
          .order('date', { ascending: false })
          .limit(100)

        if (descData) {
          const uniqueDescriptions = [
            ...new Set(descData.map(t => t.description).filter(Boolean)),
          ]
          setDescriptionOptions(uniqueDescriptions as string[])
        }
      } catch (err) {
        console.error('Ошибка загрузки данных для фильтров:', err)
      }
    }
    fetchInitialData()
  }, [])

  // 4. Debounce для поиска по описанию
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDescription(inputDescription)
    }, 500)
    return () => clearTimeout(timer)
  }, [inputDescription])

  // 5. Загрузка транзакций при изменении дат или фильтров
  useEffect(() => {
    const fetchTransactions = async () => {
      // Если нет интернета, не пытаемся загружать с сервера
      if (!navigator.onLine) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        setHasMore(true)

        let query = supabase
          .from('transactions')
          .select(
            `id, type, amount, description, date, category_id, categories (name)`
          )
          .order('date', { ascending: false })

        const startDate = formatDateForQuery(dateRange.from, false)
        const endDate = formatDateForQuery(dateRange.to, true)
        if (startDate) query = query.gte('date', startDate)
        if (endDate) query = query.lte('date', endDate)

        if (filterCategoryId) query = query.eq('category_id', filterCategoryId)
        if (searchDescription.trim())
          query = query.ilike('description', `%${searchDescription.trim()}%`)

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
    return () =>
      window.removeEventListener('transactions-changed', handleUpdate)
  }, [dateRange.from, dateRange.to, filterCategoryId, searchDescription])

  // 6. Подгрузка более старых транзакций
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

      const startDate = formatDateForQuery(dateRange.from, false)
      if (startDate) query = query.gte('date', startDate)
      if (filterCategoryId) query = query.eq('category_id', filterCategoryId)
      if (searchDescription.trim())
        query = query.ilike('description', `%${searchDescription.trim()}%`)

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
      alert(
        `Ошибка: ${err instanceof Error ? err.message : 'Не удалось удалить'}`
      )
    }
  }

  const handleClearFilters = () => {
    setFilterCategoryId('')
    setInputDescription('')
    setSearchDescription('')
  }

  // Объединяем локальные и серверные транзакции для отображения
  const displayTransactions: LocalTransaction[] = [
    ...pendingTransactions,
    ...transactions.filter(
      t => !pendingTransactions.some(p => p.tempId === t.id)
    ),
  ]

  const isFiltered = filterCategoryId !== '' || searchDescription.trim() !== ''

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
        {/* ПАНЕЛЬ ФИЛЬТРОВ */}
        <Paper
          sx={{
            p: 2,
            mb: 2,
            width: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            alignItems: 'stretch',
          }}
        >
          <Autocomplete
            freeSolo
            options={descriptionOptions}
            value={inputDescription}
            onInputChange={(_event, newInputValue) => {
              setInputDescription(newInputValue)
            }}
            renderInput={params => (
              <TextField
                {...params}
                label="Поиск по описанию"
                variant="outlined"
                size="small"
                fullWidth
                sx={{ width: '100%', minWidth: 'unset' }}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      <InputAdornment position="start">
                        <Search color="action" fontSize="small" />
                      </InputAdornment>
                      {params.InputProps.startAdornment}
                    </>
                  ),
                }}
              />
            )}
          />

          <FormControl
            size="small"
            sx={{ width: '100%', minWidth: 'unset', flex: { sm: 1 } }}
          >
            <InputLabel>Категория</InputLabel>
            <Select
              value={filterCategoryId}
              label="Категория"
              onChange={e => setFilterCategoryId(e.target.value)}
              sx={{ width: '100%' }}
            >
              <MenuItem value="">Все категории</MenuItem>
              {categories.map(cat => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {isFiltered && (
            <Button
              variant="outlined"
              size="small"
              onClick={handleClearFilters}
              startIcon={<Clear />}
              sx={{ width: { xs: '100%', sm: 'auto' }, minWidth: { sm: 140 } }}
            >
              Сбросить
            </Button>
          )}
        </Paper>

        {/* СПИСОК ТРАНЗАКЦИЙ */}
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
          {displayTransactions.length === 0 && (
            <Typography color="text.secondary" sx={{ p: 2 }}>
              {isFiltered
                ? 'Транзакции не найдены по заданным фильтрам.'
                : 'Транзакций за выбранный период нет.'}
            </Typography>
          )}

          {displayTransactions.map(item => {
            const categoryName = item.isPending
              ? (item as LocalTransaction).category_name ||
                'Неизвестная категория'
              : getCategoryName(item)
            const isPending = item.isPending
            const itemId = item.tempId || item.id

            return (
              <Paper
                key={itemId}
                onMouseEnter={() => setIsHovered(itemId)}
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
                  // Визуальные отличия для оффлайн-транзакций
                  opacity: isPending ? 0.7 : 1,
                  borderLeft: isPending ? '4px solid #FF9800' : 'none',
                  transition:
                    'box-shadow 0.2s ease, transform 0.1s ease, background-color 0.2s ease',
                  '&:hover': {
                    boxShadow: 3,
                    transform: 'translateY(-1px)',
                    bgcolor: isPending ? 'background.paper' : 'grey.800',
                    color: isPending ? 'inherit' : 'white',
                  },
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
                  {/* Иконка статуса синхронизации */}
                  {isPending ? (
                    <CloudOff
                      fontSize="small"
                      sx={{ color: 'warning.main', mr: 0.5 }}
                      titleAccess="Ожидает синхронизации"
                    />
                  ) : (
                    <CheckCircle
                      fontSize="small"
                      sx={{ color: 'success.main', mr: 0.5, opacity: 0 }}
                      titleAccess="Синхронизировано"
                    />
                  )}

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
                    sx={{ minWidth: '120px', color: 'inherit' }}
                  >
                    {categoryName}
                  </Typography>

                  <Typography
                    variant="body2"
                    fontWeight="bold"
                    sx={{ color: 'inherit' }}
                  >
                    {Number(item.amount).toLocaleString('ru-RU')} ₽
                  </Typography>

                  {item.description && (
                    <Typography
                      variant="body2"
                      sx={{ fontStyle: 'italic', flex: 1, color: 'inherit' }}
                    >
                      "{item.description}"
                    </Typography>
                  )}

                  <Typography
                    variant="body2"
                    sx={{
                      minWidth: '90px',
                      textAlign: 'right',
                      color: 'inherit',
                    }}
                  >
                    {new Date(item.date).toLocaleDateString('ru-RU', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </Typography>

                  {/* Кнопки действий (скрыты для оффлайн-записей) */}
                  {!isPending && (
                    <>
                      <EditButton
                        onClick={() => setEditingTx(item as Transaction)}
                        isVisible={isHovered === itemId}
                      />
                      <DeleteButton
                        onClick={() => handleDelete(item.id)}
                        isVisible={isHovered === itemId}
                      />
                    </>
                  )}
                </Box>
              </Paper>
            )
          })}
        </List>

        {hasMore && displayTransactions.length > 0 && (
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

      {/* ГРАФИКИ */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          width: { xs: '100%', md: '40%' },
          minWidth: '250px',
        }}
      >
        <RadialTransactionChart
          transactions={displayTransactions as Transaction[]}
          type="expense"
        />
        <RadialTransactionChart
          transactions={displayTransactions as Transaction[]}
          type="income"
        />
      </Box>

      {/* ДИАЛОГ РЕДАКТИРОВАНИЯ */}
      <Dialog
        open={!!editingTx}
        onClose={() => setEditingTx(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogContent>
          <AddTransaction
            editData={editingTx}
            onClose={() => setEditingTx(null)}
          />
        </DialogContent>
      </Dialog>
    </Box>
  )
}
