import { Close } from '@mui/icons-material'
import { IconButton, type IconButtonProps } from '@mui/material'

interface DeleteButtonProps extends Omit<IconButtonProps, 'onClick'> {
  onClick: () => void
  isVisible?: boolean
}

export const DeleteButton = ({
  onClick,
  isVisible = true,
  ...props
}: DeleteButtonProps) => {
  return (
    <IconButton
      size="small"
      onClick={onClick}
      title="Удалить"
      sx={{
        color: 'text.secondary',
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.2s ease',
        '&:hover': {
          color: 'error.main',
          bgcolor: 'rgba(211, 47, 47, 0.08)',
        },
        ...props.sx,
      }}
      {...props}
    >
      <Close fontSize="small" />
    </IconButton>
  )
}
