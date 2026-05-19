import { z } from 'zod'

import { IngestError, parseFile, scrapeUrl } from '@/lib/ingest/firecrawl'
import { extractJobBrief, type JobBrief } from '@/lib/ingest/job-brief'

export const runtime = 'nodejs'
export const maxDuration = 30

const MAX_FILE_BYTES = 10 * 1024 * 1024
const ALLOWED_MIME = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'text/markdown',
  'text/plain',
])
const ALLOWED_EXT = /\.(pdf|docx|md|markdown|txt)$/i

const urlSchema = z.object({
  url: z.string().url(),
})

type IngestResponse =
  | { markdown: string; brief: JobBrief; source: 'url' | 'file' }
  | { error: string; kind: IngestError['kind'] }

function errorResponse(err: IngestError) {
  const body: IngestResponse = { error: err.message, kind: err.kind }
  return Response.json(body, { status: err.status })
}

function badRequest(message: string): Response {
  const body: IngestResponse = { error: message, kind: 'unsupported' }
  return Response.json(body, { status: 400 })
}

export async function POST(req: Request) {
  const contentType = req.headers.get('content-type') ?? ''

  try {
    let markdown: string
    let source: 'url' | 'file'

    if (contentType.includes('application/json')) {
      const parsed = urlSchema.safeParse(await req.json())
      if (!parsed.success) {
        return badRequest('Expected a JSON body with a valid `url` field.')
      }
      markdown = await scrapeUrl(parsed.data.url)
      source = 'url'
    } else if (contentType.includes('multipart/form-data')) {
      const form = await req.formData()
      const file = form.get('file')
      if (!(file instanceof File)) {
        return badRequest('Expected a `file` field in the multipart body.')
      }
      if (file.size === 0) return badRequest('File is empty.')
      if (file.size > MAX_FILE_BYTES) {
        return badRequest('File too large — keep it under 10 MB.')
      }
      const mimeOk = file.type ? ALLOWED_MIME.has(file.type) : false
      const extOk = ALLOWED_EXT.test(file.name)
      if (!mimeOk && !extOk) {
        return badRequest('Unsupported file type. Use PDF, DOCX, MD, or TXT.')
      }
      const buffer = Buffer.from(await file.arrayBuffer())
      markdown = await parseFile({
        data: buffer,
        filename: file.name,
        contentType: file.type || undefined,
      })
      source = 'file'
    } else {
      return badRequest('Send JSON with a `url`, or multipart with a `file`.')
    }

    const brief = await extractJobBrief(markdown)
    const body: IngestResponse = { markdown, brief, source }
    return Response.json(body)
  } catch (err) {
    if (err instanceof IngestError) return errorResponse(err)
    console.error('[/api/ingest-job] unexpected', err)
    const fallback: IngestResponse = {
      error: 'Something went wrong on the server.',
      kind: 'scrape-failed',
    }
    return Response.json(fallback, { status: 500 })
  }
}
