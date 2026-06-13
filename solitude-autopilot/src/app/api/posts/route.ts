import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET() {
  const db = getDb()
  const posts = db.prepare(`
    SELECT p.*, q.hook, q.body, q.style, q.style_label, q.caption
    FROM posts p
    JOIN quotes q ON p.quote_id = q.id
    ORDER BY p.created_at DESC
    LIMIT 50
  `).all()
  return NextResponse.json({ posts })
}
