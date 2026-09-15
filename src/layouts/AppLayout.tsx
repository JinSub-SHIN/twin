import { Outlet, useLocation } from 'react-router-dom'
import { BottomNav, Header } from '@/components/layout'
import { cn } from '@/lib/utils'
import styles from './AppLayout.module.css'

export function AppLayout() {
  const { pathname } = useLocation()
  const isHome = pathname === '/'
  const isCounselor = pathname === '/counselor'
  const isSignup = pathname.startsWith('/signup')
  const isLogin = pathname.startsWith('/login')
  const isProfileEdit = pathname.startsWith('/profile/edit')
  const isListingPreview = pathname.startsWith('/explore/listing')
  const isAuthPage = isSignup || isLogin
  const hideHeader = isAuthPage || isProfileEdit || isListingPreview || isHome || isCounselor
  const hideNav = isCounselor

  return (
    <div className={cn(styles.shell, styles.shellDefault)}>
      {!hideHeader && <Header immersive={false} />}
      <main
        className={cn(
          styles.main,
          isHome
            ? styles.mainHome
            : isCounselor
              ? styles.mainCounselor
              : !isSignup && !isProfileEdit && !isListingPreview && styles.mainDefault,
          isLogin && styles.mainAuth,
          isSignup && styles.mainSignup,
          isProfileEdit && styles.mainProfileEdit,
          isListingPreview && styles.mainListingPreview,
        )}
      >
        <Outlet />
      </main>
      {!hideNav && <BottomNav immersive={false} />}
    </div>
  )
}
