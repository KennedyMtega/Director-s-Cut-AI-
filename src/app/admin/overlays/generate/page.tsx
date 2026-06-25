'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const STYLES = [
  { id: 'A', label: 'Kina cha Hisia', desc: 'Emotional Depth — vulnerability & inner world', color: 'border-violet-800 hover:border-violet-600 text-violet-300' },
  { id: 'B', label: 'Saikolojia ya Giza', desc: 'Dark Psychology — uncomfortable truths', color: 'border-rose-800 hover:border-rose-600 text-rose-300' },
  { id: 'C', label: 'Maumivu ya Moyo', desc: 'Heartbreak — loss & healing', color: 'border-blue-800 hover:border-blue-600 text-blue-300' },
  { id: 'D', label: 'Fikira za Juu', desc: 'Elite Mindset — discipline & solitude', color: 'border-amber-800 hover:border-amber-600 text-amber-300' },
] as const

export default function GenerateOverlaysPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [results, setResults] = useState<Record<string, number>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const router = useRouter()

  async function generate(style: 'A' | 'B' | 'C' | 'D') {
    setLoading(style)
    setErrors((prev) => ({ ...prev, [style]: '' }))

    try {
      const res = await fetch('/api/overlays/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ style, count: 25 }),
      })
      const data = await res.json() as { inserted?: number; error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Generation failed')
      setResults((prev) => ({ ...prev, [style]: data.inserted ?? 25 }))
    } catch (err) {
      setErrors((prev) => ({ ...prev, [style]: String(err) }))
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <Link
          href="/admin/overlays"
          className="flex items-center gap-2 text-zinc-500 hover:text-zinc-300 mb-4 transition-colors"
          style={{ fontSize: 'var(--text-fluid-sm)' }}
        >
          <ArrowLeft size={14} /> Back to Overlays
        </Link>
        <h1 className="text-white font-light tracking-widest uppercase" style={{ fontSize: 'var(--text-fluid-xl)' }}>
          Generate with Gemini
        </h1>
        <p className="text-zinc-500 mt-1" style={{ fontSize: 'var(--text-fluid-sm)' }}>
          Generate 25 new Swahili overlays per style using Gemini Flash (free tier).
        </p>
      </div>

      <div className="grid gap-4">
        {STYLES.map(({ id, label, desc, color }) => (
          <div
            key={id}
            className={`rounded-lg border bg-zinc-950 p-5 flex items-center justify-between gap-4 flex-wrap ${color}`}
          >
            <div>
              <p className="text-white font-medium" style={{ fontSize: 'var(--text-fluid-base)' }}>{label}</p>
              <p className="text-zinc-500 mt-0.5" style={{ fontSize: 'var(--text-fluid-xs)' }}>{desc}</p>
              {results[id] && (
                <p className="text-green-400 mt-1" style={{ fontSize: 'var(--text-fluid-xs)' }}>
                  ✓ {results[id]} overlays inserted
                </p>
              )}
              {errors[id] && (
                <p className="text-red-400 mt-1" style={{ fontSize: 'var(--text-fluid-xs)' }}>
                  {errors[id]}
                </p>
              )}
            </div>
            <button
              onClick={() => generate(id as 'A' | 'B' | 'C' | 'D')}
              disabled={loading !== null}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-800 text-white rounded-md hover:bg-zinc-700 transition-colors disabled:opacity-40 shrink-0"
              style={{ fontSize: 'var(--text-fluid-sm)' }}
            >
              <Sparkles size={14} />
              {loading === id ? 'Generating…' : 'Generate 25'}
            </button>
          </div>
        ))}
      </div>

      {Object.keys(results).length > 0 && (
        <button
          onClick={() => router.push('/admin/overlays')}
          className="w-full py-2.5 bg-white text-black rounded-md hover:bg-zinc-200 transition-colors"
          style={{ fontSize: 'var(--text-fluid-sm)' }}
        >
          Back to Overlays
        </button>
      )}
    </div>
  )
}
