import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProviderWrapper, useTheme } from './context/ThemeContext.tsx'
import { CssBaseline } from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'
import App from './App.tsx'

const Root = () => {
  const { theme } = useTheme()

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProviderWrapper>
      <Root />
    </ThemeProviderWrapper>
  </StrictMode>
)
