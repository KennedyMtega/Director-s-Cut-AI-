'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Eye, FileVideo, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const d = await fetch('/api/analytics').then(r => r.json())
    setData(d)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const local = data?.local
  const yt = data?.youtube

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[length:var(--text-fluid-2xl)] font-bold font-[var(--font-playfair)]">Analytics</h1>
          <p className="text-muted-foreground text-[length:var(--text-fluid-sm)] mt-1">YouTube stats via Composio · Local queue overview</p>
        </div>
        <Button onClick={load} variant="outline" size="sm" className="gap-2 text-[length:var(--text-fluid-sm)]">
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />Refresh
        </Button>
      </div>

      {/* Local stats */}
      <div>
        <h2 className="text-[length:var(--text-fluid-base)] font-semibold mb-3 text-muted-foreground uppercase tracking-wider text-[length:var(--text-fluid-xs)]">Content Queue</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total Quotes', value: local?.totalQuotes },
            { label: 'Used', value: local?.usedQuotes },
            { label: 'Remaining', value: local?.remaining },
            { label: 'Posted', value: local?.postedCount },
          ].map(s => (
            <Card key={s.label} className="bg-card border-border">
              <CardContent className="pt-4 pb-4">
                <p className="text-[length:var(--text-fluid-xl)] font-bold">{s.value ?? '—'}</p>
                <p className="text-[length:var(--text-fluid-xs)] text-muted-foreground mt-1">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* YouTube stats */}
      <div>
        <h2 className="text-[length:var(--text-fluid-xs)] font-semibold mb-3 text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          ▶ YouTube Channel
        </h2>
        {!yt ? (
          <Card className="bg-card border-border">
            <CardContent className="pt-4 pb-4">
              <p className="text-[length:var(--text-fluid-sm)] text-muted-foreground">
                {loading ? 'Loading…' : 'YouTube data unavailable. Check COMPOSIO_API_KEY in .env.local'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-card border-border">
                <CardContent className="pt-4 pb-4 flex items-start gap-3">
                  <Users size={16} className="text-red-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[length:var(--text-fluid-xl)] font-bold">{yt.subscriberCount?.toLocaleString() ?? '—'}</p>
                    <p className="text-[length:var(--text-fluid-xs)] text-muted-foreground">Subscribers</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="pt-4 pb-4 flex items-start gap-3">
                  <Eye size={16} className="text-blue-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[length:var(--text-fluid-xl)] font-bold">{yt.totalViews?.toLocaleString() ?? '—'}</p>
                    <p className="text-[length:var(--text-fluid-xs)] text-muted-foreground">Total Views</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {yt.recentVideos?.length > 0 && (
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-[length:var(--text-fluid-sm)]">Recent Videos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {yt.recentVideos.map((v: any) => (
                    <div key={v.id} className="flex items-center justify-between gap-3 p-2 rounded bg-secondary/50">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileVideo size={13} className="text-muted-foreground shrink-0" />
                        <a href={v.url} target="_blank" rel="noreferrer" className="text-[length:var(--text-fluid-xs)] truncate hover:text-primary">{v.title}</a>
                      </div>
                      <span className="text-[length:var(--text-fluid-xs)] text-muted-foreground shrink-0">{v.views.toLocaleString()} views</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
