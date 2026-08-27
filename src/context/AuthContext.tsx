import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { clearUser, loadUser, saveUser } from '@/lib/authStorage'
import { getProfileCompletion, type UserProfile } from '@/types/user'

type AuthContextValue = {
  user: UserProfile | null
  isLoggedIn: boolean
  completion: number
  signup: (user: UserProfile) => void
  updateUser: (patch: Partial<UserProfile>) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => loadUser())

  const signup = useCallback((next: UserProfile) => {
    saveUser(next)
    setUser(next)
  }, [])

  const updateUser = useCallback((patch: Partial<UserProfile>) => {
    setUser((prev) => {
      if (!prev) return prev
      const next = { ...prev, ...patch }
      saveUser(next)
      return next
    })
  }, [])

  const logout = useCallback(() => {
    clearUser()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      isLoggedIn: Boolean(user),
      completion: getProfileCompletion(user),
      signup,
      updateUser,
      logout,
    }),
    [user, signup, updateUser, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
