import { createContext } from 'react'
import { darkTheme } from '../styles/theme/darkTheme'

export interface ThemeContextType {
  theme: typeof darkTheme
  toggleTheme: () => void
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: darkTheme,
  toggleTheme: () => {},
})
