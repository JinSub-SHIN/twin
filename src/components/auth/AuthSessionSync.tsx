import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { clearAuthTokens } from '@/lib/authStorage'
import { registerAuthSessionHandler } from '@/lib/authSession'

export function AuthSessionSync() {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout } = useAuth()

  useEffect(() => {
    registerAuthSessionHandler(({ message }) => {
      clearAuthTokens()
      logout()
      const from =
        location.pathname === '/login'
          ? undefined
          : `${location.pathname}${location.search}`
      navigate('/login', {
        replace: true,
        state: from ? { from, authNotice: message } : { authNotice: message },
      })
    })
    return () => registerAuthSessionHandler(null)
  }, [location.pathname, location.search, logout, navigate])

  return null
}
