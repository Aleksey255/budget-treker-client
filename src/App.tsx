import {
  AppBar,
  Avatar,
  CardHeader,
  Container,
  IconButton,
  Toolbar,
  Typography,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import { useTheme } from './context/ThemeContext'
import { TransactionModal } from './components/organisms/TransactionModal '
import { Balance } from './components/organisms/Balance'
// import { Header } from './components/organisms/Header'
import { TransactionList } from './components/organisms/TransactionList'
import { CategoryPage } from './pages/CategoryPage'
import { Route, Routes } from 'react-router-dom'
import { useState } from 'react'
import { Sidebar } from './components/molecules/Sidebar'
import { darkTheme } from './styles/theme/darkTheme'
function App() {
  const { theme } = useTheme() // для цвета аппбара
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev)
  }

  return (
    <>
      {/* Аппбар с бургером */}
      <AppBar
        position="static"
        color="default"
        style={{
          // marginTop: '50px',
          backgroundColor: theme === darkTheme ? '#121212' : '#fff',
        }}
      >
        <Toolbar>
          <CardHeader
            avatar={
              <Avatar aria-label="Пользователь" src="../../../public/user.png">
                AB
              </Avatar>
            }
            title="С возвращением юзер"
          />
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

      {/* Боковая панель */}
      <Sidebar open={sidebarOpen} onClose={toggleSidebar} />

      {/* Основной контент */}
      <Container
        maxWidth="sm"
        style={{ marginTop: '20px', marginBottom: '80px' }}
      >
        <Routes>
          <Route
            path="/"
            element={
              <>
                <TransactionList />
                <TransactionModal />
                <Balance />
              </>
            }
          />
          <Route path="/categories" element={<CategoryPage />} />
        </Routes>
      </Container>
    </>
  )
}

export default App
