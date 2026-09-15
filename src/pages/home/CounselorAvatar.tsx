export const COUNSELOR_IMG = {
  idle: "/images/01_idle.png",
  greeting: "/images/02_greeting.png",
  wink: "/images/03_wink.png",
  thinking: "/images/04_thinking.png",
  walkaway: "/images/12_walkaway.png",
} as const;

export type CounselorMood = keyof typeof COUNSELOR_IMG;

type CounselorAvatarProps = {
  mood?: CounselorMood;
  className?: string;
};

export function CounselorAvatar({
  mood = "idle",
  className,
}: CounselorAvatarProps) {
  return (
    <span className={className} aria-hidden>
      <img src={COUNSELOR_IMG[mood]} alt="" />
    </span>
  );
}
