import { Button, Container } from '@mui/material'
import { Category } from './components/Category'
import { useTheme } from './context/ThemeContext'

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
    </>
  )
}

export default App
