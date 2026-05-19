const GROQ_TRANSCRIPTION_URL = 'https://api.groq.com/openai/v1/audio/transcriptions'
const GROQ_MODEL = 'whisper-large-v3-turbo'

export type TranscriptionResult = { text: string }

export async function transcribeWithGroq(
  audio: Blob,
  filename = 'audio.webm',
): Promise<TranscriptionResult> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new Error('GROQ_API_KEY is not set')

  const form = new FormData()
  form.append('file', audio, filename)
  form.append('model', GROQ_MODEL)
  form.append('response_format', 'json')

  const response = await fetch(GROQ_TRANSCRIPTION_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  })

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(`Groq ${response.status}: ${detail}`)
  }

  const data = (await response.json()) as { text?: string }
  if (typeof data.text !== 'string') {
    throw new Error('Groq response missing text field')
  }
  return { text: data.text }
}
