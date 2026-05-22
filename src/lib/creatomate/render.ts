import { creatomateRequest } from './client'
import { buildRenderPayload, type ReelRenderParams } from './templates'

export interface RenderJob {
  id: string
  status: 'waiting' | 'queued' | 'rendering' | 'succeeded' | 'failed'
  url?: string
  snapshot_url?: string
}

export async function submitRenderJob(params: ReelRenderParams): Promise<RenderJob> {
  const payload = buildRenderPayload(params)
  const jobs = await creatomateRequest<RenderJob[]>('/renders', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return jobs[0]
}

export async function getRenderStatus(jobId: string): Promise<RenderJob> {
  return creatomateRequest<RenderJob>(`/renders/${jobId}`)
}

export async function waitForRender(jobId: string, maxWaitMs = 240000): Promise<RenderJob> {
  const pollIntervalMs = 5000
  const deadline = Date.now() + maxWaitMs

  while (Date.now() < deadline) {
    const job = await getRenderStatus(jobId)
    if (job.status === 'succeeded' || job.status === 'failed') return job
    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs))
  }

  throw new Error(`Render job ${jobId} did not complete within ${maxWaitMs}ms`)
}
