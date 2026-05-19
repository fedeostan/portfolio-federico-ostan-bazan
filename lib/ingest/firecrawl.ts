import Firecrawl, { SdkError, type ParseFile } from '@mendable/firecrawl-js'

export class IngestError extends Error {
  constructor(
    message: string,
    public readonly kind:
      | 'missing-key'
      | 'rate-limited'
      | 'unsupported'
      | 'scrape-failed'
      | 'parse-failed'
      | 'empty-result',
    public readonly status = 502,
  ) {
    super(message)
    this.name = 'IngestError'
  }
}

let client: Firecrawl | null = null

function getClient(): Firecrawl {
  if (client) return client
  const apiKey = process.env.FIRECRAWL_API_KEY
  if (!apiKey) {
    throw new IngestError(
      'FIRECRAWL_API_KEY is not configured on the server.',
      'missing-key',
      503,
    )
  }
  client = new Firecrawl({ apiKey })
  return client
}

function translateSdkError(
  err: SdkError,
  fallback: IngestError['kind'],
  subject: 'url' | 'file',
): IngestError {
  if (err.status === 429) {
    return new IngestError(
      'Firecrawl rate limit reached. Try again in a moment.',
      'rate-limited',
      429,
    )
  }
  // 401/403 from Firecrawl can mean either an invalid platform key OR that the
  // target site rejects the scraper (e.g. LinkedIn). Without an auth-failure
  // marker from the SDK we can't reliably tell them apart, so we default to the
  // per-resource explanation — that's the far more common case once a key is
  // configured at all. A genuinely missing key is caught upstream in getClient().
  if (subject === 'url') {
    return new IngestError(
      `Couldn't read that URL (${err.status ?? 'network error'}). ` +
        'Many job boards (LinkedIn, etc.) block scrapers — try a company careers page, Greenhouse, or Lever URL instead.',
      'scrape-failed',
      502,
    )
  }
  return new IngestError(
    err.message || 'Could not parse the file.',
    fallback,
    502,
  )
}

export async function scrapeUrl(url: string): Promise<string> {
  let doc
  try {
    doc = await getClient().scrape(url, { formats: ['markdown'], onlyMainContent: true })
  } catch (err) {
    if (err instanceof IngestError) throw err
    if (err instanceof SdkError) throw translateSdkError(err, 'scrape-failed', 'url')
    throw new IngestError(
      err instanceof Error ? err.message : 'Scrape failed.',
      'scrape-failed',
    )
  }
  const markdown = doc.markdown?.trim()
  if (!markdown) {
    throw new IngestError('Scrape returned no readable content.', 'empty-result', 422)
  }
  return markdown
}

export async function parseFile(file: ParseFile): Promise<string> {
  let doc
  try {
    doc = await getClient().parse(file, { formats: ['markdown'] })
  } catch (err) {
    if (err instanceof IngestError) throw err
    if (err instanceof SdkError) throw translateSdkError(err, 'parse-failed', 'file')
    throw new IngestError(
      err instanceof Error ? err.message : 'File parse failed.',
      'parse-failed',
    )
  }
  const markdown = doc.markdown?.trim()
  if (!markdown) {
    throw new IngestError('Could not extract text from the file.', 'empty-result', 422)
  }
  return markdown
}
