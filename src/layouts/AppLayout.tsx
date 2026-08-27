import { Outlet, useLocation } from 'react-router-dom'
import { BottomNav } from '@/components/BottomNav'
import { Header } from '@/components/Header'
import { cn } from '@/lib/utils'

export function AppLayout() {
  const { pathname } = useLocation()
  const isHome = pathname === '/'

  return (
    <div
      className={cn(
        'relative mx-auto flex min-h-dvh w-full max-w-md flex-col overflow-hidden shadow-[0_0_80px_rgba(20,30,24,0.18)]',
        isHome ? 'bg-[oklch(0.16_0.02_155)] text-white' : 'bg-background text-foreground',
      )}
    >
      {!isHome && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_at_top,_oklch(0.9_0.12_125/_0.55),_transparent_65%)]"
        />
      )}
      <Header immersive={isHome} />
      <main
        className={cn(
          'relative z-10 flex-1',
          isHome
            ? 'pb-[calc(4.5rem+env(safe-area-inset-bottom))]'
            : 'px-5 pb-[calc(4.5rem+env(safe-area-inset-bottom))] pt-[calc(3.5rem+env(safe-area-inset-top)+1rem)]',
        )}
      >
        <Outlet />
      </main>
      <BottomNav immersive={isHome} />
    </div>
  )
}
