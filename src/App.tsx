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
import { TransactionModal } from './components/organisms/TransactionModal '
import { Balance } from './components/organisms/Balance'
import { TransactionList } from './components/organisms/TransactionList'
import { CategoryPage } from './pages/CategoryPage'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Sidebar } from './components/molecules/Sidebar'
import { darkTheme } from './styles/theme/darkTheme'
import { AuthForm } from './components/molecules/AuthForm'

// const useAuth = () => {
//   const token = localStorage.getItem('token')
//   return !!token
// }
const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('token')
  )

  useEffect(() => {
    const handler = () => {
      setIsAuthenticated(!!localStorage.getItem('token'))
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  return isAuthenticated
}

function App() {
  const { theme } = useTheme() // для цвета аппбара
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isAuthenticated = useAuth() // Проверяем, есть ли токен

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev)
  }

  return (
    <>
      {/* Аппбар с бургером */}
      {isAuthenticated && (
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
      )}

      {/* Боковая панель */}
      {isAuthenticated && (
        <Sidebar open={sidebarOpen} onClose={toggleSidebar} />
      )}
      {/* Основной контент */}
      <Container
        maxWidth="sm"
        style={{ marginTop: '80px', marginBottom: '80px' }}
      >
        <Routes>
          <Route path="/" element={<AuthForm />} />
          <Route path="/login" element={<AuthForm />} />
          <Route path="/register" element={<AuthForm />} />
          <Route path="/forgot-password" element={<AuthForm />} />
          <Route path="/reset-password" element={<AuthForm />} />

          {/* Защищённые маршруты */}
          {isAuthenticated ? (
            <>
              <Route
                path="/dashboard"
                element={
                  <>
                    <TransactionList />
                    <TransactionModal />
                    <Balance />
                  </>
                }
              />
              <Route path="/categories" element={<CategoryPage />} />
              {/* Редирект с корня на дашборд */}
              <Route path="/" element={<Navigate to="/dashboard" />} />
            </>
          ) : (
            // Если не авторизован — редирект на /login
            <Route path="*" element={<Navigate to="/login" />} />
          )}
        </Routes>
      </Container>
    </>
  )
}

export default App
