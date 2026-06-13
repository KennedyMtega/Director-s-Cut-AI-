import { NextRequest, NextResponse } from 'next/server'
import { getBackgrounds } from '@/lib/renderer'
import path from 'path'
import fs from 'fs'

const BACKGROUNDS_DIR = path.join(process.cwd(), 'backgrounds')

export async function GET() {
  const files = getBackgrounds()
  return NextResponse.json({ backgrounds: files })
}

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

  if (!/\.(mp4|mov|webm|mkv)$/i.test(file.name))
    return NextResponse.json({ error: 'Must be a video file (mp4, mov, webm, mkv)' }, { status: 400 })

  if (!fs.existsSync(BACKGROUNDS_DIR)) fs.mkdirSync(BACKGROUNDS_DIR, { recursive: true })

  const arrayBuf = await file.arrayBuffer()
  const buf = Buffer.from(arrayBuf)
  const dest = path.join(BACKGROUNDS_DIR, file.name)
  fs.writeFileSync(dest, buf)

  return NextResponse.json({ success: true, filename: file.name })
}

export async function DELETE(req: NextRequest) {
  const { filename } = await req.json() as { filename: string }
  const fp = path.join(BACKGROUNDS_DIR, path.basename(filename))
  if (fs.existsSync(fp)) fs.unlinkSync(fp)
  return NextResponse.json({ success: true })
}
