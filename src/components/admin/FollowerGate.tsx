import { Progress } from '@/components/ui/progress'

interface FollowerGateProps {
  currentCount: number
  threshold: number
  platform: string
  children: React.ReactNode
}

export function FollowerGate({ currentCount, threshold, platform, children }: FollowerGateProps) {
  const unlocked = currentCount >= threshold
  const pct = Math.min(100, Math.round((currentCount / threshold) * 100))

  if (unlocked) return <>{children}</>

  return (
    <div className="relative">
      <div className="blur-sm pointer-events-none select-none opacity-40">{children}</div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/80 rounded-lg p-6">
        <p className="text-white text-sm font-light tracking-wide mb-1">Unlock at {threshold.toLocaleString()} {platform} followers</p>
        <p className="text-zinc-500 text-xs mb-4">{currentCount.toLocaleString()} / {threshold.toLocaleString()}</p>
        <div className="w-48">
          <Progress value={pct} className="h-1 bg-zinc-800" />
        </div>
        <p className="text-zinc-600 text-xs mt-2">{pct}% there</p>
      </div>
    </div>
  )
}
