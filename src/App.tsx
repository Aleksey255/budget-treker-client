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
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Sidebar } from './components/molecules/Sidebar'
import { darkTheme } from './styles/theme/darkTheme'
import { supabase } from './lib/supabaseClient' // Убедитесь, что путь правильный

// Ваши оригинальные компоненты авторизации
import { Login } from './components/organisms/Login'
import { Register } from './components/organisms/Register'
import { ForgotPassword } from './components/organisms/ForgotPassword'
import { ResetPassword } from './components/organisms/ResetPassword'

function App() {
  const { theme } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()

  // Состояние аутентификации и загрузки
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 1. Проверяем текущую сессию при первой загрузке
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session)
      setIsLoading(false)
    })

    // 2. Подписываемся на изменения состояния аутентификации
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session)

      // Если сессия пропала (например, выход в другой вкладке), перенаправляем на логин
      if (!session) {
        navigate('/login', { replace: true })
      }
    })

    // Очистка подписки при размонтировании
    return () => subscription.unsubscribe()
  }, [navigate])

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev)
  }

  // Показываем загрузку, пока Supabase проверяет сессию
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
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          ) : (
            // 🔓 Публичные маршруты (используем ваши оригинальные компоненты)
            <>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </>
          )}
        </Routes>
      </Container>
    </>
  )
}

export default App
