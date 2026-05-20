import { transcribeWithGroq } from '@/lib/voice/groq-client'
import {
  logRateLimitHit,
  rateLimitResponse,
  transcribeLimiter,
} from '@/lib/api/rate-limit'
import { botBlockedResponse, logBotBlock, verifyBotId } from '@/lib/api/bot-id'

export const runtime = 'nodejs'
export const maxDuration = 30

const MAX_BYTES = 5 * 1024 * 1024

export async function POST(req: Request) {
  const limit = await transcribeLimiter.limit(req)
  if (!limit.success) {
    logRateLimitHit('transcribe', req, limit)
    return rateLimitResponse(limit)
  }

  const bot = await verifyBotId()
  if (bot.isBot) {
    logBotBlock('transcribe', req)
    return botBlockedResponse()
  }

  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return Response.json({ error: 'Expected multipart/form-data' }, { status: 400 })
  }

  const file = form.get('file')
  if (!(file instanceof Blob)) {
    return Response.json({ error: 'Missing audio file' }, { status: 400 })
  }
  if (file.size === 0) {
    return Response.json({ error: 'Empty audio file' }, { status: 400 })
  }
  if (file.size > MAX_BYTES) {
    return Response.json(
      { error: 'Audio file too large (max 5MB)' },
      { status: 413 },
    )
  }

  const rawName = form.get('filename')
  const filename = typeof rawName === 'string' && rawName.length > 0 ? rawName : 'audio.webm'

  try {
    const { text } = await transcribeWithGroq(file, filename)
    return Response.json({ text })
  } catch (error) {
    console.error('[transcribe] groq error', error)
    return Response.json(
      { error: 'Transcription failed', detail: String(error) },
      { status: 502 },
    )
  }
}
