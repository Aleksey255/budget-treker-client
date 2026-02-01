import { Button, Container } from '@mui/material'

import { useTheme } from './context/ThemeContext'
import { Category } from './components/organisms/Category'
import { TransactionModal } from './components/organisms/TransactionModal '
import { Balance } from './components/organisms/Balance'
import { Header } from './components/organisms/Header'
import { TransactionList } from './components/organisms/TransactionList'

function App() {
  const { toggleTheme } = useTheme()

  return (
    <>
      <Header />
      <Container maxWidth="sm" style={{ marginTop: '50px' }}>
        <Button variant="contained" color="primary" onClick={toggleTheme}>
          Переключить тему
        </Button>
      </Container>
      <Category />
      <TransactionList />
      <TransactionModal />
      <Balance />
    </>
  )
}

export default App
