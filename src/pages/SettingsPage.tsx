import { Box, Typography, Divider, Button } from '@mui/material'
import { ArrowBack } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { ChangePassword } from '@/components/organisms/ChangePassword'

export const SettingsPage = () => {
  const navigate = useNavigate()

  return (
    <Box sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2 }}
      >
        Назад
      </Button>

      <Typography variant="h4" gutterBottom>
        Настройки
      </Typography>
      <Divider sx={{ my: 3 }} />

      <ChangePassword />
    </Box>
  )
}
