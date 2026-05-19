'use client'

import { useCallback, useState } from 'react'
import { toast } from 'sonner'

import { JobBriefChip } from '@/components/hero/JobBriefChip'
import { AIChatInput } from '@/components/ui/ai-chat-input'
import { Icon } from '@/components/ui/icon'
import type { JobBrief } from '@/lib/ingest/job-brief'

interface ChatInputWrapperProps {
  onSend: (value: string, brief?: JobBrief | null) => void
  placeholders?: readonly string[]
}

type IngestSuccess = { brief: JobBrief; source: 'url' | 'file' }
type IngestErrorResponse = { error: string }

export function ChatInputWrapper({ onSend, placeholders }: ChatInputWrapperProps) {
  const [brief, setBrief] = useState<JobBrief | null>(null)
  const [pendingUrl, setPendingUrl] = useState<string | null>(null)
  const [isIngesting, setIsIngesting] = useState(false)

  const runIngest = useCallback(async (init: RequestInit, label: string) => {
    setIsIngesting(true)
    try {
      const res = await fetch('/api/ingest-job', init)
      const data = (await res.json()) as IngestSuccess | IngestErrorResponse
      if (!res.ok || !('brief' in data)) {
        const message = 'error' in data && data.error ? data.error : 'Ingest failed.'
        toast.error(message)
        return
      }
      setBrief(data.brief)
      toast.success(`Job context attached from ${label}.`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Network error during ingest.')
    } finally {
      setIsIngesting(false)
    }
  }, [])

  const ingestUrl = useCallback(
    async (url: string) => {
      setPendingUrl(null)
      await runIngest(
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ url }),
        },
        'URL',
      )
    },
    [runIngest],
  )

  const ingestFile = useCallback(
    async (file: File) => {
      const form = new FormData()
      form.append('file', file)
      await runIngest({ method: 'POST', body: form }, file.name)
    },
    [runIngest],
  )

  const handlePasteUrl = useCallback(
    (url: string) => {
      if (isIngesting) return
      setPendingUrl(url)
    },
    [isIngesting],
  )

  const handleSend = useCallback(
    (value: string) => {
      onSend(value, brief)
    },
    [brief, onSend],
  )

  return (
    <div className="mx-auto flex w-full max-w-[520px] flex-col items-stretch gap-2 px-4">
      {pendingUrl ? (
        <PasteConfirmRow
          url={pendingUrl}
          onConfirm={() => void ingestUrl(pendingUrl)}
          onDismiss={() => setPendingUrl(null)}
        />
      ) : null}

      {brief ? (
        <div className="self-start">
          <JobBriefChip brief={brief} onDismiss={() => setBrief(null)} />
        </div>
      ) : null}

      <AIChatInput
        onSend={handleSend}
        onAttachFile={(file) => void ingestFile(file)}
        onPasteUrl={handlePasteUrl}
        attachDisabled={isIngesting}
        placeholders={placeholders}
      />

      {isIngesting ? (
        <p
          className="text-muted-foreground text-xs"
          role="status"
          aria-live="polite"
        >
          Reading the job post…
        </p>
      ) : null}
    </div>
  )
}

function PasteConfirmRow({
  url,
  onConfirm,
  onDismiss,
}: {
  url: string
  onConfirm: () => void
  onDismiss: () => void
}) {
  return (
    <div
      className="bg-accent text-foreground flex items-center gap-2 rounded-2xl px-3 py-2 text-sm"
      role="dialog"
      aria-label="Ingest pasted URL?"
    >
      <Icon name="Link" size={14} className="shrink-0 opacity-70" />
      <span className="flex-1 truncate">
        Ingest <span className="font-medium">{shortUrl(url)}</span> as job context?
      </span>
      <button
        type="button"
        onClick={onDismiss}
        className="hover:bg-border focus-visible:ring-ring rounded-full px-2 py-1 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2"
      >
        No
      </button>
      <button
        type="button"
        onClick={onConfirm}
        className="bg-foreground text-background hover:bg-foreground/85 focus-visible:ring-ring rounded-full px-3 py-1 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2"
      >
        Ingest
      </button>
    </div>
  )
}

function shortUrl(url: string): string {
  try {
    const u = new URL(url)
    return `${u.hostname}${u.pathname === '/' ? '' : u.pathname}`
  } catch {
    return url.length > 48 ? `${url.slice(0, 45)}…` : url
  }
}
