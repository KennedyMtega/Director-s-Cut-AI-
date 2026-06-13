import path from 'path'
import fs from 'fs'
import { execSync } from 'child_process'
import { randomUUID } from 'crypto'

const OUTPUT_DIR = path.join(process.cwd(), 'output')
const BACKGROUNDS_DIR = path.join(process.cwd(), 'backgrounds')

export function ensureDirs() {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  if (!fs.existsSync(BACKGROUNDS_DIR)) fs.mkdirSync(BACKGROUNDS_DIR, { recursive: true })
}

export function getBackgrounds(): string[] {
  ensureDirs()
  return fs.readdirSync(BACKGROUNDS_DIR)
    .filter(f => /\.(mp4|mov|webm|mkv)$/i.test(f))
    .map(f => f)
}

export function pickBackground(): string {
  const files = getBackgrounds()
  if (files.length === 0) return '/backgrounds/default.mp4'
  return '/backgrounds/' + files[Math.floor(Math.random() * files.length)]
}

export interface RenderParams {
  hook: string
  body: string
  watermark: string
  style: string
  backgroundVideo?: string
}

export async function renderVideo(params: RenderParams): Promise<string> {
  ensureDirs()
  const id = randomUUID()
  const outFile = path.join(OUTPUT_DIR, `${id}.mp4`)
  const bgVideo = params.backgroundVideo ?? pickBackground()

  // Build props JSON for Remotion CLI
  const inputProps = JSON.stringify({
    hook: params.hook,
    body: params.body,
    watermark: params.watermark,
    style: params.style,
    backgroundVideo: bgVideo,
  })

  // Remotion render via CLI subprocess
  const cmd = [
    'npx remotion render',
    'src/remotion/Root.tsx',
    'QuoteVideo',
    `"${outFile}"`,
    `--props='${inputProps.replace(/'/g, "'\\''")}' `,
    '--codec mp4',
    '--frames 0-239',
    '--concurrency 1',
  ].join(' ')

  execSync(cmd, {
    cwd: process.cwd(),
    stdio: 'pipe',
    timeout: 300_000,
    env: { ...process.env, NODE_ENV: 'production' },
  })

  if (!fs.existsSync(outFile)) throw new Error('Render produced no output file')
  return outFile
}

export function cleanOldOutputs(keepHours = 24) {
  if (!fs.existsSync(OUTPUT_DIR)) return
  const cutoff = Date.now() - keepHours * 3600 * 1000
  for (const f of fs.readdirSync(OUTPUT_DIR)) {
    const fp = path.join(OUTPUT_DIR, f)
    if (fs.statSync(fp).mtimeMs < cutoff) fs.unlinkSync(fp)
  }
}
