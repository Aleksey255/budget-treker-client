import { createTheme } from '@mui/material/styles'

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#8221f8ff',
    },
    secondary: {
      main: '#3700b3',
    },
    background: {
      default: '#121212',
      paper: '#424242',
    },
    text: {
      primary: '#fff',
      secondary: '#ddd',
    },
  },
})
