import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export function PrivateRoute() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#6B21A8] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return session ? <Outlet /> : <Navigate to="/login" replace />
}
