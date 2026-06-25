import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const filter = searchParams.get('filter') ?? 'all'
  const db = getDb()

  let sql = 'SELECT * FROM quotes ORDER BY id ASC'
  if (filter === 'unused') sql = 'SELECT * FROM quotes WHERE used = 0 ORDER BY id ASC'
  if (filter === 'used') sql = 'SELECT * FROM quotes WHERE used = 1 ORDER BY used_at DESC'

  const quotes = db.prepare(sql).all()
  return NextResponse.json({ quotes })
}

export async function POST(req: NextRequest) {
  const body = await req.json() as { quotes: unknown[] }
  const db = getDb()
  let inserted = 0

  const maxId = (db.prepare('SELECT MAX(id) as m FROM quotes').get() as { m: number | null }).m ?? 0
  const insert = db.prepare(
    `INSERT OR IGNORE INTO quotes (id, style, style_label, hook, body, caption, cta) VALUES (?, ?, ?, ?, ?, ?, ?)`
  )

  const insertMany = db.transaction((qs: any[]) => {
    for (let i = 0; i < qs.length; i++) {
      const q = qs[i]
      const r = insert.run(maxId + i + 1, q.style, q.style_label ?? q.style, q.hook, q.body, q.caption ?? '', q.cta ?? '')
      if (r.changes) inserted++
    }
  })

  insertMany(body.quotes as any[])
  return NextResponse.json({ inserted })
}
