import { Button } from '@/components/ui/button'

/**
 * Throwaway smoke page for issue #5 — verifies design.md tokens render
 * correctly through `app/globals.css`. Delete once the foundation milestone
 * (M1) sign-off is recorded on the issue.
 */
export default function TestThemePage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-12 px-6 py-16">
      <header className="flex flex-col gap-3">
        <p className="text-xs font-medium text-muted-foreground">
          design.md / token smoke test
        </p>
        <h1 className="text-2xl font-semibold text-foreground">
          Hello — this is the Figma type ramp on the Figma palette.
        </h1>
      </header>

      <section className="flex flex-col gap-6">
        <h2 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Type ramp
        </h2>
        <div className="flex flex-col gap-6 rounded-[var(--radius-4xl)] border border-border bg-card p-6 shadow-[var(--shadow-lg)]">
          <p className="text-2xl leading-8 font-medium text-foreground">
            Heading — Inter 24/32 medium
          </p>
          <p className="text-2xl leading-8 font-semibold text-foreground">
            Heading emphasis — Inter 24/32 semibold
          </p>
          <p className="text-xl leading-7 font-semibold text-foreground">
            Title — Inter 20/28 semibold
          </p>
          <p className="text-base leading-6 font-medium text-foreground">
            Body — Inter 16/24 medium. The quick brown fox jumps over the lazy
            dog 0123456789.
          </p>
          <p className="text-xs leading-4 font-normal text-muted-foreground">
            Caption — Inter 12/16 regular, on muted-foreground.
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Buttons
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">Small</Button>
          <Button>Default</Button>
          <Button size="lg">Large</Button>
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Surfaces
        </h2>
        <div className="grid grid-cols-2 gap-6">
          <div className="rounded-[var(--radius-lg)] border border-border bg-card p-6">
            <p className="text-base leading-6 font-medium text-foreground">
              Card — radius-lg, no shadow
            </p>
            <p className="mt-3 text-xs leading-4 text-muted-foreground">
              Lifted by Page vs Surface contrast only.
            </p>
          </div>
          <div className="rounded-[var(--radius-4xl)] bg-card p-6 shadow-[var(--shadow-lg)]">
            <p className="text-base leading-6 font-medium text-foreground">
              Card — radius-4xl, shadow-lg
            </p>
            <p className="mt-3 text-xs leading-4 text-muted-foreground">
              Atmospheric two-layer drop shadow.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-[var(--radius-4xl)] bg-card px-6 py-4 shadow-[var(--shadow-lg)]">
          <p className="flex-1 text-base leading-6 font-medium text-muted-foreground">
            Just type, or speak…
          </p>
          <Button size="sm" className="rounded-full">
            ↑
          </Button>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Palette swatches
        </h2>
        <div className="grid grid-cols-3 gap-3 text-xs leading-4">
          {(
            [
              ['background', 'var(--background)', 'text-foreground'],
              ['foreground', 'var(--foreground)', 'text-primary-foreground'],
              ['card', 'var(--card)', 'text-foreground'],
              ['muted', 'var(--muted)', 'text-foreground'],
              ['border', 'var(--border)', 'text-foreground'],
              ['ring', 'var(--ring)', 'text-primary-foreground'],
            ] as const
          ).map(([name, css, ink]) => (
            <div
              key={name}
              className={`flex h-16 items-end rounded-[var(--radius-lg)] border border-border p-3 ${ink}`}
              style={{ background: css }}
            >
              <span className="font-medium">{name}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
