'use client'

import { ChatInputWrapper } from '@/components/hero/ChatInputWrapper'

export default function TestHeroPage() {
  return (
    <main className="bg-background flex min-h-screen items-center justify-center py-24">
      <ChatInputWrapper
        onSend={(value) => {
          console.log('[AIChatInput] onSend:', value)
        }}
      />
    </main>
  )
}
