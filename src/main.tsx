import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProviderWrapper } from './context/ThemeContext'
import { Root } from './Root'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProviderWrapper>
      <Suspense fallback="Загрузка...">
        <Root />
      </Suspense>
    </ThemeProviderWrapper>
  </StrictMode>
)
