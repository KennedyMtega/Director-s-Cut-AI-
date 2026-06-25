'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BookOpen, Clock, PlayCircle, Users, Zap, Loader2 } from 'lucide-react'

interface Stats {
  local: { totalQuotes: number; usedQuotes: number; remaining: number; totalPosts: number; postedCount: number }
  youtube: { subscriberCount: number; totalViews: number } | null
}

interface Post {
  id: string; hook: string; status: string; youtube_url: string | null
  instagram_status: string; posted_at: string | null; style: string
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [posting, setPosting] = useState(false)
  const [msg, setMsg] = useState('')

  async function load() {
    const [s, p] = await Promise.all([
      fetch('/api/analytics').then(r => r.json()),
      fetch('/api/posts').then(r => r.json()),
    ])
    setStats(s)
    setPosts(p.posts ?? [])
  }

  useEffect(() => { load() }, [])

  async function postNow() {
    setPosting(true); setMsg('')
    const res = await fetch('/api/schedule', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'post_now' }),
    }).then(r => r.json())
    setPosting(false)
    setMsg(res.success ? '✓ Posted successfully!' : `✗ ${res.error}`)
    load()
  }

  const STYLE_COLOR: Record<string, string> = {
    A: 'bg-violet-500/15 text-violet-300',
    B: 'bg-red-500/15 text-red-300',
    C: 'bg-blue-500/15 text-blue-300',
    D: 'bg-yellow-500/15 text-yellow-300',
    E: 'bg-emerald-500/15 text-emerald-300',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[length:var(--text-fluid-2xl)] font-bold font-[var(--font-playfair)]">Dashboard</h1>
        <p className="text-muted-foreground text-[length:var(--text-fluid-sm)] mt-1">@solitude_script Autopilot Control Panel</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Quotes Left', value: stats?.local.remaining ?? '—', icon: BookOpen, color: 'text-violet-400' },
          { label: 'Used', value: stats?.local.usedQuotes ?? '—', icon: Clock, color: 'text-muted-foreground' },
          { label: 'YT Subscribers', value: stats?.youtube?.subscriberCount?.toLocaleString() ?? '—', icon: Users, color: 'text-red-400' },
          { label: 'Total Views', value: stats?.youtube?.totalViews?.toLocaleString() ?? '—', icon: Zap, color: 'text-yellow-400' },
        ].map(s => (
          <Card key={s.label} className="bg-card border-border">
            <CardContent className="pt-4 pb-4">
              <div className={`${s.color} mb-1`}><s.icon size={16} /></div>
              <p className="text-[length:var(--text-fluid-xl)] font-bold leading-none">{s.value}</p>
              <p className="text-[length:var(--text-fluid-xs)] text-muted-foreground mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Post Now */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-[length:var(--text-fluid-base)]">Post Now</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-[length:var(--text-fluid-sm)] text-muted-foreground">
            Immediately render the next unused quote and post to YouTube. Instagram will be queued for your confirmation.
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <Button onClick={postNow} disabled={posting} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {posting ? <><Loader2 size={14} className="mr-2 animate-spin" />Rendering & Posting…</> : '⚡ Post Now'}
            </Button>
            {msg && <p className={`text-[length:var(--text-fluid-sm)] ${msg.startsWith('✓') ? 'text-emerald-400' : 'text-destructive'}`}>{msg}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Recent posts */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-[length:var(--text-fluid-base)]">Recent Posts</CardTitle>
        </CardHeader>
        <CardContent>
          {posts.length === 0 ? (
            <p className="text-muted-foreground text-[length:var(--text-fluid-sm)]">No posts yet. Hit "Post Now" to create your first video.</p>
          ) : (
            <div className="space-y-2">
              {posts.slice(0, 8).map(p => (
                <div key={p.id} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50 text-[length:var(--text-fluid-sm)]">
                  <span className={`shrink-0 px-1.5 py-0.5 rounded text-[length:var(--text-fluid-xs)] font-medium ${STYLE_COLOR[p.style] ?? ''}`}>{p.style}</span>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">{p.hook}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className={`text-[length:var(--text-fluid-xs)] ${p.status === 'posted' ? 'text-emerald-400' : p.status === 'failed' ? 'text-destructive' : 'text-muted-foreground'}`}>{p.status}</span>
                      {p.youtube_url && <a href={p.youtube_url} target="_blank" rel="noreferrer" className="text-[length:var(--text-fluid-xs)] text-red-400 hover:underline">▶ YouTube</a>}
                      {p.instagram_status === 'queued' && <span className="text-[length:var(--text-fluid-xs)] text-pink-400">📸 Confirm IG</span>}
                    </div>
                  </div>
                  {p.posted_at && <p className="shrink-0 text-[length:var(--text-fluid-xs)] text-muted-foreground">{new Date(p.posted_at).toLocaleDateString()}</p>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
