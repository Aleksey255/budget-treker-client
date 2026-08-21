import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { TextField, Button, Alert, Box, Typography } from '@mui/material'

export const ChangePassword = () => {
  const [newPassword, setNewPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Пароль должен содержать минимум 6 символов' })
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      // 👇 Основной запрос на обновление пароля в Supabase
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error

      setMessage({ type: 'success', text: 'Пароль успешно изменен!' })
      setNewPassword('')
    } catch (err) {
      const text = err instanceof Error ? err.message : 'Ошибка при смене пароля'
      setMessage({ type: 'error', text })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box component="form" onSubmit={handleChangePassword} sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 350, mt: 2 }}>
      <Typography variant="h6">Смена пароля</Typography>

      {message && <Alert severity={message.type} sx={{ width: '100%' }}>{message.text}</Alert>}

      <TextField
        label="Новый пароль"
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        required
        disabled={isLoading}
        helperText="Минимум 6 символов"
      />

      <Button
        type="submit"
        variant="contained"
        disabled={isLoading || newPassword.length < 6}
      >
        {isLoading ? 'Сохранение...' : 'Изменить пароль'}
      </Button>
    </Box>
  )
}
