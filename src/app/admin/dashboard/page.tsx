import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/admin/Header'
import { StatsCard } from '@/components/admin/StatsCard'
import { PostCard } from '@/components/admin/PostCard'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { FileVideo, Heart, Users, Eye } from 'lucide-react'
import type { ContentPost, PostMetric } from '@/types/database'

export default async function DashboardPage() {
  const supabase = await createClient()

  const [{ count: totalPosts }, { data: recentPostsRaw }, { data: latestMetricsRaw }] = await Promise.all([
    supabase.from('content_posts').select('id', { count: 'exact', head: true }).eq('status', 'posted'),
    supabase.from('content_posts').select('*').order('created_at', { ascending: false }).limit(6),
    supabase.from('post_metrics').select('platform, likes, reach, follower_count').order('recorded_at', { ascending: false }).limit(100),
  ])

  const recentPosts = (recentPostsRaw ?? []) as ContentPost[]
  const latestMetrics = (latestMetricsRaw ?? []) as Pick<PostMetric, 'platform' | 'likes' | 'reach' | 'follower_count'>[]

  const igMetrics = latestMetrics.filter((m) => m.platform === 'instagram')
  const totalLikes = igMetrics.reduce((sum, m) => sum + (m.likes ?? 0), 0)
  const totalReach = igMetrics.reduce((sum, m) => sum + (m.reach ?? 0), 0)
  const igFollowers = igMetrics[0]?.follower_count ?? 0

  return (
    <div>
      <Header
        title="Dashboard"
        description="Your automation overview"
        actions={
          <Link href="/admin/content/new">
            <Button className="bg-white text-black hover:bg-zinc-200 text-sm">
              Generate Today's Post
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatsCard title="Posts Published" value={totalPosts ?? 0} icon={FileVideo} />
        <StatsCard title="Total Likes" value={totalLikes.toLocaleString()} icon={Heart} />
        <StatsCard title="Total Reach" value={totalReach.toLocaleString()} icon={Eye} />
        <StatsCard title="IG Followers" value={igFollowers.toLocaleString()} icon={Users} />
      </div>

      <div>
        <h3 className="text-zinc-400 text-xs uppercase tracking-wider mb-4">Recent Content</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
          {recentPosts.length === 0 && (
            <p className="text-zinc-600 text-sm col-span-3">No posts yet. Generate your first one above.</p>
          )}
        </div>
      </div>
    </div>
  )
}
