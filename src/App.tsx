import { Button, Container } from '@mui/material'

import { useTheme } from './context/ThemeContext'
import { Category } from './components/organisms/Category'
import { Transaction } from './components/organisms/Transaction'

function App() {
  const { toggleTheme } = useTheme()

  return (
    <>
      <Container maxWidth="sm" style={{ marginTop: '50px' }}>
        <Button variant="contained" color="primary" onClick={toggleTheme}>
          Переключить тему
        </Button>
      </Container>
      <Category />
      <Transaction />
    </>
  )
}

export default App
