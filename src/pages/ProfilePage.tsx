import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export function ProfilePage() {
  return (
    <section className="flex flex-col gap-8">
      <div className="animate-twin-rise space-y-3">
        <p className="text-xs font-semibold tracking-[0.24em] text-muted-foreground uppercase">Profile</p>
        <h2 className="font-heading text-[2.35rem] leading-[1.05] font-extrabold tracking-[-0.05em]">
          나의 생활
          <br />
          리듬을 보여주세요
        </h2>
        <p className="max-w-[30ch] text-sm leading-relaxed text-muted-foreground">
          소개와 희망 조건이 채워질수록 더 정확한 Twin 매칭이 됩니다.
        </p>
      </div>

      <div className="animate-twin-rise delay-1 flex items-center gap-4">
        <Avatar className="size-16 after:border-primary/40">
          <AvatarFallback className="font-heading bg-secondary text-lg font-bold text-primary">
            TW
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-heading text-xl font-bold tracking-tight">게스트</p>
          <p className="mt-1 text-sm text-muted-foreground">프로필을 완성하면 매칭이 열립니다</p>
        </div>
      </div>

      <div className="animate-twin-rise delay-2 space-y-3">
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-[28%] rounded-full bg-primary" />
        </div>
        <p className="text-xs font-medium tracking-wide text-muted-foreground">프로필 완성도 28%</p>
        <Button className="h-12 w-full rounded-2xl text-base font-bold" size="lg">
          프로필 이어서 작성
        </Button>
      </div>
    </section>
  )
}
