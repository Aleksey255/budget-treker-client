import { Visibility, VisibilityOff } from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  Container,
  IconButton,
  InputAdornment,
  Paper,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient' // Убедитесь, что путь правильный

type AuthFormProps = {
  initialView?: 'login' | 'register' | 'forgotPassword'
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () =>
        reject(
          new Error(
            'Превышено время ожидания. Проверьте подключение к интернету.'
          )
        ),
      ms
    )
    promise.then(
      value => {
        clearTimeout(timer)
        resolve(value)
      },
      error => {
        clearTimeout(timer)
        reject(error)
      }
    )
  })
}

export const AuthForm = ({ initialView = 'login' }: AuthFormProps) => {
  const location = useLocation()
  const navigate = useNavigate()

  // Supabase добавляет type=recovery в hash URL при переходе по ссылке сброса
  const isResetMode =
    location.hash.includes('type=recovery') ||
    location.search.includes('reset=true')

  const [view, setView] = useState<'login' | 'register' | 'forgotPassword'>(
    isResetMode ? 'login' : initialView
  )

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setError('')
    setEmail('')
    setPassword('')
    setName('')
    setNewPassword('')
    setConfirmPassword('')
  }, [view, isResetMode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (isResetMode) {
        if (!newPassword || !confirmPassword)
          throw new Error('Все поля обязательны')
        if (newPassword !== confirmPassword)
          throw new Error('Пароли не совпадают')

        const { error: error1 } = await withTimeout(
          supabase.auth.updateUser({ password: newPassword }),
          10000
        )
        if (error1) throw error1

        alert('Пароль успешно изменён. Теперь вы можете войти.')
        navigate('/auth', { replace: true })
      } else if (view === 'login') {
        const { error: error2 } = await withTimeout(
          supabase.auth.signInWithPassword({ email, password }),
          10000
        )
        if (error2) throw error2

        navigate('/', { replace: true })
      } else if (view === 'register') {
        if (!name) throw new Error('Имя обязательно')

        const { error: error3 } = await withTimeout(
          supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: name } },
          }),
          10000
        )
        if (error3) throw error3

        alert('Регистрация успешна! Проверьте почту или попробуйте войти.')
        setView('login')
      } else if (view === 'forgotPassword') {
        if (!email) throw new Error('Email обязателен')

        const { error: error4 } = await withTimeout(
          supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth?reset=true`,
          }),
          10000
        )
        if (error4) throw error4

        alert('Ссылка для восстановления отправлена на ваш email')
        setView('login')
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Произошла неизвестная ошибка'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Рендер формы сброса пароля
  if (isResetMode) {
    return (
      <Container maxWidth="xs">
        <Paper sx={{ mt: 8, p: 4, borderRadius: 3, boxShadow: 3 }}>
          <Typography variant="h6" component="h2" align="center" gutterBottom>
            Новый пароль
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              label="Новый пароль"
              type={showNewPassword ? 'text' : 'password'}
              fullWidth
              margin="normal"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              autoFocus
              disabled={isLoading}
            />
            <TextField
              label="Подтвердите пароль"
              type={showNewPassword ? 'text' : 'password'}
              fullWidth
              margin="normal"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      edge="end"
                    >
                      {showNewPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              sx={{ mt: 3 }}
              disabled={isLoading}
            >
              {isLoading ? 'Сохранение...' : 'Сменить пароль'}
            </Button>
          </Box>
        </Paper>
      </Container>
    )
  }

  // Основной рендер (Вход / Регистрация / Забыли пароль)
  return (
    <Container maxWidth="xs">
      <Paper sx={{ mt: 8, p: 4, borderRadius: 3, boxShadow: 3 }}>
        <Typography variant="h5" component="h1" align="center" gutterBottom>
          Контроль бюджета
        </Typography>

        <Tabs
          value={view}
          onChange={(_, newValue) => setView(newValue)}
          centered
          sx={{ mb: 3 }}
        >
          <Tab label="Вход" value="login" />
          <Tab label="Регистрация" value="register" />
          <Tab label="Забыли пароль?" value="forgotPassword" />
        </Tabs>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          {view === 'register' && (
            <TextField
              label="Имя"
              type="text"
              fullWidth
              margin="normal"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
              disabled={isLoading}
            />
          )}

          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoFocus={!name && view !== 'forgotPassword'}
            disabled={isLoading}
          />

          {view !== 'forgotPassword' && (
            <TextField
              label="Пароль"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              margin="normal"
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={isLoading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          )}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            sx={{ mt: 3, mb: 2 }}
            disabled={isLoading}
          >
            {isLoading
              ? 'Загрузка...'
              : view === 'login'
                ? 'Войти'
                : view === 'register'
                  ? 'Зарегистрироваться'
                  : 'Отправить ссылку'}
          </Button>
        </Box>

        <Typography variant="body2" color="text.secondary" align="center">
          {view === 'login' && (
            <Button size="small" onClick={() => setView('forgotPassword')}>
              Забыли пароль?
            </Button>
          )}
          {view === 'forgotPassword' && (
            <Button size="small" onClick={() => setView('login')}>
              Назад ко входу
            </Button>
          )}
          {view === 'register' && (
            <Button size="small" onClick={() => setView('login')}>
              Уже есть аккаунт? Войти
            </Button>
          )}
        </Typography>
      </Paper>
    </Container>
  )
}
