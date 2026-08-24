import {
  Box,
  IconButton,
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
  InputAdornment,
  TextField,
  Autocomplete,
  Dialog,
  DialogContent,
} from '@mui/material'
import { Close, Edit, Search, Clear } from '@mui/icons-material'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { RadialTransactionChart } from '../molecules/RadialTransactionChart'
import { getCategoryName, type Transaction } from '@/types/transaction'
import { useDateFilter, formatDateForQuery } from '@/context/DateFilterContext'
import { AddTransaction } from '../molecules/AddTransaction'

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
  const [inputDescription, setInputDescription] = useState<string>('') // Для ввода в Autocomplete
  const [searchDescription, setSearchDescription] = useState<string>('') // Для реального запроса (с debounce)

  // 1. Загрузка категорий и вариантов описаний при монтировании
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Категории
        const { data: catData } = await supabase
          .from('categories')
          .select('id, name, type')
          .order('name')
        if (catData) setCategories(catData)

        // Уникальные описания для автокомплита (последние 100)
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

  // 2. Debounce для поиска по описанию (ждем 500мс после окончания ввода)
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDescription(inputDescription)
    }, 500)
    return () => clearTimeout(timer)
  }, [inputDescription])

  // 3. Загрузка транзакций при изменении дат или фильтров
  useEffect(() => {
    const fetchTransactions = async () => {
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

        if (filterCategoryId) {
          query = query.eq('category_id', filterCategoryId)
        }

        if (searchDescription.trim()) {
          query = query.ilike('description', `%${searchDescription.trim()}%`)
        }

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

  // 4. Подгрузка более старых транзакций
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

  const isFiltered = filterCategoryId !== '' || searchDescription.trim() !== ''

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
        {/* 👇 ПАНЕЛЬ ФИЛЬТРОВ С AUTOCOMPLETE */}
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
              sx={{
                width: { xs: '100%', sm: 'auto' },
                minWidth: { sm: 140 },
              }}
            >
              Сбросить
            </Button>
          )}
        </Paper>

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
              {isFiltered
                ? 'Транзакции не найдены по заданным фильтрам.'
                : 'Транзакций за выбранный период нет.'}
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
                  transition:
                    'box-shadow 0.2s ease, transform 0.1s ease, background-color 0.2s ease',
                  '&:hover': {
                    boxShadow: 3,
                    transform: 'translateY(-1px)',
                    bgcolor: 'grey.800',
                    color: 'white',
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
                    {item.amount.toLocaleString('ru-RU')} ₽
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

                  <IconButton
                    size="small"
                    onClick={() => setEditingTx(item)}
                    title="Изменить"
                    sx={{
                      color: 'white',
                      opacity: isHovered === item.id ? 1 : 0,
                      visibility: isHovered === item.id ? 'visible' : 'hidden',
                      transition: 'opacity 0.2s ease',
                    }}
                  >
                    <Edit fontSize="small" />
                  </IconButton>

                  <IconButton
                    size="small"
                    onClick={() => handleDelete(item.id)}
                    title="Удалить"
                    sx={{
                      color: 'white',
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
