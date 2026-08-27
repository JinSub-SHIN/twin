import { Home, Search, UserRound } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import styles from './BottomNav.module.css'

const NAV_ITEMS = [
  { to: '/', label: '홈', icon: Home, end: true },
  { to: '/explore', label: '찾기', icon: Search },
  { to: '/profile', label: '내정보', icon: UserRound },
] as const

type BottomNavProps = {
  immersive?: boolean
}

export function BottomNav({ immersive = false }: BottomNavProps) {
  return (
    <nav
      aria-label="하단 메뉴"
      className={cn(styles.nav, immersive ? styles.navImmersive : styles.navDefault)}
    >
      <ul className={styles.list}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={'end' in item ? item.end : false}
                className={({ isActive }) =>
                  cn(
                    styles.link,
                    immersive ? styles.linkImmersive : styles.linkDefault,
                    isActive && (immersive ? styles.linkImmersiveActive : styles.linkDefaultActive),
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={cn(styles.dot, isActive ? styles.dotOn : styles.dotOff)} />
                    <Icon
                      className={cn(styles.icon, isActive && styles.iconActive)}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    {item.label}
                  </>
                )}
              </NavLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
