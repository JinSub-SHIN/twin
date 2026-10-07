import { Outlet, useLocation } from 'react-router-dom'
import { BottomNav, Header } from '@/components/layout'
import { cn } from '@/lib/utils'
import { HomeTour } from '@/pages/home/HomeTour'
import styles from './AppLayout.module.css'

export function AppLayout() {
  const { pathname } = useLocation()
  const isHome = pathname === '/'
  const isCounselor = pathname === '/counselor'
  const isSignup = pathname.startsWith('/signup')
  const isLogin = pathname.startsWith('/login')
  const isProfileEdit = pathname.startsWith('/profile/edit')
  const isRoommateImmersive = /^\/roommate\/(new|done|chat|match)/.test(pathname)
  const isListingDetail = pathname.startsWith('/explore/listing/')
  const isListingPreview = pathname.startsWith('/explore/listing') && !isListingDetail
  const isAuthPage = isSignup || isLogin
  const hideHeader =
    isAuthPage ||
    isProfileEdit ||
    isListingPreview ||
    isListingDetail ||
    isRoommateImmersive ||
    isHome ||
    isCounselor
  const hideNav = isCounselor || isListingDetail || isRoommateImmersive

  return (
    <div className={cn(styles.shell, styles.shellDefault)} data-app-shell>
      {!hideHeader && <Header immersive={false} />}
      <main
        className={cn(
          styles.main,
          isHome
            ? styles.mainHome
            : isCounselor
              ? styles.mainCounselor
              : !isSignup &&
                !isProfileEdit &&
                !isListingPreview &&
                !isListingDetail &&
                !isRoommateImmersive &&
                styles.mainDefault,
          isLogin && styles.mainAuth,
          isSignup && styles.mainSignup,
          isProfileEdit && styles.mainProfileEdit,
          isListingPreview && styles.mainListingPreview,
          (isListingDetail || isRoommateImmersive) && styles.mainListingDetail,
        )}
      >
        <Outlet />
      </main>
      {!hideNav && <BottomNav immersive={false} />}
      <HomeTour />
    </div>
  )
}
