import { useEffect, useState } from 'react'
import { AuthForm } from '../molecules/AuthForm'

export const ResetPassword = () => {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return null // или заглушка
  }

  return <AuthForm />
}
