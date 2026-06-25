// Standalone render worker — runs as a child process outside Next.js/Turbopack.
// Usage: node scripts/render-video.js <base64-encoded-params>
'use strict'

const path = require('path')
const fs = require('fs')

async function main() {
  const paramsRaw = process.argv[2]
  if (!paramsRaw) {
    process.stderr.write('No params argument\n')
    process.exit(1)
  }

  let params
  try {
    params = JSON.parse(Buffer.from(paramsRaw, 'base64').toString('utf8'))
  } catch (e) {
    process.stderr.write('Invalid params: ' + e.message + '\n')
    process.exit(1)
  }

  const { bundle } = require('@remotion/bundler')
  const { renderMedia, selectComposition, ensureBrowser } = require('@remotion/renderer')

  process.stderr.write('[render-worker] Ensuring browser…\n')
  await ensureBrowser()

  process.stderr.write('[render-worker] Bundling composition…\n')
  const bundleLocation = await bundle({
    entryPoint: path.join(__dirname, '..', 'src', 'remotion', 'remotion-entry.tsx'),
    onProgress: (v) => {
      if (v % 20 === 0) process.stderr.write(`[render-worker] Bundle ${v}%\n`)
    },
  })

  process.stderr.write('[render-worker] Selecting composition…\n')
  const inputProps = {
    hook: params.hook,
    body: params.body,
    watermark: params.watermark,
    style: params.style,
    backgroundVideo: params.backgroundVideo ?? '',
  }

  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: 'QuoteVideo',
    inputProps,
  })

  process.stderr.write('[render-worker] Rendering video…\n')
  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: 'h264',
    outputLocation: params.outputPath,
    inputProps,
    onProgress: ({ progress }) => {
      const pct = Math.round(progress * 100)
      if (pct % 10 === 0) process.stderr.write(`[render-worker] Rendered ${pct}%\n`)
    },
  })

  if (!fs.existsSync(params.outputPath)) {
    process.stderr.write('[render-worker] Output file missing\n')
    process.exit(1)
  }

  // Output the path on stdout so the caller can read it
  process.stdout.write(params.outputPath + '\n')
  process.stderr.write('[render-worker] Done!\n')
}

main().catch(e => {
  process.stderr.write('[render-worker] FATAL: ' + e.message + '\n' + (e.stack ?? '') + '\n')
  process.exit(1)
})
