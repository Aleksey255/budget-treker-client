import {
  Button,
  MenuItem,
  Stack,
  TextField,
  Alert,
  Autocomplete,
  type SelectChangeEvent,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { CustomSelect } from './CustomSelect'
import { supabase } from '@/lib/supabaseClient'
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { ru } from 'date-fns/locale'
import { type Transaction } from '@/types/transaction'

interface Category {
  id: string
  name: string
  type: 'income' | 'expense' | 'both'
}

interface AddTransactionProps {
  onClose: () => void
  editData?: Transaction | null // <-- НОВЫЙ ПРОП для редактирования
}

export const AddTransaction = ({ onClose, editData }: AddTransactionProps) => {
  const [categories, setCategories] = useState<Category[]>([])
  const [descriptionOptions, setDescriptionOptions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Инициализируем форму: если есть editData, заполняем её, иначе пустыми значениями
  const [newTransaction, setNewTransaction] = useState(() => {
    if (editData) {
      return {
        type: editData.type,
        amount: editData.amount.toString(),
        categoryId: editData.category_id || '',
        description: editData.description || '',
        date: new Date(editData.date),
      }
    }
    return {
      type: 'expense' as 'income' | 'expense',
      amount: '',
      categoryId: '',
      description: '',
      date: new Date(),
    }
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: catData, error: catError } = await supabase
          .from('categories')
          .select('id, name, type')
          .order('name')
        if (catError) throw catError
        setCategories(catData || [])

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
        setError(err instanceof Error ? err.message : 'Ошибка загрузки данных')
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(',', '.')
    if (value === '') {
      setNewTransaction({ ...newTransaction, amount: '' })
      return
    }
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      setNewTransaction({ ...newTransaction, amount: value })
    }
  }

  const handleSubmit = async () => {
    setError(null)
    setIsSubmitting(true)

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()
      if (authError || !user) throw new Error('Пользователь не авторизован')

      const amountNum = parseFloat(newTransaction.amount)
      if (
        !newTransaction.amount ||
        isNaN(amountNum) ||
        !newTransaction.categoryId ||
        !newTransaction.date
      ) {
        throw new Error('Заполните сумму, категорию и дату')
      }

      const payload = {
        type: newTransaction.type,
        amount: amountNum,
        category_id: newTransaction.categoryId || null,
        description: newTransaction.description || null,
        date: newTransaction.date.toISOString(),
      }

      let error
      if (editData) {
        // РЕЖИМ РЕДАКТИРОВАНИЯ
        const res = await supabase
          .from('transactions')
          .update(payload)
          .eq('id', editData.id)
        error = res.error
      } else {
        // РЕЖИМ СОЗДАНИЯ
        const res = await supabase
          .from('transactions')
          .insert({ ...payload, user_id: user.id })
        error = res.error
      }

      if (error) throw error

      window.dispatchEvent(new Event('transactions-changed'))
      onClose()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Не удалось сохранить транзакцию'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectCategory = (e: SelectChangeEvent<string>) => {
    setNewTransaction({ ...newTransaction, categoryId: e.target.value })
  }

  return (
    <Stack
      direction="column"
      spacing={2}
      sx={{ alignItems: 'center', flexWrap: 'wrap', p: 2 }}
    >
      {error && (
        <Alert severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      )}

      <CustomSelect
        sx={{ width: { xs: '100%', sm: 246 } }}
        label="Тип операции"
        name="type"
        value={newTransaction.type}
        onChange={e =>
          setNewTransaction({
            ...newTransaction,
            type: e.target.value as 'income' | 'expense',
            categoryId: '',
          })
        }
      >
        <MenuItem value="income">📥 Доход</MenuItem>
        <MenuItem value="expense">📤 Расход</MenuItem>
      </CustomSelect>

      <CustomSelect
        sx={{ width: { xs: '100%', sm: 246 } }}
        label="Категория"
        name="categoryId"
        value={newTransaction.categoryId}
        onChange={selectCategory}
        disabled={isLoading}
      >
        <MenuItem value="">— Выберите —</MenuItem>
        {categories.map(cat => (
          <MenuItem key={cat.id} value={cat.id}>
            {cat.name}{' '}
            {cat.type === 'both'
              ? '(Универс.)'
              : cat.type === 'income'
                ? '(Доход)'
                : '(Расход)'}
          </MenuItem>
        ))}
      </CustomSelect>

      <TextField
        sx={{ width: { xs: '100%', sm: 246 } }}
        label="Сумма"
        variant="outlined"
        type="text"
        value={newTransaction.amount}
        onChange={handleChange}
        slotProps={{
          input: {
            inputMode: 'decimal',
            inputProps: { pattern: '[0-9]*(\\.?[0-9]{1,2})?' },
          },
        }}
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
          if (['-', 'e', 'E', '+', 'ArrowUp', 'ArrowDown'].includes(e.key))
            e.preventDefault()
        }}
        fullWidth
      />

      <Autocomplete
        freeSolo
        options={descriptionOptions}
        value={newTransaction.description}
        onInputChange={(_event, newInputValue) =>
          setNewTransaction({ ...newTransaction, description: newInputValue })
        }
        sx={{ width: { xs: '100%', sm: 246 } }}
        renderInput={params => (
          <TextField
            {...params}
            label="Описание"
            variant="outlined"
          />
        )}
      />

      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
        <DesktopDatePicker
          label="Дата"
          value={newTransaction.date}
          onChange={newValue => {
            // Если пользователь очистил поле, оставляем текущую дату
            if (newValue !== null) {
              setNewTransaction({ ...newTransaction, date: newValue })
            }
          }}
          slotProps={{
            textField: {
              sx: { width: { xs: '100%', sm: 246 } },
              fullWidth: false,
            },
          }}
          format="dd.MM.yyyy"
          disableFuture
        />
      </LocalizationProvider>

      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        sx={{ mt: 2 }}
        disabled={isSubmitting || isLoading}
      >
        {isSubmitting
          ? 'Сохранение...'
          : editData
            ? 'Сохранить изменения'
            : 'Добавить транзакцию'}
      </Button>
    </Stack>
  )
}
