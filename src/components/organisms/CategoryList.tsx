import { useState } from 'react'

// import type { SelectChangeEvent } from '@mui/material'

import {
  Box,
  Button,
  IconButton,
  List,
  Paper,
  TextField,
  Typography,
} from '@mui/material'
import { Close, Edit } from '@mui/icons-material'
import { CustomModal } from '../molecules/CustomModal'
import {
  useGetCategoriesQuery,
  useAddCategoryMutation,
  useDeleteCategoryMutation,
  useUpdateCategoryMutation,
} from '@/store/apiSlice'
export const CategoryList = () => {
  const { data: categories = [], isLoading } = useGetCategoriesQuery()
  const [addCategory] = useAddCategoryMutation()
  const [deleteCategory] = useDeleteCategoryMutation()
  const [updateCategory] = useUpdateCategoryMutation()

  const [editCategory, setEditCategory] = useState({
    id: '',
    name: '',
  })
  const [newCategory, setNewCategory] = useState('')
  const [open, setOpen] = useState(false)
  const [isHovered, setIsHovered] = useState<string | null>(null)

  // Сортируем: от самых старых к самым новым (по дате)
  const sortedCategories = [...categories].sort((a, b) =>
    a.name.localeCompare(b.name)
  )

  const handleOpen = (id: string, name: string) => {
    setEditCategory({
      id,
      name,
    })
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const handleAddItem = async () => {
    const trimmed = newCategory.trim()
    if (trimmed) {
      await addCategory({ name: trimmed }).unwrap()
      setNewCategory('')
    }
  }

  const handleSaveEdit = async () => {
    const trimmed = editCategory.name.trim()
    if (trimmed && editCategory.id) {
      await updateCategory({ id: editCategory.id, name: trimmed }).unwrap()
    }
    handleClose()
  }

  const handleDelete = async (id: string) => {
    await deleteCategory(id).unwrap()
  }

  if (isLoading)
    return <Typography component="p">Загрузка категорий...</Typography>

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' }, // На мобильных — в столбик, на десктопе — рядом
        gap: 3,
        width: '100%',
        alignItems: 'flex-start',
      }}
    >
      <List
        sx={{
          flex: 1,
          minWidth: 0,
          p: 0, // убираем отступы по умолчанию
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start', // ← ключевое: выравниваем слева
        }}
      >
        {sortedCategories.map(item => {
          return (
            <Paper
              onMouseEnter={() => setIsHovered(item._id)}
              onMouseLeave={() => setIsHovered(null)}
              component={Box}
              key={item._id}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',

                gap: 1,
                p: 1.5,
                mb: 1,
                borderRadius: 2,
                boxShadow: 1,
                bgcolor: 'background.paper',
                transition: 'box-shadow 0.2s ease, transform 0.1s ease',
                '&:hover': {
                  boxShadow: 3,
                  transform: 'translateY(-1px)',
                },
                maxWidth: '100%',
              }}
            >
              {/* Основная информация */}
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 1,
                  alignItems: 'center',
                  whiteSpace: 'nowrap',
                }}
              >
                {/* Категория */}
                <Typography variant="body2" color="text.secondary">
                  {item.name}
                </Typography>

                {/* Кнопка удаления — появляется при наведении */}
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleDelete(item._id)}
                  title="Удалить категорию"
                  sx={{
                    opacity: isHovered === item._id ? 1 : 0,
                    visibility: isHovered === item._id ? 'visible' : 'hidden',
                    transition: 'opacity 0.2s ease',
                  }}
                >
                  <Close fontSize="small" />
                </IconButton>
                {/* Кнопка изменения — появляется при наведении */}
                <IconButton
                  size="small"
                  onClick={() => handleOpen(item._id, item.name)}
                  title="Изменить выбранную категорию"
                  sx={{
                    opacity: isHovered === item._id ? 1 : 0,
                    visibility: isHovered === item._id ? 'visible' : 'hidden',
                    transition: 'opacity 0.2s ease',
                  }}
                >
                  <Edit fontSize="small" />
                </IconButton>
              </Box>
            </Paper>
          )
        })}
      </List>
      <Box
        sx={{
          flex: 1,
          display: 'flex',

          gap: 2,
        }}
      >
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
      </Box>

      <CustomModal
        open={open}
        onClose={handleClose}
        title="Изменить категорию"
        onConfirm={handleSaveEdit}
        confirmText="Сохранить"
      >
        <TextField
          label="Название категории"
          variant="outlined"
          value={editCategory.name}
          onChange={e =>
            setEditCategory(prev => ({
              ...prev,
              name: e.target.value,
            }))
          }
          fullWidth
          autoFocus
        />
      </CustomModal>
    </Box>
  )
}
