import { Edit } from "@mui/icons-material"
import { IconButton, type IconButtonProps } from "@mui/material"

interface EditButtonProps extends Omit<IconButtonProps, 'onClick'> {
  onClick: () => void
  isVisible?: boolean
}

export const EditButton = ({ onClick, isVisible = true, ...props }: EditButtonProps) => {
  return (
    <IconButton
      size="small"
      onClick={onClick}
      title="Изменить"
      sx={{
        color: 'text.secondary',
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.2s ease',
        '&:hover': {
          color: 'primary.main',
          bgcolor: 'rgba(25, 118, 210, 0.08)',
        },
        ...props.sx,
      }}
      {...props}
    >
      <Edit fontSize="small" />
    </IconButton>
  )
}
