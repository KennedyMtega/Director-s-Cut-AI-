import path from 'path'
import fs from 'fs'
import { randomUUID } from 'crypto'
import { execFile } from 'child_process'

const OUTPUT_DIR = path.join(process.cwd(), 'output')
const BACKGROUNDS_DIR = path.join(process.cwd(), 'backgrounds')
const WORKER_SCRIPT = path.join(process.cwd(), 'scripts', 'render-video.js')

export function ensureDirs() {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  if (!fs.existsSync(BACKGROUNDS_DIR)) fs.mkdirSync(BACKGROUNDS_DIR, { recursive: true })
}

export function getBackgrounds(): string[] {
  ensureDirs()
  try {
    return fs.readdirSync(BACKGROUNDS_DIR)
      .filter(f => /\.(mp4|mov|webm|mkv)$/i.test(f))
  } catch {
    return []
  }
}

export function pickBackground(): string {
  const files = getBackgrounds()
  if (files.length === 0) return ''
  return '/backgrounds/' + files[Math.floor(Math.random() * files.length)]
}

export interface RenderParams {
  hook: string
  body: string
  watermark: string
  style: string
  backgroundVideo?: string
}

export function renderVideo(params: RenderParams): Promise<string> {
  ensureDirs()
  const id = randomUUID()
  const outFile = path.join(OUTPUT_DIR, `${id}.mp4`)
  const bgVideo = params.backgroundVideo ?? pickBackground()

  const workerParams = {
    hook: params.hook,
    body: params.body,
    watermark: params.watermark,
    style: params.style,
    backgroundVideo: bgVideo,
    outputPath: outFile,
  }

  const encoded = Buffer.from(JSON.stringify(workerParams)).toString('base64')

  return new Promise((resolve, reject) => {
    execFile(
      process.execPath,                    // the current node binary
      [WORKER_SCRIPT, encoded],
      { timeout: 300_000, maxBuffer: 10 * 1024 * 1024 },
      (err, stdout, stderr) => {
        if (process.env.NODE_ENV !== 'production') {
          console.log('[render-worker stdout]', stdout.trim())
          console.error('[render-worker stderr]', stderr.trim())
        }
        if (err) return reject(new Error(stderr.trim() || err.message))
        const outputPath = stdout.trim()
        if (!outputPath || !fs.existsSync(outputPath)) {
          return reject(new Error('Render produced no output file'))
        }
        resolve(outputPath)
      }
    )
  })
}

export function cleanOldOutputs(keepHours = 24) {
  if (!fs.existsSync(OUTPUT_DIR)) return
  const cutoff = Date.now() - keepHours * 3600 * 1000
  for (const f of fs.readdirSync(OUTPUT_DIR)) {
    const fp = path.join(OUTPUT_DIR, f)
    try {
      if (fs.statSync(fp).mtimeMs < cutoff) fs.unlinkSync(fp)
    } catch { /* ignore */ }
  }
}
