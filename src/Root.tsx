import { ThemeProvider } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'
import { useTheme } from './context/ThemeContext'
import { DateFilterProvider } from './context/DateFilterContext'

import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { NetworkBanner } from './components/molecules/NetworkBanner'

export const Root = () => {
  const { theme } = useTheme()

  return (
    <ThemeProvider theme={theme}>
      <DateFilterProvider>
        <BrowserRouter
          // key={typeof window === 'undefined' ? 'server' : 'client'}
        >
          <CssBaseline />
          <NetworkBanner />
          <App />
        </BrowserRouter>
      </DateFilterProvider>
    </ThemeProvider>
  )
}
