import { Provider } from 'react-redux'
import { ThemeProvider } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'
import { useTheme } from './context/ThemeContext'
import { store } from './store/store'
import { BrowserRouter } from 'react-router-dom'
import App from './App'

export const Root = () => {
  const { theme } = useTheme()

  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <CssBaseline />
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  )
}
