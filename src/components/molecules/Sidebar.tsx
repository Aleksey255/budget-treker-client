import { useTheme } from '@/context/ThemeContext'
import {
  Box,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  Toolbar,
} from '@mui/material'
import { useLocation, useNavigate } from 'react-router-dom'

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export const Sidebar = ({ open, onClose }: SidebarProps) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { toggleTheme } = useTheme()

  const isOnCategories = location.pathname === '/categories'

  const handleGoBack = () => {
    navigate(-1)
    onClose()
  }

  const handleToggleTheme = () => {
    toggleTheme()
    onClose()
  }

  const handleGoToCategories = () => {
    navigate('/categories')
    onClose()
  }

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Toolbar />
      <Box sx={{ width: 250 }} role="presentation">
        <List>
          {/* Кнопка "Назад" — только на странице категорий */}
          {isOnCategories && (
            <ListItem disablePadding>
              <ListItemButton component="div" onClick={handleGoBack}>
                <Button fullWidth variant="contained" color="primary">
                  Назад
                </Button>
              </ListItemButton>
            </ListItem>
          )}

          {/* Переключение темы — всегда */}
          <ListItem disablePadding>
            <ListItemButton component="div" onClick={handleToggleTheme}>
              <Button fullWidth variant="contained" color="primary">
                Переключить тему
              </Button>
            </ListItemButton>
          </ListItem>

          {/* Переход в категории — если не на /categories */}
          {!isOnCategories && (
            <ListItem disablePadding>
              <ListItemButton component="div" onClick={handleGoToCategories}>
                <Button fullWidth variant="contained" color="primary">
                  Управление категориями
                </Button>
              </ListItemButton>
            </ListItem>
          )}
        </List>
      </Box>
    </Drawer>
  )
}
