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
  const isRoommateFlow = pathname === '/roommate/new' || pathname === '/roommate/done'
  const isRoommateImmersive =
    pathname.startsWith('/roommate/chat/') ||
    pathname.startsWith('/roommate/match/')
  const isListingDetail = pathname.startsWith('/explore/listing/')
  const isListingPreview = pathname.startsWith('/explore/listing') && !isListingDetail
  const isAuthPage = isSignup || isLogin
  const hideHeader =
    isAuthPage ||
    isProfileEdit ||
    isListingPreview ||
    isListingDetail ||
    isRoommateImmersive ||
    isRoommateFlow ||
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
                !isRoommateFlow &&
                styles.mainDefault,
          isLogin && styles.mainAuth,
          isSignup && styles.mainSignup,
          isProfileEdit && styles.mainProfileEdit,
          isListingPreview && styles.mainListingPreview,
          (isListingDetail || isRoommateImmersive || isRoommateFlow) && styles.mainListingDetail,
          isRoommateFlow && styles.mainRoommateFlow,
        )}
      >
        <Outlet />
      </main>
      {!hideNav && <BottomNav immersive={false} />}
      <HomeTour />
    </div>
  )
}
