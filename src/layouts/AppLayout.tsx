import { Outlet, useLocation } from 'react-router-dom'
import { BottomNav } from '@/components/BottomNav'
import { Header } from '@/components/Header'
import { cn } from '@/lib/utils'
import styles from './AppLayout.module.css'

export function AppLayout() {
  const { pathname } = useLocation()
  const isHome = pathname === '/'

  return (
    <div className={cn(styles.shell, isHome ? styles.shellHome : styles.shellDefault)}>
      {!isHome && <div aria-hidden className={styles.glow} />}
      <Header immersive={isHome} />
      <main className={cn(styles.main, isHome ? styles.mainHome : styles.mainDefault)}>
        <Outlet />
      </main>
      <BottomNav immersive={isHome} />
    </div>
  )
}
