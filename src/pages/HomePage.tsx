import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1400&q=80";

export function HomePage() {
  return (
    <section className="relative flex min-h-[calc(100dvh-4.5rem-env(safe-area-inset-bottom))] flex-col overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={HERO_IMAGE}
          alt=""
          className="animate-twin-drift h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,oklch(0.14_0.02_155_/0.3)_0%,oklch(0.14_0.02_155_/0.52)_42%,oklch(0.14_0.02_155_/0.92)_78%,oklch(0.14_0.02_155)_100%)]" />
        <div
          aria-hidden
          className="animate-twin-orbit absolute -top-24 -right-20 size-72 rounded-full border border-primary/25"
        />
        <div
          aria-hidden
          className="animate-twin-breathe absolute top-[18%] left-[-18%] size-56 rounded-full bg-primary/25 blur-3xl"
        />
      </div>

      <div className="relative z-10 mt-auto flex flex-col px-5 pb-8 pt-[calc(env(safe-area-inset-top)+4.5rem)]">
        <div className="animate-twin-rise mb-7">
          <h1 className="font-heading text-[4.8rem] leading-[0.8] font-extrabold tracking-[-0.07em] text-white">
            Twin
            <span className="text-primary">.</span>
          </h1>
          <div className="mt-4 flex items-center gap-3">
            <span className="h-px w-10 bg-primary" />
            <p className="text-xs font-medium tracking-[0.22em] text-white/70 uppercase">
              two lives, one place
            </p>
          </div>
        </div>

        <h2 className="animate-twin-rise delay-1 font-heading max-w-[13ch] text-[1.95rem] leading-[1.15] font-bold tracking-[-0.03em] text-white">
          같이 살 사람을
          <br />
          감각으로 고르세요
        </h2>
        <p className="animate-twin-rise delay-2 mt-3 max-w-[28ch] text-sm leading-relaxed text-white/72">
          생활 리듬과 취향이 맞는 룸메이트를 '트윈'이 이어줍니다.
        </p>

        <div className="animate-twin-rise delay-3 mt-10 flex flex-col items-center gap-4">
          <Link
            to="/explore"
            className={cn(
              buttonVariants({ size: 'lg' }),
              'group h-12 min-w-[12.5rem] gap-2 rounded-full bg-primary px-7 text-[0.95rem] font-semibold tracking-[-0.01em] text-primary-foreground shadow-[0_12px_40px_oklch(0.86_0.2_125_/0.28)] transition-all duration-300 hover:bg-primary/90 hover:shadow-[0_16px_48px_oklch(0.86_0.2_125_/0.38)] active:scale-[0.98]',
            )}
          >
            룸메 찾기 시작
            <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
          <Link
            to="/profile"
            className="text-sm font-medium text-white/55 underline-offset-4 transition hover:text-white/85 hover:underline"
          >
            내 생활 프로필 만들기
          </Link>
        </div>
      </div>
    </section>
  );
}
