import { cn } from '@/lib/utils'

type HeaderProps = {
  immersive?: boolean
}

export function Header({ immersive = false }: HeaderProps) {
  if (immersive) {
    return (
      <header className="pointer-events-none fixed top-0 left-1/2 z-30 w-full max-w-md -translate-x-1/2 px-5 pt-[calc(env(safe-area-inset-top)+0.85rem)]">
        <p className="font-heading text-[0.7rem] font-semibold tracking-[0.35em] text-white/70 uppercase">
          Roommate match
        </p>
      </header>
    )
  }

  return (
    <header
      className={cn(
        'fixed top-0 left-1/2 z-30 flex h-[calc(3.5rem+env(safe-area-inset-top))] w-full max-w-md -translate-x-1/2 items-end px-5 pb-3',
        'border-b border-border/70 bg-background/80 backdrop-blur-md',
      )}
    >
      <h1 className="font-heading text-xl font-extrabold tracking-tight">
        Twin
        <span className="text-primary">.</span>
      </h1>
    </header>
  )
}
