import { useState } from 'react'

import type { SelectChangeEvent } from '@mui/material'

import { Button, IconButton, MenuItem, Stack, TextField } from '@mui/material'
import { Close, Edit } from '@mui/icons-material'
import { CustomModal } from '../molecules/CustomModal'
import { CustomSelect } from '../molecules/CustomSelect'
import {
  useGetCategoriesQuery,
  useAddCategoryMutation,
  useDeleteCategoryMutation,
  useUpdateCategoryMutation,
} from '@/store/apiSlice'

export const Category = () => {
  const { data: categories = [], isLoading } = useGetCategoriesQuery()
  const [addCategory] = useAddCategoryMutation()
  const [deleteCategory] = useDeleteCategoryMutation()
  const [updateCategory] = useUpdateCategoryMutation()

  const [selectedId, setSelectedId] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [open, setOpen] = useState(false)
  const [editName, setEditName] = useState('')

  const selectedCategory =
    categories.find(cat => cat._id === selectedId) ?? null

  const handleOpen = () => {
    if (selectedCategory) {
      setEditName(selectedCategory.name)
      setOpen(true)
    }
  }

  const handleClose = () => {
    setOpen(false)
    setEditName('')
  }

  const handleSaveEdit = async (newName: string) => {
    if (newName.trim() && selectedId) {
      await updateCategory({ id: selectedId, name: newName.trim() }).unwrap()
    }
    handleClose()
  }

  const handleAddItem = async () => {
    const trimmed = newCategory.trim()
    if (trimmed) {
      await addCategory({ name: trimmed }).unwrap()
      setNewCategory('')
    }
  }

  const handleDelete = async () => {
    if (selectedId) {
      await deleteCategory(selectedId).unwrap()
      setSelectedId('')
    }
  }

  const handleChange = (e: SelectChangeEvent<string>) => {
    setSelectedId(e.target.value)
  }

  if (isLoading) return <p>Загрузка категорий...</p>

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
            onClick={handleDelete}
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
        name="newCategory"
        id="new-category-input"
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
