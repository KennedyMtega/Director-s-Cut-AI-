import path from 'path'
import fs from 'fs/promises'
import os from 'os'
import { randomUUID } from 'crypto'
import sharp from 'sharp'
import ffmpeg from 'fluent-ffmpeg'
import ffmpegStatic from 'ffmpeg-static'
import { uploadToCloudinary } from '@/lib/cloudinary/upload'

if (ffmpegStatic) ffmpeg.setFfmpegPath(ffmpegStatic)

const W = 1080
const H = 1920

function wrapLines(text: string, maxChars = 38): string[] {
  const lines: string[] = []
  for (const raw of text.split('\n')) {
    const words = raw.split(' ')
    let line = ''
    for (const word of words) {
      if ((line + ' ' + word).trim().length > maxChars) {
        if (line) lines.push(line.trim())
        line = word
      } else {
        line = line ? line + ' ' + word : word
      }
    }
    if (line) lines.push(line.trim())
  }
  return lines
}

function buildSvg(hook: string, body: string): string {
  const hookLines = wrapLines(hook, 30)
  const bodyLines = wrapLines(body, 38)

  const hookFontSize = 72
  const bodyFontSize = 44
  const lineH = (size: number) => size * 1.35

  const hookBlockH = hookLines.length * lineH(hookFontSize)
  const bodyBlockH = bodyLines.length * lineH(bodyFontSize)

  const hookY = H * 0.35 - hookBlockH / 2
  const bodyY = H * 0.60 - bodyBlockH / 2

  const hookSpans = hookLines
    .map((l, i) => `<tspan x="${W / 2}" dy="${i === 0 ? 0 : lineH(hookFontSize)}">${l.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</tspan>`)
    .join('')

  const bodySpans = bodyLines
    .map((l, i) => `<tspan x="${W / 2}" dy="${i === 0 ? 0 : lineH(bodyFontSize)}">${l.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</tspan>`)
    .join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="rgba(0,0,0,0.58)"/>
  <text
    font-family="Noto Sans, Arial, sans-serif"
    font-size="${hookFontSize}"
    font-weight="bold"
    fill="white"
    text-anchor="middle"
    x="${W / 2}"
    y="${hookY}"
  >${hookSpans}</text>
  <text
    font-family="Noto Sans, Arial, sans-serif"
    font-size="${bodyFontSize}"
    font-weight="normal"
    fill="rgba(255,255,255,0.92)"
    text-anchor="middle"
    x="${W / 2}"
    y="${bodyY}"
  >${bodySpans}</text>
  <text
    font-family="Noto Sans, Arial, sans-serif"
    font-size="28"
    font-weight="normal"
    fill="rgba(255,255,255,0.60)"
    text-anchor="end"
    x="${W - 32}"
    y="${H - 48}"
  >@solitude_script</text>
</svg>`
}

function runFfmpeg(inputVideo: string, overlayPng: string, outputMp4: string): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(inputVideo)
      .input(overlayPng)
      .complexFilter(['[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920[bg];[bg][1:v]overlay=0:0[out]'])
      .outputOptions([
        '-map [out]',
        '-map 0:a?',
        '-c:v libx264',
        '-preset fast',
        '-crf 23',
        '-c:a aac',
        '-t 60',
        '-r 30',
        '-pix_fmt yuv420p',
      ])
      .output(outputMp4)
      .on('end', () => resolve())
      .on('error', (err) => reject(err))
      .run()
  })
}

export async function renderVideo(params: {
  templateVideoUrl: string
  hook: string
  body: string
}): Promise<string> {
  const id = randomUUID()
  const tmpDir = os.tmpdir()
  const tplPath = path.join(tmpDir, `tpl-${id}.mp4`)
  const pngPath = path.join(tmpDir, `overlay-${id}.png`)
  const outPath = path.join(tmpDir, `out-${id}.mp4`)

  try {
    // 1. Download template video
    const res = await fetch(params.templateVideoUrl)
    if (!res.ok) throw new Error(`Failed to download template: ${res.status}`)
    const buf = Buffer.from(await res.arrayBuffer())
    await fs.writeFile(tplPath, buf)

    // 2. Build SVG text overlay → PNG
    const svg = buildSvg(params.hook, params.body)
    await sharp(Buffer.from(svg)).png().toFile(pngPath)

    // 3. Composite with FFmpeg
    await runFfmpeg(tplPath, pngPath, outPath)

    // 4. Upload to Cloudinary
    const outBuf = await fs.readFile(outPath)
    const { url } = await uploadToCloudinary(outBuf, {
      folder: 'solitude-script/renders',
      resourceType: 'video',
    })

    return url
  } finally {
    await Promise.allSettled([
      fs.unlink(tplPath).catch(() => {}),
      fs.unlink(pngPath).catch(() => {}),
      fs.unlink(outPath).catch(() => {}),
    ])
  }
}
