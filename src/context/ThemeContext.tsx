import { createContext, useState, useContext, useEffect } from 'react'
import { lightTheme } from '../styles/theme/lightTheme'
import { darkTheme } from '../styles/theme/darkTheme'

type ThemeContextType = {
  theme: typeof darkTheme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: darkTheme,
  toggleTheme: () => {},
})

export const useTheme = () => useContext(ThemeContext)

export const ThemeProviderWrapper = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [theme, setTheme] = useState(
    localStorage.getItem('theme') === 'dark' ? darkTheme : lightTheme
  )

  useEffect(() => {
    localStorage.setItem('theme', theme.palette.mode)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prevTheme =>
      prevTheme.palette.mode === 'light' ? darkTheme : lightTheme
    )
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
