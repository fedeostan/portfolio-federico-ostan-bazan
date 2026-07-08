'use client'

import { Home } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface GoHomeButtonProps {
  onGoHome: () => void
  className?: string
}

export function GoHomeButton({ onGoHome, className }: GoHomeButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={onGoHome}
      aria-label="Back to home"
      className={className}
    >
      <Home className="size-3.5" strokeWidth={2} aria-hidden />
    </Button>
  )
}
