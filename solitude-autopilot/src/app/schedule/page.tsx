'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function SchedulePage() {
  const [settings, setSettings] = useState({ schedule_time_1: '07:00', schedule_time_2: '19:00', auto_schedule: '1' })
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

  // Calculate UTC times for display
  function toUTC(eatTime: string) {
    const [h, m] = eatTime.split(':').map(Number)
    let utcH = h - 3; if (utcH < 0) utcH += 24
    return `${String(utcH).padStart(2, '0')}:${String(m).padStart(2, '0')} UTC`
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[length:var(--text-fluid-2xl)] font-bold font-[var(--font-playfair)]">Schedule</h1>
        <p className="text-muted-foreground text-[length:var(--text-fluid-sm)] mt-1">Configure when posts go out automatically (EAT timezone)</p>
      </div>

      <Card className="bg-card border-border max-w-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-[length:var(--text-fluid-base)]">Posting Times (EAT · UTC+3)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {[1, 2].map(n => {
            const key = `schedule_time_${n}` as 'schedule_time_1' | 'schedule_time_2'
            return (
              <div key={n} className="space-y-1.5">
                <label className="text-[length:var(--text-fluid-sm)] font-medium">Post {n}</label>
                <div className="flex items-center gap-3">
                  <input
                    type="time"
                    value={settings[key]}
                    onChange={e => setSettings(s => ({ ...s, [key]: e.target.value }))}
                    className="bg-secondary border border-border text-foreground rounded-md px-3 py-2 text-[length:var(--text-fluid-sm)] focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <span className="text-[length:var(--text-fluid-xs)] text-muted-foreground">{toUTC(settings[key])}</span>
                </div>
              </div>
            )
          })}

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={() => setSettings(s => ({ ...s, auto_schedule: s.auto_schedule === '1' ? '0' : '1' }))}
              className={`w-11 h-6 rounded-full transition-colors relative ${settings.auto_schedule === '1' ? 'bg-primary' : 'bg-secondary'}`}
            >
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.auto_schedule === '1' ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
            <label className="text-[length:var(--text-fluid-sm)]">Auto-schedule (while app is running)</label>
          </div>

          <Button onClick={save} className="bg-primary text-primary-foreground w-full text-[length:var(--text-fluid-sm)]">
            {saved ? '✓ Saved' : 'Save Schedule'}
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-card border-border max-w-md">
        <CardContent className="pt-4 pb-4 space-y-2 text-[length:var(--text-fluid-sm)]">
          <p className="text-muted-foreground">
            The app must be running for auto-schedule to work. For fully unattended posting, keep a terminal open with <code className="bg-secondary px-1 rounded">npm run dev</code>.
          </p>
          <p className="text-muted-foreground">
            Each auto-post picks the next unused quote in the library, renders it, posts to YouTube automatically, and queues Instagram for your confirmation.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
