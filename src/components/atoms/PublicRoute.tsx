import { useNavigate } from 'react-router-dom'
import { useGetMeQuery } from '@/store/apiSlice'
import type { JSX } from 'react'
import { useEffect } from 'react'

export const PublicRoute = ({ children }: { children: JSX.Element }) => {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const { data: user, isLoading } = useGetMeQuery(undefined, { skip: !token })

  useEffect(() => {
    if (token && user) {
      navigate('/', { replace: true })
    }
  }, [token, user, navigate])

  if (isLoading) return <div>Проверка...</div>

  return children
}
