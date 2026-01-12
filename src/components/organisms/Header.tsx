import { Avatar } from '@mui/material'
import CardHeader from '@mui/material/CardHeader'

export const Header = () => {
  return (
    <CardHeader
      avatar={
        <Avatar aria-label="Пользователь" src="../../../public/user.png">
          AB
        </Avatar>
      }
      title="С возвращением юзер"
    />
  )
}
