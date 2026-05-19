'use client'

import { useEffect, useRef, useState } from 'react'

export type RecorderState =
  | 'idle'
  | 'requesting'
  | 'recording'
  | 'stopping'
  | 'transcribing'

export type RecorderErrorCode =
  | 'permission-denied'
  | 'no-device'
  | 'unsupported'
  | 'recorder-error'
  | 'transcription-failed'

export type RecorderError = { code: RecorderErrorCode; message: string }

type Callbacks = {
  onTranscript: (text: string) => void
  onError?: (error: RecorderError) => void
}

const CANDIDATE_MIME_TYPES = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/mp4',
  'audio/ogg;codecs=opus',
] as const

function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === 'undefined') return undefined
  for (const type of CANDIDATE_MIME_TYPES) {
    if (MediaRecorder.isTypeSupported(type)) return type
  }
  return undefined
}

function filenameFor(mimeType: string | undefined): string {
  if (!mimeType) return 'audio.webm'
  if (mimeType.startsWith('audio/mp4')) return 'audio.mp4'
  if (mimeType.startsWith('audio/ogg')) return 'audio.ogg'
  return 'audio.webm'
}

export function useMediaRecorder({ onTranscript, onError }: Callbacks) {
  const [state, setState] = useState<RecorderState>('idle')
  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const cancelledRef = useRef(false)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      streamRef.current?.getTracks().forEach((track) => track.stop())
      streamRef.current = null
      recorderRef.current = null
      chunksRef.current = []
    }
  }, [])

  const releaseStream = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    recorderRef.current = null
    chunksRef.current = []
  }

  const fail = (code: RecorderErrorCode, message: string) => {
    releaseStream()
    if (mountedRef.current) setState('idle')
    onError?.({ code, message })
  }

  const start = async () => {
    if (state !== 'idle') return
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      fail('unsupported', 'Microphone API not available in this browser')
      return
    }
    const mimeType = pickMimeType()
    if (!mimeType) {
      fail('unsupported', 'MediaRecorder is not supported in this browser')
      return
    }

    setState('requesting')
    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch (error) {
      const name = (error as { name?: string })?.name
      if (name === 'NotAllowedError' || name === 'SecurityError') {
        fail('permission-denied', 'Microphone permission denied')
      } else if (name === 'NotFoundError' || name === 'OverconstrainedError') {
        fail('no-device', 'No microphone found')
      } else {
        fail('recorder-error', `Could not access microphone: ${String(error)}`)
      }
      return
    }

    if (!mountedRef.current) {
      stream.getTracks().forEach((track) => track.stop())
      return
    }

    let recorder: MediaRecorder
    try {
      recorder = new MediaRecorder(stream, { mimeType })
    } catch (error) {
      stream.getTracks().forEach((track) => track.stop())
      fail('recorder-error', `Could not start recorder: ${String(error)}`)
      return
    }

    streamRef.current = stream
    recorderRef.current = recorder
    chunksRef.current = []
    cancelledRef.current = false

    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) chunksRef.current.push(event.data)
    }

    recorder.onerror = () => {
      fail('recorder-error', 'Recorder failed mid-capture')
    }

    recorder.onstop = async () => {
      const chunks = chunksRef.current
      const cancelled = cancelledRef.current
      releaseStream()

      if (cancelled || chunks.length === 0) {
        if (mountedRef.current) setState('idle')
        return
      }

      const blob = new Blob(chunks, { type: mimeType })
      if (mountedRef.current) setState('transcribing')

      try {
        const form = new FormData()
        form.append('file', blob, filenameFor(mimeType))
        const response = await fetch('/api/transcribe', { method: 'POST', body: form })
        if (!response.ok) {
          const detail = await response.text().catch(() => '')
          throw new Error(`HTTP ${response.status}: ${detail}`)
        }
        const data = (await response.json()) as { text?: string }
        if (!data.text) throw new Error('Empty transcript')
        if (mountedRef.current) {
          onTranscript(data.text)
          setState('idle')
        }
      } catch (error) {
        fail('transcription-failed', `Transcription failed: ${String(error)}`)
      }
    }

    recorder.start()
    setState('recording')
  }

  const stop = () => {
    const recorder = recorderRef.current
    if (!recorder || recorder.state === 'inactive') return
    cancelledRef.current = false
    setState('stopping')
    recorder.stop()
  }

  const cancel = () => {
    const recorder = recorderRef.current
    cancelledRef.current = true
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop()
    } else {
      releaseStream()
      if (mountedRef.current) setState('idle')
    }
  }

  const isActive = state !== 'idle'

  return { state, isActive, start, stop, cancel }
}
