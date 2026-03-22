import {
  AppBar,
  // Avatar,
  // CardHeader,
  Container,
  IconButton,
  Toolbar,
  Typography,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import { useTheme } from './context/ThemeContext'
// import { TransactionModal } from './components/organisms/TransactionModal'
// import { Balance } from './components/organisms/Balance'
// import { TransactionList } from './components/organisms/TransactionList'
import { CategoryPage } from './pages/CategoryPage'
import { DashboardPage } from './pages/DashboardPage'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Sidebar } from './components/molecules/Sidebar'
import { darkTheme } from './styles/theme/darkTheme'
import { useGetMeQuery } from './store/apiSlice'
import { Login } from './components/organisms/Login'
import { Register } from './components/organisms/Register'
import { ForgotPassword } from './components/organisms/ForgotPassword'
import { ResetPassword } from './components/organisms/ResetPassword'
import { PublicRoute } from './components/atoms/PublicRoute'
import { ProtectedRoute } from './components/atoms/ProtectedRoute'

function App() {
  const { theme } = useTheme() // для цвета аппбара
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()

  const token = localStorage.getItem('token')

  const { data: userData, isError } = useGetMeQuery(undefined, {
    skip: !token,
  })

  // ✅ Актуальный флаг авторизации
  const isAuthenticated = !!token && !!userData && !isError

  useEffect(() => {
    if (token && isError) {
      localStorage.removeItem('token')
    }
  }, [token, isError])

  // Слушаем изменения localStorage (например, выход в другом окне)
  useEffect(() => {
    const handleStorage = () => {
      const currentToken = localStorage.getItem('token')
      if (!currentToken) {
        navigate('/login', { replace: true })
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [isAuthenticated, navigate])

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev)
  }

  return (
    <>
      {/* AppBar и Sidebar */}
      {isAuthenticated && (
        <>
          <AppBar
            position="fixed"
            color="default"
            style={{
              // marginTop: '50px',
              backgroundColor: theme === darkTheme ? '#121212' : '#fff',
              zIndex: 5,
            }}
          >
            <Toolbar>
              {/* <CardHeader
            avatar={
              <Avatar aria-label="Пользователь" src="../../../public/user.png">
                AB
              </Avatar>
            }
            title="С возвращением юзер"
          /> */}
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
        style={{ marginTop: '80px', marginBottom: '80px' }}
      >
        <Routes>
          {/* Публичные маршруты — доступны только без авторизации */}

          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            }
          />
          <Route
            path="/reset-password"
            element={
              <PublicRoute>
                <ResetPassword />
              </PublicRoute>
            }
          />

          {/* Защищённые маршруты */}

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/categories"
            element={
              <ProtectedRoute>
                <CategoryPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/login" />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Container>
    </>
  )
}

export default App
