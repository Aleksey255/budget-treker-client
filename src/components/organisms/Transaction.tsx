import {
  Button,
  List,
  ListItem,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material'
import { useState } from 'react'
import { CustomSelect } from '../molecules/CustomSelect'
import {
  useAddTransactionMutation,
  useGetCategoriesQuery,
  useGetTransactionsQuery,
} from '@/store/apiSlice'
import type { NewTransaction } from '@/types/transaction'

export const Transaction = () => {
  const { data: transactions = [] } = useGetTransactionsQuery()
  const { data: categories = [] } = useGetCategoriesQuery()
  const [addTransaction] = useAddTransactionMutation()
  const [newTransaction, setNewTransaction] = useState<NewTransaction>({
    type: 'expense',
    amount: 0,
    categoryId: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  })

  const handleSubmit = async () => {
    if (!newTransaction.amount || !newTransaction.categoryId) {
      alert('Заполните сумму и категорию')
      return
    }

    await addTransaction(newTransaction).unwrap() // ← автоматом: refetch reports + transactions

    setNewTransaction({
      type: 'expense',
      amount: 0,
      categoryId: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
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
      <List sx={{ maxHeight: 300, overflow: 'auto', width: '100%' }}>
        {transactions.map(item => (
          <ListItem key={item._id}>
            {item.type === 'income' ? '📥 Доход' : '📤 Расход'} | {item.amount}{' '}
            ₽ | {item.description || 'Без описания'} |{' '}
            {new Date(item.date).toLocaleDateString('ru-RU')}
          </ListItem>
        ))}
      </List>
      <CustomSelect
        label="Категория"
        width={200}
        name="categoryId"
        value={newTransaction.categoryId}
        onChange={e =>
          setNewTransaction({ ...newTransaction, categoryId: e.target.value })
        }
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
      <TextField
        label="Дата"
        variant="outlined"
        name="date"
        id="date"
        type="date"
        value={newTransaction.date}
        onChange={e =>
          setNewTransaction({ ...newTransaction, date: e.target.value })
        }
        fullWidth
      />

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
