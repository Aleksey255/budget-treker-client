import {
  AppBar,
  Container,
  IconButton,
  Toolbar,
  Typography,
  CircularProgress,
  Box,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import { useTheme } from './context/ThemeContext'
import { CategoryPage } from './pages/CategoryPage'
import { DashboardPage } from './pages/DashboardPage'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Sidebar } from './components/molecules/Sidebar'
import { darkTheme } from './styles/theme/darkTheme'
import { supabase } from './lib/supabaseClient'

// Ваши оригинальные компоненты авторизации
import { Login } from './components/organisms/Login'
import { Register } from './components/organisms/Register'
import { ForgotPassword } from './components/organisms/ForgotPassword'
import { ResetPassword } from './components/organisms/ResetPassword'
import { SettingsPage } from './pages/SettingsPage'

function App() {
  const { theme } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Состояние аутентификации и загрузки
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 1. СРАЗУ читаем сессию из localStorage (работает оффлайн!)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session)
      setIsLoading(false)
    })

    // 2. Подписываемся на изменения состояния аутентификации
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      // Просто обновляем флаг. Не делаем navigate() здесь!
      setIsAuthenticated(!!session)
    })

    // Очистка подписки при размонтировании
    return () => subscription.unsubscribe()
  }, []) // Убрали navigate из зависимостей

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev)
  }

  // Показываем загрузку, пока читаем localStorage
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  return (
    <>
      {/* AppBar и Sidebar отображаются только для авторизованных пользователей */}
      {isAuthenticated && (
        <>
          <AppBar
            position="fixed"
            color="default"
            sx={{
              backgroundColor: theme === darkTheme ? '#121212' : '#fff',
              zIndex: theme => theme.zIndex.drawer + 1,
            }}
          >
            <Toolbar>
              <Typography variant="h6" sx={{ flexGrow: 1 }}>
                Контроль бюджета
              </Typography>
              <IconButton
                edge="end"
                color="inherit"
                aria-label="menu"
                onClick={toggleSidebar}
              >
                <MenuIcon />
              </IconButton>
            </Toolbar>
          </AppBar>
          <Sidebar open={sidebarOpen} onClose={toggleSidebar} />
        </>
      )}

      {/* Основной контент */}
      <Container
        maxWidth="sm"
        sx={{
          marginTop: isAuthenticated ? '80px' : '40px',
          marginBottom: '80px',
        }}
      >
        <Routes>
          {isAuthenticated ? (
            // 🔒 Защищённые маршруты
            <>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/categories" element={<CategoryPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              {/* Если авторизован, но попал на неизвестный путь -> на главную */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          ) : (
            // 🔓 Публичные маршруты
            <>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              {/* Если НЕ авторизован, но попал на любой другой путь -> на логин */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </>
          )}
        </Routes>
      </Container>
    </>
  )
}

export default App
