import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { OverlayImporter } from './OverlayImporter'

export default async function OverlaysPage() {
  const supabase = createAdminClient()

  const { data: all } = await supabase
    .from('content_overlays')
    .select('id, hook, style, style_label, used_at, created_at')
    .order('created_at', { ascending: true })

  const total = all?.length ?? 0
  const used = all?.filter((o) => o.used_at).length ?? 0
  const unused = total - used

  const styleLabels: Record<string, string> = {
    A: 'Kina cha Hisia',
    B: 'Saikolojia ya Giza',
    C: 'Maumivu ya Moyo',
    D: 'Fikira za Juu',
  }

  const styleBadge: Record<string, string> = {
    A: 'bg-violet-900/50 text-violet-300',
    B: 'bg-rose-900/50 text-rose-300',
    C: 'bg-blue-900/50 text-blue-300',
    D: 'bg-amber-900/50 text-amber-300',
  }

  const unusedOverlays = all?.filter((o) => !o.used_at) ?? []

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-white font-light tracking-widest uppercase" style={{ fontSize: 'var(--text-fluid-xl)' }}>
            Overlays
          </h1>
          <p className="text-zinc-500 mt-1" style={{ fontSize: 'var(--text-fluid-sm)' }}>
            Pre-generated Swahili content queue
          </p>
        </div>
        <Link
          href="/admin/overlays/generate"
          className="flex items-center gap-2 px-4 py-2 bg-zinc-800 text-white rounded-md hover:bg-zinc-700 transition-colors"
          style={{ fontSize: 'var(--text-fluid-sm)' }}
        >
          <Sparkles size={14} />
          Generate with Gemini
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total', value: total },
          { label: 'Unused', value: unused, highlight: unused < 20 },
          { label: 'Used', value: used },
        ].map(({ label, value, highlight }) => (
          <div key={label} className={`rounded-lg border p-4 ${highlight ? 'border-amber-800 bg-amber-950/30' : 'border-zinc-800 bg-zinc-950'}`}>
            <p className="text-zinc-500 uppercase tracking-wider" style={{ fontSize: 'var(--text-fluid-xs)' }}>{label}</p>
            <p className={`font-light mt-1 ${highlight ? 'text-amber-400' : 'text-white'}`} style={{ fontSize: 'var(--text-fluid-xl)' }}>
              {value}
            </p>
            {highlight && (
              <p className="text-amber-600 mt-1" style={{ fontSize: 'var(--text-fluid-xs)' }}>Running low — generate more</p>
            )}
          </div>
        ))}
      </div>

      {/* Import */}
      <OverlayImporter />

      {/* Unused overlays table */}
      <div>
        <h2 className="text-zinc-400 uppercase tracking-wider mb-3" style={{ fontSize: 'var(--text-fluid-xs)' }}>
          Upcoming ({unusedOverlays.length})
        </h2>
        <div className="rounded-lg border border-zinc-800 overflow-hidden">
          {unusedOverlays.length === 0 ? (
            <p className="text-zinc-600 p-6 text-center" style={{ fontSize: 'var(--text-fluid-sm)' }}>
              No overlays remaining. Generate a new batch.
            </p>
          ) : (
            <div className="divide-y divide-zinc-800/60">
              {unusedOverlays.map((o) => (
                <div key={o.id} className="flex items-start gap-4 px-4 py-3">
                  <span className={`shrink-0 px-2 py-0.5 rounded text-xs font-medium ${styleBadge[o.style]}`}>
                    {o.style} · {styleLabels[o.style]}
                  </span>
                  <p className="text-zinc-300 flex-1 truncate" style={{ fontSize: 'var(--text-fluid-sm)' }}>
                    {o.hook}
                  </p>
                  <p className="shrink-0 text-zinc-600" style={{ fontSize: 'var(--text-fluid-xs)' }}>
                    {new Date(o.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
