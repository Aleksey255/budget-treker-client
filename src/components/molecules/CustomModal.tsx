import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material'
import { useEffect, useState } from 'react'

interface CustomModalProps {
  open: boolean
  handleClose: () => void
  onSave: (value: string) => void
  title?: string
  label?: string
  initialValue?: string
  onChange?: (value: string) => void
}

export const CustomModal = ({
  open,
  handleClose,
  onSave,
  title = 'Изменить',
  label = 'Название',
  initialValue = '',
}: CustomModalProps) => {
  const [value, setValue] = useState(initialValue)
  useEffect(() => {
    if (open) {
      setValue(initialValue)
    }
  }, [open, initialValue])
  const handleSave = () => {
    onSave(value)
  }
  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        <TextField
          autoFocus
          margin="dense"
          label={label}
          name="Modal"
          id="Modal"
          type="text"
          fullWidth
          variant="outlined"
          value={value}
          onChange={e => setValue(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="inherit">
          Отмена
        </Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Ок
        </Button>
      </DialogActions>
    </Dialog>
  )
}
