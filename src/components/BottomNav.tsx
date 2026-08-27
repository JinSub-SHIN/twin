import { Home, Search, UserRound } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'

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
      className={cn(
        'fixed bottom-0 left-1/2 z-30 h-[calc(4rem+env(safe-area-inset-bottom))] w-full max-w-md -translate-x-1/2 pb-[env(safe-area-inset-bottom)]',
        immersive
          ? 'border-t border-white/10 bg-[oklch(0.14_0.02_155_/0.72)] backdrop-blur-xl'
          : 'border-t border-border bg-background/95 backdrop-blur-md',
      )}
    >
      <ul className="grid h-16 grid-cols-3">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={'end' in item ? item.end : false}
                className={({ isActive }) =>
                  cn(
                    'relative flex h-full flex-col items-center justify-center gap-1 text-[0.7rem] font-semibold tracking-wide transition-all duration-300',
                    immersive ? 'text-white/45' : 'text-muted-foreground',
                    isActive && (immersive ? 'text-primary' : 'text-foreground'),
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={cn(
                        'absolute top-1.5 h-1 w-1 rounded-full bg-primary transition-all duration-300',
                        isActive ? 'scale-100 opacity-100' : 'scale-0 opacity-0',
                      )}
                    />
                    <Icon
                      className={cn('size-5 transition-transform duration-300', isActive && '-translate-y-0.5')}
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
