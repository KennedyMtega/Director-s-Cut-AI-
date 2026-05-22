import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/admin/Header'
import { StatsCard } from '@/components/admin/StatsCard'
import { AnalyticsChart } from '@/components/admin/AnalyticsChart'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Heart, Eye, Users } from 'lucide-react'
import type { PostMetric } from '@/types/database'

export default async function AnalyticsPage() {
  const supabase = await createClient()

  const { data: metricsRaw } = await supabase
    .from('post_metrics')
    .select('*')
    .order('recorded_at', { ascending: false })

  const metrics = (metricsRaw ?? []) as PostMetric[]

  const igMetrics = metrics.filter((m) => m.platform === 'instagram')
  const ytMetrics = metrics.filter((m) => m.platform === 'youtube')

  const totalLikes = igMetrics.reduce((s, m) => s + m.likes, 0)
  const totalReach = igMetrics.reduce((s, m) => s + m.reach, 0)
  const igFollowers = igMetrics[0]?.follower_count ?? 0
  const ytSubs = ytMetrics[0]?.follower_count ?? 0

  function buildChartData(data: PostMetric[], platform: string) {
    const byDate: Record<string, { likes: number; reach: number; views: number; comments: number }> = {}
    for (const m of data.filter((d) => d.platform === platform)) {
      const date = new Date(m.recorded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      if (!byDate[date]) byDate[date] = { likes: 0, reach: 0, views: 0, comments: 0 }
      byDate[date].likes += m.likes
      byDate[date].reach += m.reach
      byDate[date].views += m.views
      byDate[date].comments += m.comments
    }
    return Object.entries(byDate).map(([date, vals]) => ({ date, ...vals })).slice(0, 30)
  }

  const igChartData = buildChartData(metrics, 'instagram')
  const ytChartData = buildChartData(metrics, 'youtube')

  return (
    <div>
      <Header title="Analytics" description="Performance across all platforms" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatsCard title="IG Followers" value={igFollowers.toLocaleString()} icon={Users} />
        <StatsCard title="YT Subscribers" value={ytSubs.toLocaleString()} icon={Users} />
        <StatsCard title="Total Likes (IG)" value={totalLikes.toLocaleString()} icon={Heart} />
        <StatsCard title="Total Reach (IG)" value={totalReach.toLocaleString()} icon={Eye} />
      </div>

      <Tabs defaultValue="instagram">
        <TabsList className="bg-zinc-900 border border-zinc-800">
          <TabsTrigger value="instagram" className="text-xs data-[state=active]:bg-zinc-700">Instagram</TabsTrigger>
          <TabsTrigger value="youtube" className="text-xs data-[state=active]:bg-zinc-700">YouTube</TabsTrigger>
        </TabsList>

        <TabsContent value="instagram" className="mt-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4">
            <p className="text-zinc-500 text-xs uppercase tracking-wider mb-4">Likes & Reach over time</p>
            <AnalyticsChart data={igChartData} metrics={['likes', 'reach']} />
          </div>
        </TabsContent>

        <TabsContent value="youtube" className="mt-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4">
            <p className="text-zinc-500 text-xs uppercase tracking-wider mb-4">Views & Likes over time</p>
            <AnalyticsChart data={ytChartData} metrics={['views', 'likes']} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
