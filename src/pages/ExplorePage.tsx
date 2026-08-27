import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

export function ExplorePage() {
  return (
    <section className="flex flex-col gap-8">
      <div className="animate-twin-rise space-y-3">
        <p className="text-xs font-semibold tracking-[0.24em] text-muted-foreground uppercase">Explore</p>
        <h2 className="font-heading text-[2.35rem] leading-[1.05] font-extrabold tracking-[-0.05em]">
          리듬이 맞는
          <br />
          <span className="text-[oklch(0.45_0.12_145)]">사람</span>을 고르세요
        </h2>
        <p className="max-w-[30ch] text-sm leading-relaxed text-muted-foreground">
          지역과 생활 패턴으로 후보를 좁혀가는 탐색 화면입니다.
        </p>
      </div>

      <div className="animate-twin-rise delay-1 relative">
        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="h-12 rounded-2xl border-border/80 bg-card pl-10 text-base shadow-none"
          placeholder="지역, 키워드로 검색"
        />
      </div>

      <div className="animate-twin-rise delay-2 relative overflow-hidden rounded-[1.75rem] bg-secondary px-5 py-8 text-secondary-foreground">
        <div
          aria-hidden
          className="absolute -right-8 -bottom-10 size-36 rounded-full bg-primary/80 blur-2xl"
        />
        <p className="relative font-heading text-xl font-bold tracking-tight">아직 후보가 비어 있어요</p>
        <p className="relative mt-2 max-w-[26ch] text-sm leading-relaxed text-white/65">
          매칭 로직이 붙으면 여기에 라이프스타일이 가까운 룸메가 나타납니다.
        </p>
      </div>
    </section>
  )
}
