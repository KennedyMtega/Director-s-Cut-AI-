'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Play, Upload } from 'lucide-react'
import type { Quote } from '@/types'

const STYLE_COLOR: Record<string, string> = {
  A: 'bg-violet-500/15 text-violet-300 border-violet-500/20',
  B: 'bg-red-500/15 text-red-300 border-red-500/20',
  C: 'bg-blue-500/15 text-blue-300 border-blue-500/20',
  D: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/20',
  E: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
}

const STYLE_LABEL: Record<string, string> = {
  A: 'Kina cha Hisia', B: 'Saikolojia ya Giza', C: 'Majonzi ya Moyo',
  D: 'Akili ya Kiongozi', E: 'Thamani ya Nafsi',
}

export default function Library() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [tab, setTab] = useState('unused')
  const [rendering, setRendering] = useState<number | null>(null)
  const [msg, setMsg] = useState<Record<number, string>>({})

  async function load(filter = tab) {
    const data = await fetch(`/api/quotes?filter=${filter}`).then(r => r.json())
    setQuotes(data.quotes ?? [])
  }

  useEffect(() => { load() }, [])

  async function handleRender(quoteId: number) {
    setRendering(quoteId)
    setMsg(m => ({ ...m, [quoteId]: 'Rendering…' }))
    const res = await fetch('/api/render', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quoteId }),
    }).then(r => r.json())
    setRendering(null)
    if (res.postId) {
      setMsg(m => ({ ...m, [quoteId]: '✓ Rendered! Go to Dashboard to publish.' }))
      load('unused')
    } else {
      setMsg(m => ({ ...m, [quoteId]: `✗ ${res.error}` }))
    }
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    const data = JSON.parse(text)
    const quotes = Array.isArray(data) ? data : data.quotes
    const res = await fetch('/api/quotes', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quotes }),
    }).then(r => r.json())
    alert(`Imported ${res.inserted} new quotes`)
    load(tab)
    e.target.value = ''
  }

  const filtered = quotes.filter(q =>
    tab === 'unused' ? !q.used : tab === 'used' ? q.used : true
  )

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[length:var(--text-fluid-2xl)] font-bold font-[var(--font-playfair)]">Quotes Library</h1>
          <p className="text-muted-foreground text-[length:var(--text-fluid-sm)] mt-1">{quotes.filter(q => !q.used).length} unused · {quotes.filter(q => q.used).length} used</p>
        </div>
        <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-transparent text-[length:var(--text-fluid-sm)] hover:bg-secondary transition-colors">
          <input type="file" accept=".json" className="hidden" onChange={handleImport} />
          <Upload size={14} />Import JSON
        </label>
      </div>

      <Tabs value={tab} onValueChange={v => { setTab(v); load(v) }}>
        <TabsList className="bg-secondary">
          <TabsTrigger value="unused" className="text-[length:var(--text-fluid-sm)]">Unused ({quotes.filter(q => !q.used).length})</TabsTrigger>
          <TabsTrigger value="used" className="text-[length:var(--text-fluid-sm)]">Used ({quotes.filter(q => q.used).length})</TabsTrigger>
          <TabsTrigger value="all" className="text-[length:var(--text-fluid-sm)]">All ({quotes.length})</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4 space-y-3">
          {filtered.length === 0 && (
            <p className="text-muted-foreground text-[length:var(--text-fluid-sm)]">No quotes in this category.</p>
          )}
          {filtered.map(q => (
            <Card key={q.id} className={`bg-card border-border transition-opacity ${q.used ? 'opacity-50' : ''}`}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-[length:var(--text-fluid-xs)] font-medium border ${STYLE_COLOR[q.style]}`}>
                        {q.style} · {STYLE_LABEL[q.style]}
                      </span>
                      {q.used && <span className="text-[length:var(--text-fluid-xs)] text-muted-foreground">Used {q.used_at ? new Date(q.used_at).toLocaleDateString() : ''}</span>}
                    </div>
                    <p className="font-semibold text-[length:var(--text-fluid-base)] font-[var(--font-playfair)]">{q.hook}</p>
                    <p className="text-muted-foreground text-[length:var(--text-fluid-sm)] whitespace-pre-line leading-relaxed">{q.body}</p>
                    <p className="text-[length:var(--text-fluid-xs)] text-muted-foreground italic">{q.cta}</p>
                  </div>
                  {!q.used && (
                    <div className="shrink-0">
                      {msg[q.id] ? (
                        <p className={`text-[length:var(--text-fluid-xs)] ${msg[q.id].startsWith('✓') ? 'text-emerald-400' : 'text-destructive'}`}>{msg[q.id]}</p>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleRender(q.id)}
                          disabled={rendering === q.id}
                          className="gap-1.5 text-[length:var(--text-fluid-xs)]"
                        >
                          {rendering === q.id ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
                          Render
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
