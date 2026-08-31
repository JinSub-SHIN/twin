import { Outlet, useLocation } from 'react-router-dom'
import { BottomNav } from '@/components/BottomNav'
import { Header } from '@/components/Header'
import { cn } from '@/lib/utils'
import styles from './AppLayout.module.css'

export function AppLayout() {
  const { pathname } = useLocation()
  const isHome = pathname === '/'
  const isSignup = pathname.startsWith('/signup')
  const isLogin = pathname.startsWith('/login')
  const isProfileEdit = pathname.startsWith('/profile/edit')
  const isListingPreview = pathname.startsWith('/explore/listing')
  const isAuthPage = isSignup || isLogin
  const hideHeader = isAuthPage || isProfileEdit || isListingPreview
  const showBottomNav = !isAuthPage

  return (
    <div className={cn(styles.shell, isHome ? styles.shellHome : styles.shellDefault)}>
      {!isHome && <div aria-hidden className={styles.glow} />}
      {!hideHeader && <Header immersive={isHome} />}
      <main
        className={cn(
          styles.main,
          isHome ? styles.mainHome : styles.mainDefault,
          isAuthPage && styles.mainAuth,
          isProfileEdit && styles.mainProfileEdit,
          isListingPreview && styles.mainListingPreview,
        )}
      >
        <Outlet />
      </main>
      {showBottomNav && <BottomNav immersive={isHome} />}
    </div>
  )
}
