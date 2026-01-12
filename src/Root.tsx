import { Provider } from 'react-redux'
import { ThemeProvider } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'
import { useTheme } from './context/ThemeContext'
import { store } from './store/store'
import App from './App'

export const Root = () => {
  const { theme } = useTheme()

  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </Provider>
  )
}
