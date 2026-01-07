import { useState } from 'react'

import type { SelectChangeEvent } from '@mui/material'
import type { Categories } from '@/types/category'

import { Button, IconButton, MenuItem, Stack, TextField } from '@mui/material'
import { Close, Edit } from '@mui/icons-material'
import { CustomModal } from '../molecules/CustomModal'
import { CustomSelect } from '../molecules/CustomSelect'
import { useApi } from '@/hooks/useApi'

export const Category = () => {
  const {
    data: categories,
    addItem,
    deleteItem,
    updateItem,
  } = useApi<Categories>('/categories')
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

  const handleSaveEdit = async (newName: string) => {
    if (newName.trim() && selectedId) {
      await updateItem(selectedId, { name: newName })
    }
    handleClose()
  }

  const handleAddItem = async () => {
    if (newCategory.trim()) {
      await addItem({ name: newCategory })
      setNewCategory('')
    }
  }

  const handleChange = (e: SelectChangeEvent<string>) => {
    const categoryName = e.target.value
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
        {categories && Array.isArray(categories) ? (
          categories.map(item => (
            <MenuItem key={item._id} value={item.name}>
              {item.name}
            </MenuItem>
          ))
        ) : (
          <MenuItem disabled>Загрузка...</MenuItem>
        )}
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
        onSave={handleSaveEdit}
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

      <Button variant="outlined" onClick={handleAddItem}>
        Добавить
      </Button>
    </Stack>
  )
}
