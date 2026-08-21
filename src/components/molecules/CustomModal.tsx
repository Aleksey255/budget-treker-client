import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  type DialogProps,
} from '@mui/material'
import type { ReactNode } from 'react'

interface CustomModalProps extends Omit<DialogProps, 'open' | 'onClose'> {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  onConfirm?: () => void
  confirmText?: string
  cancelText?: string
  showCancel?: boolean
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  fullWidth?: boolean
}

export const CustomModal = ({
  open,
  onClose,
  title,
  children,
  onConfirm,
  confirmText = 'Подтвердить',
  cancelText = 'Отмена',
  showCancel = true,
  maxWidth = 'sm',
  fullWidth = true,
  ...dialogProps
}: CustomModalProps) => {
  const handleConfirm = () => {
    onConfirm?.()
    onClose() // Закрываем после подтверждения
  }
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      disableRestoreFocus
      disableEnforceFocus
      {...dialogProps}
    >
      <DialogTitle>{title}</DialogTitle>

      <DialogContent>{children}</DialogContent>
      <DialogActions>
        {showCancel && (
          <Button onClick={onClose} color="secondary">
            {cancelText}
          </Button>
        )}
        <Button onClick={handleConfirm} color="primary" variant="contained">
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
