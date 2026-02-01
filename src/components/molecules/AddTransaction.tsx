import {
  Button,
  MenuItem,
  Stack,
  TextField,
  type SelectChangeEvent,
} from '@mui/material'
import { useState } from 'react'
import { CustomSelect } from './CustomSelect'
import {
  useAddTransactionMutation,
  useGetCategoriesQuery,
} from '@/store/apiSlice'
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { ru } from 'date-fns/locale'

export const AddTransaction = () => {
  const { data: categories = [] } = useGetCategoriesQuery()
  const [addTransaction] = useAddTransactionMutation()
  const [newTransaction, setNewTransaction] = useState<{
    type: 'income' | 'expense'
    amount: number
    categoryId: string
    categoryName: string
    description?: string
    date: Date | null
  }>({
    type: 'expense',
    amount: 0,
    categoryId: '',
    categoryName: '',
    description: '',
    date: new Date(),
  })

  const handleSubmit = async () => {
    if (
      !newTransaction.amount ||
      !newTransaction.categoryId ||
      !newTransaction.categoryName ||
      !newTransaction.date
    ) {
      alert('Заполните сумму и категорию')
      return
    }

    const transactionToSend = {
      ...newTransaction,
      date: newTransaction.date.toISOString().split('T')[0], // ← строка для API
    }

    await addTransaction(transactionToSend).unwrap()

    // Сброс: дата как Date
    setNewTransaction({
      type: 'expense',
      amount: 0,
      categoryId: '',
      categoryName: '',
      description: '',
      date: new Date(),
    })
  }
  const selectCategory = (e: SelectChangeEvent<string>) => {
    const selectedId = e.target.value
    const category = categories.find(cat => cat._id === selectedId)

    setNewTransaction({
      ...newTransaction,
      categoryId: selectedId,
      categoryName: category ? category.name : '', // ✅ Правильное имя
    })
  }

  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{
        alignItems: 'center',
        flexWrap: 'wrap',
        p: 2,
      }}
    >
      <CustomSelect
        label="Категория"
        width={200}
        name="categoryId"
        value={newTransaction.categoryId}
        onChange={selectCategory}
      >
        <MenuItem value="">— Выберите —</MenuItem>
        {categories.map(cat => (
          <MenuItem key={cat._id} value={cat._id}>
            {cat.name}
          </MenuItem>
        ))}
      </CustomSelect>
      <CustomSelect
        label="Тип"
        width={200}
        name="type"
        value={newTransaction.type}
        onChange={e =>
          setNewTransaction({
            ...newTransaction,
            type: e.target.value as 'income' | 'expense',
          })
        }
      >
        <MenuItem value="income">Доход</MenuItem>
        <MenuItem value="expense">Расход</MenuItem>
      </CustomSelect>
      <TextField
        label="Сумма"
        variant="outlined"
        type="number"
        name="amount"
        id="amount"
        value={newTransaction.amount}
        onChange={e =>
          setNewTransaction({ ...newTransaction, amount: +e.target.value || 0 })
        }
        fullWidth
      />

      <TextField
        label="Описание"
        variant="outlined"
        name="description"
        id="description"
        value={newTransaction.description}
        onChange={e =>
          setNewTransaction({ ...newTransaction, description: e.target.value })
        }
        fullWidth
      />
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
        <DesktopDatePicker
          sx={{ mr: 2 }}
          label="Дата"
          value={newTransaction.date}
          onChange={newValue =>
            setNewTransaction({ ...newTransaction, date: newValue })
          }
          slotProps={{
            textField: { fullWidth: false },
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
      >
        Добавить транзакцию
      </Button>
    </Stack>
  )
}
