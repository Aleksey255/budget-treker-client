import axios from 'axios'
import { useEffect, useState } from 'react'
import { API_URL } from '../services/apiUrl'
import { Button, IconButton, MenuItem, Stack, TextField } from '@mui/material'
import { Close, Edit } from '@mui/icons-material'
import { CustomSelect } from './molecules/CustomSelect'
import { CustomModal } from './molecules/CustomModal'
import type { Categories } from '../types/category'
import type { SelectChangeEvent } from '@mui/material'

export const Category = () => {
  const [categories, setCategories] = useState<Categories[]>([])
  const [selectedId, setSelectedId] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [newCategory, setNewCategory] = useState<string>('')
  const [open, setOpen] = useState(false)

  const handleOpen = () => setOpen(true)
  const handleClose = () => {
    setOpen(false)
    setSelectedCategory('')
    setSelectedId('')
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      const response = await axios.get<Categories[]>(`${API_URL}/categories`)
      setCategories(response.data)
    } catch (error) {
      console.error('Ошибка при получении данных:', error)
    }
  }

  const addItem = async () => {
    if (newCategory.trim()) {
      try {
        const response = await axios.post<Categories>(`${API_URL}/categories`, {
          name: newCategory,
        })
        setCategories([...categories, response.data])
        setNewCategory('')
      } catch (error) {
        console.error('Ошибка при добавлении данных:', error)
      }
    }
  }
  const deleteItem = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/categories/${id}`)
      setCategories(categories.filter(item => item._id !== id))
    } catch (error) {
      console.error('Ошибка при удалении данных:', error)
    }
  }

  const putItem = async (id: string, name: string) => {
    try {
      await axios.put(`${API_URL}/categories/${id}`, { name })
      fetchItems()
    } catch (error) {
      console.error('Ошибка при обновлении данных:', error)
    }
  }

  const handleChange = (e: SelectChangeEvent<string>) => {
    const categoryName = e.target.value as string
    const category = categories.find(cat => cat.name === categoryName)
    if (category) {
      setSelectedId(category._id)
      setSelectedCategory(categoryName)
    }
  }

  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{
        alignItems: 'center',
      }}
    >
      <CustomSelect
        label="Выберите категорию"
        width={200}
        value={selectedCategory}
        onChange={handleChange}
      >
        {categories.map(item => (
          <MenuItem key={item._id} value={item.name}>
            {item.name}
          </MenuItem>
        ))}
      </CustomSelect>
      {selectedCategory && (
        <div>
          <IconButton
            size="small"
            color="error"
            onClick={() => {
              setSelectedCategory('')
              deleteItem(selectedId)
            }}
            title="Удалить выбранную категорию"
          >
            <Close />
          </IconButton>
          <IconButton
            size="small"
            onClick={handleOpen}
            title="Изменить выбранную категорию"
          >
            <Edit />
          </IconButton>
        </div>
      )}
      <CustomModal
        open={open}
        handleClose={handleClose}
        onSave={async newName => {
          if (newName.trim()) {
            await putItem(selectedId, newName)
          }
          handleClose()
        }}
        title="Изменить категорию"
        label="Название категории"
        initialValue={selectedCategory}
      />

      <TextField
        label="Новая категория"
        variant="outlined"
        value={newCategory}
        onChange={e => setNewCategory(e.target.value)}
      />

      <Button variant="outlined" onClick={addItem}>
        Добавить
      </Button>
    </Stack>
  )
}
