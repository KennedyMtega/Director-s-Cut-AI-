import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  sub?: string
  icon?: LucideIcon
}

export function StatsCard({ title, value, sub, icon: Icon }: StatsCardProps) {
  return (
    <Card className="bg-zinc-950 border-zinc-800">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-zinc-400 text-xs font-normal uppercase tracking-wider">{title}</CardTitle>
        {Icon && <Icon size={14} className="text-zinc-600" />}
      </CardHeader>
      <CardContent>
        <p className="text-white text-2xl font-light">{value}</p>
        {sub && <p className="text-zinc-600 text-xs mt-1">{sub}</p>}
      </CardContent>
    </Card>
  )
}
