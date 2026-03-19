import { Navigate } from 'react-router-dom'
import { useGetMeQuery } from '@/store/apiSlice'
import type { JSX } from 'react'

export const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem('token')
  const { data: user, isLoading } = useGetMeQuery(undefined, { skip: !token })

  if (isLoading) return <div>Загрузка...</div>
  if (!token || !user) return <Navigate to="/login" replace />

  return children
}
