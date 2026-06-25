'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    watermark: '@solitude_script',
    schedule_time_1: '07:00',
    schedule_time_2: '19:00',
    auto_schedule: '1',
  })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(d => setSettings(s => ({ ...s, ...d.settings })))
  }, [])

  async function save() {
    await fetch('/api/settings', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const field = (key: keyof typeof settings, label: string, type: 'text' | 'time' = 'text') => (
    <div className="space-y-1.5">
      <label className="text-[length:var(--text-fluid-sm)] font-medium">{label}</label>
      <input
        type={type}
        value={settings[key]}
        onChange={e => setSettings(s => ({ ...s, [key]: e.target.value }))}
        className="w-full bg-secondary border border-border text-foreground rounded-md px-3 py-2 text-[length:var(--text-fluid-sm)] focus:outline-none focus:ring-1 focus:ring-primary"
      />
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[length:var(--text-fluid-2xl)] font-bold font-[var(--font-playfair)]">Settings</h1>
        <p className="text-muted-foreground text-[length:var(--text-fluid-sm)] mt-1">Configure watermark, schedule, and app behaviour</p>
      </div>

      <Card className="bg-card border-border max-w-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-[length:var(--text-fluid-base)]">General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {field('watermark', 'Watermark text (shown on every video)')}
          {field('schedule_time_1', 'Post 1 time (EAT)', 'time')}
          {field('schedule_time_2', 'Post 2 time (EAT)', 'time')}

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSettings(s => ({ ...s, auto_schedule: s.auto_schedule === '1' ? '0' : '1' }))}
              className={`w-11 h-6 rounded-full transition-colors relative ${settings.auto_schedule === '1' ? 'bg-primary' : 'bg-secondary'}`}
            >
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.auto_schedule === '1' ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
            <label className="text-[length:var(--text-fluid-sm)]">Auto-schedule enabled</label>
          </div>

          <Button onClick={save} className="bg-primary text-primary-foreground w-full text-[length:var(--text-fluid-sm)]">
            {saved ? '✓ Saved' : 'Save Settings'}
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-card border-border max-w-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-[length:var(--text-fluid-base)]">Environment Variables</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-[length:var(--text-fluid-sm)] text-muted-foreground">
          <p>Set these in your <code className="bg-secondary px-1 rounded">.env.local</code> file:</p>
          <ul className="space-y-1 font-mono text-[length:var(--text-fluid-xs)]">
            <li><span className="text-primary">COMPOSIO_API_KEY</span>=your_key</li>
            <li><span className="text-primary">COMPOSIO_ENTITY_ID</span>=default</li>
          </ul>
          <p className="text-[length:var(--text-fluid-xs)]">Get your Composio API key from <a href="https://app.composio.dev" target="_blank" rel="noreferrer" className="text-primary underline">app.composio.dev</a> → Settings → API Keys</p>
        </CardContent>
      </Card>
    </div>
  )
}
