'use client'

import { useRef, useState } from 'react'
import { Upload } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function OverlayImporter() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const router = useRouter()

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setStatus('loading')
    setMessage('')

    try {
      const text = await file.text()
      const overlays = JSON.parse(text) as unknown[]

      if (!Array.isArray(overlays)) throw new Error('File must be a JSON array')

      const res = await fetch('/api/overlays/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ overlays }),
      })

      const data = await res.json() as { inserted?: number; error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Import failed')

      setStatus('done')
      setMessage(`Imported ${data.inserted} overlays`)
      router.refresh()
    } catch (err) {
      setStatus('error')
      setMessage(String(err))
    } finally {
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-5">
      <h2 className="text-zinc-300 mb-3" style={{ fontSize: 'var(--text-fluid-sm)' }}>
        Import JSON batch
      </h2>
      <p className="text-zinc-600 mb-4" style={{ fontSize: 'var(--text-fluid-xs)' }}>
        Upload a JSON file with an array of overlays: <code className="text-zinc-400">{'[{ hook, body, caption, cta, style, style_label }]'}</code>
      </p>
      <input
        ref={inputRef}
        type="file"
        accept=".json"
        onChange={handleFile}
        className="hidden"
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={status === 'loading'}
        className="flex items-center gap-2 px-4 py-2 bg-zinc-800 text-white rounded-md hover:bg-zinc-700 transition-colors disabled:opacity-50"
        style={{ fontSize: 'var(--text-fluid-sm)' }}
      >
        <Upload size={14} />
        {status === 'loading' ? 'Importing…' : 'Choose JSON file'}
      </button>
      {message && (
        <p className={`mt-3 ${status === 'error' ? 'text-red-400' : 'text-green-400'}`} style={{ fontSize: 'var(--text-fluid-xs)' }}>
          {message}
        </p>
      )}
    </div>
  )
}
