import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/admin/Header'
import { FollowerGate } from '@/components/admin/FollowerGate'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DollarSign, ShoppingBag, Mail, Rss } from 'lucide-react'
import type { MonetizationConfig, PostMetric } from '@/types/database'

export default async function MonetizationPage() {
  const supabase = await createClient()

  const [{ data: configRaw }, { data: igMetricsRaw }, { data: ytMetricsRaw }] = await Promise.all([
    supabase.from('monetization_config').select('*').single(),
    supabase.from('post_metrics').select('follower_count').eq('platform', 'instagram').order('recorded_at', { ascending: false }).limit(1),
    supabase.from('post_metrics').select('follower_count').eq('platform', 'youtube').order('recorded_at', { ascending: false }).limit(1),
  ])

  const config = configRaw as MonetizationConfig | null
  const igMetrics = (igMetricsRaw ?? []) as Pick<PostMetric, 'follower_count'>[]
  const ytMetrics = (ytMetricsRaw ?? []) as Pick<PostMetric, 'follower_count'>[]

  const igFollowers = igMetrics[0]?.follower_count ?? 0
  const ytSubs = ytMetrics[0]?.follower_count ?? 0
  const threshold = config?.instagram_follower_threshold ?? 100000
  const ytThreshold = config?.youtube_subscriber_threshold ?? 100000

  const monetizationMethods = [
    { icon: ShoppingBag, title: 'Digital Products', desc: 'Ebooks, templates, and courses sold directly from your link-in-bio', status: 'planned' },
    { icon: DollarSign, title: 'Website Ad Revenue', desc: 'Google AdSense and display ads on your companion website once it launches', status: 'planned' },
    { icon: Rss, title: 'Sponsored Posts', desc: 'Brand collaborations and paid content for aligned brands', status: 'planned' },
    { icon: Mail, title: 'Paid Newsletter / Community', desc: 'Exclusive content, early access, and direct connection for superfans', status: 'planned' },
  ]

  return (
    <div>
      <Header
        title="Monetization"
        description="Unlocks automatically when you reach 100k on each platform"
      />

      <div className="flex gap-6 mb-8">
        <div className="text-center">
          <p className="text-zinc-600 text-xs uppercase tracking-wider">Instagram</p>
          <p className="text-white text-2xl font-light">{igFollowers.toLocaleString()}</p>
          <p className="text-zinc-600 text-xs">/ {threshold.toLocaleString()}</p>
        </div>
        <div className="text-center">
          <p className="text-zinc-600 text-xs uppercase tracking-wider">YouTube</p>
          <p className="text-white text-2xl font-light">{ytSubs.toLocaleString()}</p>
          <p className="text-zinc-600 text-xs">/ {ytThreshold.toLocaleString()}</p>
        </div>
      </div>

      <FollowerGate currentCount={igFollowers} threshold={threshold} platform="Instagram">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {monetizationMethods.map(({ icon: Icon, title, desc, status }) => (
            <Card key={title} className="bg-zinc-950 border-zinc-800">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-white text-sm font-light">
                  <Icon size={14} className="text-zinc-500" />
                  {title}
                  <Badge variant="outline" className="ml-auto text-xs border-zinc-700 text-zinc-500">{status}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-zinc-500 text-xs">{desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </FollowerGate>
    </div>
  )
}
