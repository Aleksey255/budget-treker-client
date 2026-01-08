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

  const [selectedId, setSelectedId] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [open, setOpen] = useState(false)
  const [editName, setEditName] = useState('')

  const selectedCategory =
    categories.find(cat => cat._id === selectedId) ?? null

  const handleOpen = () => {
    if (selectedCategory) {
      setEditName(selectedCategory.name)
      console.log(selectedCategory.name)
      setOpen(true)
    }
  }

  const handleClose = () => {
    setOpen(false)
    setEditName('')
  }

  const handleSaveEdit = async (newName: string) => {
    if (newName.trim() && selectedId) {
      await updateItem(selectedId, { name: newName.trim() })
    }
    handleClose()
  }

  const handleAddItem = async () => {
    const trimmed = newCategory.trim()
    if (trimmed) {
      await addItem({ name: trimmed })
      setNewCategory('')
    }
  }

  const handleChange = (e: SelectChangeEvent<string>) => {
    setSelectedId(e.target.value)
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
        value={selectedId}
        onChange={handleChange}
      >
        <MenuItem value="">— Не выбрано —</MenuItem>
        {categories ? (
          categories.map(item => (
            <MenuItem key={item._id} value={item._id}>
              {item.name}
            </MenuItem>
          ))
        ) : (
          <MenuItem disabled>Загрузка...</MenuItem>
        )}
      </CustomSelect>
      {selectedId && selectedCategory && (
        <div>
          <IconButton
            size="small"
            color="error"
            onClick={() => {
              deleteItem(selectedId)
              setSelectedId('')
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
        initialValue={editName}
        onChange={setEditName}
      />

      <TextField
        label="Новая категория"
        variant="outlined"
        value={newCategory}
        onChange={e => setNewCategory(e.target.value)}
      />

      <Button
        variant="outlined"
        onClick={handleAddItem}
        disabled={!newCategory.trim()}
      >
        Добавить
      </Button>
    </Stack>
  )
}
