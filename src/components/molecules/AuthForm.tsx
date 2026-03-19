import {
  useForgotPasswordMutation,
  useLoginMutation,
  useRegisterMutation,
  useResetPasswordMutation,
} from '@/store/apiSlice'
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

type AuthFormProps = {
  initialView?: 'login' | 'register' | 'forgotPassword'
}

// 🔍 Тип для ответа ошибки с сервера
type ErrorResponse = {
  data?: {
    message?: string
  }
  status?: number
}

export const AuthForm = ({ initialView = 'login' }: AuthFormProps) => {
  const location = useLocation()
  const navigate = useNavigate()

  // Проверяем, есть ли токен в URL (для сброса пароля)
  const searchParams = new URLSearchParams(location.search)
  const token = searchParams.get('token')
  const isResetMode = Boolean(token)

  const [view, setView] = useState<'login' | 'register' | 'forgotPassword'>(
    initialView
  )

  // Форма
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Показ пароля
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  // Ошибки
  const [error, setError] = useState('')

  // RTK Query мутации
  const [register, { isLoading: isRegistering }] = useRegisterMutation()
  const [login, { isLoading: isLoggingIn }] = useLoginMutation()
  const [forgotPassword, { isLoading: isSendingReset }] =
    useForgotPasswordMutation()
  const [resetPassword, { isLoading: isResetting }] = useResetPasswordMutation()

  // Сброс ошибки при переключении вкладок
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

    try {
      if (isResetMode && token) {
        // Режим сброса пароля
        if (!newPassword || !confirmPassword) {
          return setError('Все поля обязательны')
        }
        if (newPassword !== confirmPassword) {
          return setError('Пароли не совпадают')
        }
        await resetPassword({ token, newPassword }).unwrap()
        alert('Пароль успешно изменён. Войдите с новым паролем.')
      } else if (view === 'login') {
        const result = await login({ email, password }).unwrap()
        navigate('/', { replace: true })
        return result
      } else if (view === 'register') {
        if (!name) return setError('Имя обязательно')
        await register({ name, email, password }).unwrap()
      } else if (view === 'forgotPassword') {
        if (!email) return setError('Email обязателен')
        await forgotPassword({ email }).unwrap()
        setView('login')
        alert('Ссылка для восстановления отправлена на ваш email')
      }
    } catch (err) {
      let message = 'Неверный email или пароль'
      if (typeof err === 'object' && err !== null && 'data' in err) {
        message = (err as ErrorResponse).data?.message || message
      }
      setError(message)
    }
  }

  // Сброс пароля — отдельная форма
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
              disabled={isResetting}
            />
            <TextField
              label="Подтвердите пароль"
              type={showNewPassword ? 'text' : 'password'}
              fullWidth
              margin="normal"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              disabled={isResetting}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
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
              disabled={isResetting}
            >
              {isResetting ? 'Сохранение...' : 'Сменить пароль'}
            </Button>
          </Box>
        </Paper>
      </Container>
    )
  }

  return (
    <Container maxWidth="xs">
      <Paper sx={{ mt: 8, p: 4, borderRadius: 3, boxShadow: 3 }}>
        <Typography variant="h5" component="h1" align="center" gutterBottom>
          Контроль бюджета
        </Typography>

        {/* Вкладки */}
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

        {/* Сообщение об ошибке */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Форма */}
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
              disabled={isRegistering}
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
            disabled={
              view === 'forgotPassword'
                ? isSendingReset
                : isLoggingIn || isRegistering
            }
          />

          {/* Пароль — только во входе и регистрации */}
          {view !== 'forgotPassword' && (
            <TextField
              label="Пароль"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              margin="normal"
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={isLoggingIn || isRegistering}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
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
            disabled={
              isLoggingIn || isRegistering || isSendingReset || isResetting
            }
          >
            {isLoggingIn || isRegistering || isSendingReset || isResetting
              ? 'Загрузка...'
              : view === 'login'
                ? 'Войти'
                : view === 'register'
                  ? 'Зарегистрироваться'
                  : 'Отправить ссылку'}
          </Button>
        </Box>
        {/* Подсказка */}
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
