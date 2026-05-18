'use client'

import { AIChatInput } from '@/components/ui/ai-chat-input'

interface ChatInputWrapperProps {
  onSend: (value: string) => void
  placeholders?: readonly string[]
}

export function ChatInputWrapper({ onSend, placeholders }: ChatInputWrapperProps) {
  return (
    <div className="mx-auto w-full max-w-[520px] px-4">
      <AIChatInput onSend={onSend} placeholders={placeholders} />
    </div>
  )
}
