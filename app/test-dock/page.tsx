'use client'

import { BottomDock } from '@/components/nav/BottomDock'
import { SectionShell } from '@/components/motion/SectionShell'

const sections = [
  { id: 'hero', label: 'Hero — scroll down to reveal the dock', bg: 'bg-neutral-50 dark:bg-neutral-950' },
  { id: 'section-ai', label: 'AI', bg: 'bg-blue-50 dark:bg-blue-950/40' },
  { id: 'section-mobile', label: 'Mobile', bg: 'bg-emerald-50 dark:bg-emerald-950/40' },
  { id: 'section-desktop', label: 'Desktop', bg: 'bg-amber-50 dark:bg-amber-950/40' },
  { id: 'section-personal', label: 'Personal', bg: 'bg-rose-50 dark:bg-rose-950/40' },
  { id: 'section-contact', label: 'Contact', bg: 'bg-violet-50 dark:bg-violet-950/40' },
] as const

export default function TestDockPage() {
  return (
    <main>
      {sections.map((section) => (
        <SectionShell key={section.id} id={section.id} className={section.bg}>
          <div className="text-center">
            <h2 className="text-4xl font-semibold tracking-tight md:text-6xl">
              {section.label}
            </h2>
            <p className="mt-4 text-sm text-foreground/60">#{section.id}</p>
          </div>
        </SectionShell>
      ))}
      <BottomDock />
    </main>
  )
}
