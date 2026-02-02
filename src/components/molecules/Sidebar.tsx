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
    <Drawer anchor="left" open={open} onClose={onClose}>
      <Toolbar />
      <Box sx={{ width: 250 }} role="presentation" onClick={onClose}>
        <List>
          {/* Кнопка "Назад" — только на странице категорий */}
          {isOnCategories && (
            <ListItem disablePadding>
              <ListItemButton component="div">
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={handleGoBack}
                >
                  Назад
                </Button>
              </ListItemButton>
            </ListItem>
          )}

          {/* Переключение темы — всегда */}
          <ListItem disablePadding>
            <ListItemButton component="div">
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={handleToggleTheme}
              >
                Переключить тему
              </Button>
            </ListItemButton>
          </ListItem>

          {/* Переход в категории — если не на /categories */}
          {!isOnCategories && (
            <ListItem disablePadding>
              <ListItemButton component="div">
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={handleGoToCategories}
                >
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
