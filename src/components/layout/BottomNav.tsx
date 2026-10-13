import { House, Search, SquarePlus, UserRound } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import styles from './BottomNav.module.css'

const NAV_ITEMS = [
  { to: '/', label: '홈', icon: House, end: true },
  { to: '/explore', label: '찾기', icon: Search },
  { to: '/roommate/new', label: '등록', icon: SquarePlus },
  { to: '/profile', label: '마이', icon: UserRound },
] as const

type BottomNavProps = {
  immersive?: boolean
}

function isNavActive(to: string, pathname: string, isActive: boolean) {
  if (to === '/roommate/new') {
    return pathname === '/roommate/new' || pathname === '/roommate/done'
  }
  return isActive
}

export function BottomNav({ immersive = false }: BottomNavProps) {
  const { pathname } = useLocation()

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
                className={({ isActive }) => {
                  const active = isNavActive(item.to, pathname, isActive)
                  return cn(
                    styles.link,
                    immersive ? styles.linkImmersive : styles.linkDefault,
                    active && (immersive ? styles.linkImmersiveActive : styles.linkDefaultActive),
                  )
                }}
              >
                {({ isActive }) => {
                  const active = isNavActive(item.to, pathname, isActive)
                  return (
                  <>
                    <span className={cn(styles.dot, active ? styles.dotOn : styles.dotOff)} />
                    <Icon
                      className={cn(styles.icon, active && styles.iconActive)}
                      strokeWidth={active ? 2.5 : 2}
                    />
                    {item.label}
                  </>
                  )
                }}
              </NavLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
