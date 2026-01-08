import { useApi } from '@/hooks/useApi'
import type { Transactions, NewTransaction } from '@/types/transaction'
import {
  Button,
  List,
  ListItem,
  MenuItem,
  Stack,
  TextField,
  type SelectChangeEvent,
} from '@mui/material'
import { useState, type ChangeEvent } from 'react'
import { CustomSelect } from '../molecules/CustomSelect'
import type { Categories } from '@/types/category'

export const Transaction = () => {
  const { data: transactions, addItem } = useApi<Transactions>('/transactions')
  const { data: categories } = useApi<Categories>('/categories')
  const [newTransaction, setNewTransaction] = useState<NewTransaction>({
    type: 'expense',
    amount: 0,
    categoryId: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  })

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewTransaction({
      ...newTransaction,
      [name]: name === 'amount' ? Number(value) || 0 : value,
    })
  }

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target
    setNewTransaction({
      ...newTransaction,
      [name]: value,
    })
  }

  const handleAddItem = async () => {
    if (!newTransaction.amount || !newTransaction.categoryId) {
      alert('Заполните сумму и выберите категорию')
      return
    }
    await addItem(newTransaction)
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
        label="Тип"
        width={200}
        name="type"
        value={newTransaction.type}
        onChange={handleSelectChange}
      >
        <MenuItem value="income">Доход</MenuItem>
        <MenuItem value="expense">Расход</MenuItem>
      </CustomSelect>
      <TextField
        label="Сумма"
        variant="outlined"
        type="number"
        name="amount"
        value={newTransaction.amount}
        onChange={handleInputChange}
        fullWidth
      />
      <CustomSelect
        label="Категория"
        width={200}
        name="categoryId"
        value={newTransaction.categoryId}
        onChange={handleSelectChange}
      >
        <MenuItem value="">— Выберите —</MenuItem>
        {categories.map(cat => (
          <MenuItem key={cat._id} value={cat._id}>
            {cat.name}
          </MenuItem>
        ))}
      </CustomSelect>
      <TextField
        label="Описание"
        variant="outlined"
        name="description"
        value={newTransaction.description}
        onChange={handleInputChange}
        fullWidth
      />
      <TextField
        label="Дата"
        variant="outlined"
        name="date"
        type="date"
        value={newTransaction.date}
        onChange={handleInputChange}
        fullWidth
      />

      <Button
        variant="contained"
        color="primary"
        onClick={handleAddItem}
        sx={{ mt: 2 }}
      >
        Добавить транзакцию
      </Button>
    </Stack>
  )
}
