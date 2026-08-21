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
} from '@mui/material'
import { Close, Edit } from '@mui/icons-material'
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
  const [error, setError] = useState<string | null>(null)

  const [editCategory, setEditCategory] = useState({ id: '', name: '' })
  const [newCategory, setNewCategory] = useState('')
  // 👇 ИСПРАВЛЕНИЕ: по умолчанию создаем универсальную категорию
  const [newCategoryType, setNewCategoryType] = useState<'income' | 'expense' | 'both'>('both')

  const [open, setOpen] = useState(false)
  const [isHovered, setIsHovered] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('id, name, type')
          .order('name')

        if (error) throw error
        setCategories(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки категорий')
      } finally {
        setIsLoading(false)
      }
    }
    fetchCategories()
  }, [])

  const sortedCategories = [...categories].sort((a, b) => a.name.localeCompare(b.name))

  const handleOpen = (id: string, name: string) => {
    setEditCategory({ id, name })
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setEditCategory({ id: '', name: '' })
  }

  const handleAddItem = async () => {
    const trimmed = newCategory.trim()
    if (!trimmed) return

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) throw new Error('Пользователь не авторизован.')

      const { data, error } = await supabase
        .from('categories')
        .insert({
          name: trimmed,
          type: newCategoryType, // Сохраняем выбранный тип (включая 'both')
          user_id: user.id
        })
        .select()
        .single()

      if (error) throw error

      setCategories(prev => [...prev, data])
      setNewCategory('')
    } catch (err) {
      alert(`Ошибка: ${err instanceof Error ? err.message : 'Не удалось добавить категорию'}`)
    }
  }

  const handleSaveEdit = async () => {
    const trimmed = editCategory.name.trim()
    if (trimmed && editCategory.id) {
      try {
        const { error } = await supabase
          .from('categories')
          .update({ name: trimmed })
          .eq('id', editCategory.id)

        if (error) throw error

        setCategories(prev => prev.map(c => c.id === editCategory.id ? { ...c, name: trimmed } : c))
        handleClose()
      } catch (err) {
        alert(`Ошибка: ${err instanceof Error ? err.message : 'Не удалось обновить категорию'}`)
      }
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id)
      if (error) throw error
      setCategories(prev => prev.filter(c => c.id !== id))
    } catch (err) {
      alert(`Ошибка: ${err instanceof Error ? err.message : 'Не удалось удалить категорию'}`)
    }
  }

  // Вспомогательная функция для красивого отображения типа
  const getTypeLabel = (type: string) => {
    if (type === 'both') return 'Универсальная'
    if (type === 'income') return 'Доход'
    return 'Расход'
  }

  if (isLoading) return <Typography component="p" sx={{ p: 2 }}>Загрузка категорий...</Typography>
  if (error) return <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>

  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, width: '100%', alignItems: 'flex-start' }}>
      <List sx={{ flex: 1, minWidth: 0, p: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        {sortedCategories.length === 0 && (
          <Typography color="text.secondary" sx={{ p: 2 }}>Категорий пока нет. Добавьте первую!</Typography>
        )}

        {sortedCategories.map(item => (
          <Paper
            key={item.id}
            onMouseEnter={() => setIsHovered(item.id)}
            onMouseLeave={() => setIsHovered(null)}
            component={Box}
            sx={{
              display: 'inline-flex', alignItems: 'center', gap: 1, p: 1.5, mb: 1, borderRadius: 2, boxShadow: 1,
              bgcolor: 'background.paper', transition: 'box-shadow 0.2s ease, transform 0.1s ease',
              '&:hover': { boxShadow: 3, transform: 'translateY(-1px)' }, maxWidth: '100%',
            }}
          >
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', whiteSpace: 'nowrap' }}>
              <Typography variant="body2" color="text.secondary">{item.name}</Typography>
              <Typography variant="caption" color="text.disabled" sx={{ ml: 1 }}>
                ({getTypeLabel(item.type)})
              </Typography>

              <IconButton size="small" color="error" onClick={() => handleDelete(item.id)} title="Удалить категорию"
                sx={{ opacity: isHovered === item.id ? 1 : 0, visibility: isHovered === item.id ? 'visible' : 'hidden', transition: 'opacity 0.2s ease' }}>
                <Close fontSize="small" />
              </IconButton>

              <IconButton size="small" onClick={() => handleOpen(item.id, item.name)} title="Изменить категорию"
                sx={{ opacity: isHovered === item.id ? 1 : 0, visibility: isHovered === item.id ? 'visible' : 'hidden', transition: 'opacity 0.2s ease' }}>
                <Edit fontSize="small" />
              </IconButton>
            </Box>
          </Paper>
        ))}
      </List>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: 'center' }}>
        <FormControl sx={{ minWidth: 160 }}>
          <InputLabel>Тип категории</InputLabel>
          <Select
            value={newCategoryType}
            label="Тип категории"
            onChange={e => setNewCategoryType(e.target.value as 'income' | 'expense' | 'both')}
            size="small"
          >
            <MenuItem value="both">Универсальная (Доход и Расход)</MenuItem>
            <MenuItem value="expense">Только Расход</MenuItem>
            <MenuItem value="income">Только Доход</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Новая категория"
          variant="outlined"
          value={newCategory}
          onChange={e => setNewCategory(e.target.value)}
          sx={{ flex: 1 }}
        />

        <Button variant="outlined" onClick={handleAddItem} disabled={!newCategory.trim()}>
          Добавить
        </Button>
      </Box>

      <CustomModal open={open} onClose={handleClose} title="Изменить категорию" onConfirm={handleSaveEdit} confirmText="Сохранить">
        <TextField
          label="Название категории"
          variant="outlined"
          value={editCategory.name}
          onChange={e => setEditCategory(prev => ({ ...prev, name: e.target.value }))}
          fullWidth
          autoFocus
        />
      </CustomModal>
    </Box>
  )
}
