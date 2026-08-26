import { Alert, Box } from '@mui/material'
import { WifiOff } from '@mui/icons-material'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'

export const NetworkBanner = () => {
  const isOnline = useNetworkStatus()

  if (isOnline) return null

  return (
    <Alert
      severity="warning"
      sx={{
        borderRadius: 0,
        justifyContent: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 9999,
        boxShadow: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <WifiOff fontSize="small" />
        <span>
          Нет подключения к интернету. Приложение работает в оффлайн-режиме.
        </span>
      </Box>
    </Alert>
  )
}
