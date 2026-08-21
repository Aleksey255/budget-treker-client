import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  IconButton,
  List,
  Paper,
  TextField,
  Typography,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Card,
  CardContent,
  Snackbar,
  Divider,
} from '@mui/material'
import {
  Close,
  Edit,
  Category as CategoryIcon,
  AddCircleOutline,
} from '@mui/icons-material'
import { CustomModal } from '../molecules/CustomModal'
import { supabase } from '@/lib/supabaseClient'

interface Category {
  id: string
  name: string
  type: 'income' | 'expense' | 'both'
}

export const CategoryList = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [newCategory, setNewCategory] = useState('')
  const [newCategoryType, setNewCategoryType] = useState<
    'income' | 'expense' | 'both'
  >('both')

  // 👇 ДОБАВЛЕНО: type в состояние редактирования
  const [editCategory, setEditCategory] = useState<{
    id: string
    name: string
    type: 'income' | 'expense' | 'both'
  }>({
    id: '',
    name: '',
    type: 'both',
  })

  const [openModal, setOpenModal] = useState(false)
  const [isHovered, setIsHovered] = useState<string | null>(null)

  const [snackbar, setSnackbar] = useState<{
    open: boolean
    message: string
    severity: 'success' | 'error'
  }>({
    open: false,
    message: '',
    severity: 'success',
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, type')
        .order('name')

      if (error) throw error
      setCategories(data || [])
    } catch (err) {
      showSnackbar(
        err instanceof Error ? err.message : 'Ошибка загрузки категорий',
        'error'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity })
  }

  const sortedCategories = [...categories].sort((a, b) =>
    a.name.localeCompare(b.name)
  )

  // 👇 ИЗМЕНЕНО: передаем весь объект item, а не только id и name
  const handleOpenEdit = (item: Category) => {
    setEditCategory({ id: item.id, name: item.name, type: item.type })
    setOpenModal(true)
  }

  const handleCloseModal = () => {
    setOpenModal(false)
    setEditCategory({ id: '', name: '', type: 'both' })
  }

  const handleAddItem = async () => {
    const trimmed = newCategory.trim()
    if (!trimmed) return

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()
      if (authError || !user) throw new Error('Пользователь не авторизован.')

      const { data, error } = await supabase
        .from('categories')
        .insert({ name: trimmed, type: newCategoryType, user_id: user.id })
        .select()
        .single()

      if (error) throw error

      setCategories(prev => [...prev, data])
      setNewCategory('')
      showSnackbar('Категория успешно добавлена', 'success')
    } catch (err) {
      showSnackbar(
        err instanceof Error ? err.message : 'Не удалось добавить категорию',
        'error'
      )
    }
  }

  // 👇 ИЗМЕНЕНО: обновляем и name, и type
  const handleSaveEdit = async () => {
    const trimmed = editCategory.name.trim()
    if (trimmed && editCategory.id) {
      try {
        const { error } = await supabase
          .from('categories')
          .update({
            name: trimmed,
            type: editCategory.type, // <-- Обновляем тип
          })
          .eq('id', editCategory.id)

         if (error) {
          console.error('❌ Детальная ошибка Supabase:', error) // <-- ДОБАВЛЕНО
          throw error
        }

        setCategories(prev =>
          prev.map(c =>
            c.id === editCategory.id
              ? { ...c, name: trimmed, type: editCategory.type }
              : c
          )
        )
        handleCloseModal()
        showSnackbar('Категория обновлена', 'success')
      } catch (err) {
        showSnackbar(
          err instanceof Error ? err.message : 'Не удалось обновить категорию',
          'error'
        )
      }
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id)
      if (error) throw error

      setCategories(prev => prev.filter(c => c.id !== id))
      showSnackbar('Категория удалена', 'success')
    } catch (err) {
      showSnackbar(
        err instanceof Error ? err.message : 'Не удалось удалить категорию',
        'error'
      )
    }
  }

  const getTypeChip = (type: string) => {
    switch (type) {
      case 'income':
        return (
          <Chip
            label="Доход"
            size="small"
            color="success"
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
        )
      case 'expense':
        return (
          <Chip
            label="Расход"
            size="small"
            color="error"
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
        )
      default:
        return (
          <Chip
            label="Универсальная"
            size="small"
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
        )
    }
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <Typography color="text.secondary">Загрузка категорий...</Typography>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        width: '100%',
        maxWidth: 800,
        mx: 'auto',
        p: { xs: 2, sm: 4 },
      }}
    >
      {/* Форма добавления (без изменений) */}
      <Card sx={{ width: '100%', borderRadius: 3, boxShadow: 2 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography
            variant="h6"
            gutterBottom
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              fontWeight: 600,
            }}
          >
            <AddCircleOutline color="primary" />
            Добавить новую категорию
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2.5,
              alignItems: 'flex-end',
            }}
          >
            <FormControl sx={{ flex: 1, minWidth: { sm: 180 } }}>
              <InputLabel>Тип категории</InputLabel>
              <Select
                value={newCategoryType}
                label="Тип категории"
                onChange={e =>
                  setNewCategoryType(
                    e.target.value as 'income' | 'expense' | 'both'
                  )
                }
              >
                <MenuItem value="both">🔄 Универсальная</MenuItem>
                <MenuItem value="expense">📤 Только Расход</MenuItem>
                <MenuItem value="income">📥 Только Доход</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Название категории"
              variant="outlined"
              value={newCategory}
              onChange={e => setNewCategory(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddItem()}
              placeholder="Например: Продукты, Такси..."
              sx={{ flex: 2 }}
              fullWidth
            />

            <Button
              variant="contained"
              onClick={handleAddItem}
              disabled={!newCategory.trim()}
              sx={{
                py: 1.2,
                px: 3,
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '1rem',
                height: '56px',
              }}
            >
              Добавить
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Список категорий */}
      <Box sx={{ width: '100%' }}>
        <Typography
          variant="h6"
          gutterBottom
          sx={{
            fontWeight: 600,
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <CategoryIcon color="action" />
          Ваши категории ({sortedCategories.length})
        </Typography>

        {sortedCategories.length === 0 ? (
          <Paper
            sx={{
              p: 4,
              textAlign: 'center',
              bgcolor: 'background.default',
              borderRadius: 2,
            }}
          >
            <CategoryIcon
              sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }}
            />
            <Typography color="text.secondary">Категорий пока нет.</Typography>
            <Typography variant="body2" color="text.disabled">
              Используйте форму выше, чтобы создать первую!
            </Typography>
          </Paper>
        ) : (
          <List sx={{ p: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
            {sortedCategories.map(item => (
              <Paper
                key={item.id}
                onMouseEnter={() => setIsHovered(item.id)}
                onMouseLeave={() => setIsHovered(null)}
                elevation={isHovered === item.id ? 2 : 1}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  p: 2,
                  borderRadius: 2,
                  transition: 'all 0.2s ease',
                  bgcolor: 'background.paper',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    flexGrow: 1,
                    gap: 2,
                  }}
                >
                  <CategoryIcon color="action" sx={{ opacity: 0.7 }} />
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {item.name}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {getTypeChip(item.type)}

                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenEdit(item)} // 👇 Передаем весь объект item
                      title="Изменить"
                      sx={{
                        color: 'text.secondary',
                        opacity: isHovered === item.id ? 1 : 0,
                        transition: 'opacity 0.2s ease',
                        '&:hover': {
                          color: 'primary.main',
                          bgcolor: 'rgba(25, 118, 210, 0.08)',
                        },
                      }}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(item.id)}
                      title="Удалить"
                      sx={{
                        color: 'text.secondary',
                        opacity: isHovered === item.id ? 1 : 0,
                        transition: 'opacity 0.2s ease',
                        '&:hover': {
                          color: 'error.main',
                          bgcolor: 'rgba(211, 47, 47, 0.08)',
                        },
                      }}
                    >
                      <Close fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              </Paper>
            ))}
          </List>
        )}
      </Box>

      {/* 👇 МОДАЛЬНОЕ ОКНО: ДОБАВЛЕН ВЫБОР ТИПА */}
      <CustomModal
        open={openModal}
        onClose={handleCloseModal}
        title="Изменить категорию"
        onConfirm={handleSaveEdit}
        confirmText="Сохранить"
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Название категории"
            variant="outlined"
            value={editCategory.name}
            onChange={e =>
              setEditCategory(prev => ({ ...prev, name: e.target.value }))
            }
            onKeyDown={e => e.key === 'Enter' && handleSaveEdit()}
            fullWidth
            autoFocus
          />
          <FormControl fullWidth>
            <InputLabel>Тип категории</InputLabel>
            <Select
              value={editCategory.type}
              label="Тип категории"
              onChange={e =>
                setEditCategory(prev => ({
                  ...prev,
                  type: e.target.value as 'income' | 'expense' | 'both',
                }))
              }
            >
              <MenuItem value="both">🔄 Универсальная</MenuItem>
              <MenuItem value="expense">📤 Только Расход</MenuItem>
              <MenuItem value="income">📥 Только Доход</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </CustomModal>

      {/* Всплывающие уведомления */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
