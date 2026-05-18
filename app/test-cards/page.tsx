import { MetricCallout } from '@/components/project/MetricCallout'
import { ProjectCard } from '@/components/project/ProjectCard'
import { ProjectGallery } from '@/components/project/ProjectGallery'
import { TechStackBadges } from '@/components/project/TechStackBadges'
import type { ProjectCardProps } from '@/types/project'

const sampleProjects: ProjectCardProps[] = [
  {
    id: 'p1',
    slug: 'synthwave-agent',
    title: 'Synthwave Agent',
    summary: 'A retrieval-augmented assistant that drafts product specs from raw research notes.',
    category: 'ai',
    og_image: null,
    role: 'Lead Engineer',
    year: 2025,
    tech_stack: ['Next.js', 'Supabase', 'OpenAI', 'pgvector'],
    highlight: 'outcome',
  },
  {
    id: 'p2',
    slug: 'fieldnote',
    title: 'Fieldnote',
    summary:
      'Mobile journaling for field researchers — offline-first, end-to-end encrypted entries.',
    category: 'mobile',
    og_image: null,
    role: 'Solo Designer / Engineer',
    year: 2024,
    tech_stack: ['Expo', 'SQLite', 'Zustand'],
    highlight: 'process',
  },
  {
    id: 'p3',
    slug: 'atlas-os',
    title: 'Atlas OS',
    summary: 'Desktop overlay that turns scattered tabs into a navigable command surface.',
    category: 'desktop',
    og_image: null,
    role: 'Founding Designer',
    year: 2024,
    tech_stack: ['Tauri', 'Rust', 'React'],
  },
  {
    id: 'p4',
    slug: 'letterpress',
    title: 'Letterpress',
    summary: 'A monospace newsletter template optimized for long-form essays and code excerpts.',
    category: 'personal',
    og_image: null,
    role: 'Personal Project',
    year: 2023,
    tech_stack: ['Astro', 'MDX'],
  },
  {
    id: 'p5',
    slug: 'voicewright',
    title: 'Voicewright',
    summary: 'Realtime transcription tool tuned for interviews; speaker diarization on-device.',
    category: 'ai',
    og_image: null,
    role: 'Engineer',
    year: 2025,
    tech_stack: ['Whisper', 'WebRTC', 'Next.js', 'Modal'],
    highlight: 'metrics',
  },
]

export default function TestCardsPage() {
  return (
    <main className="mx-auto flex w-full flex-col gap-24 py-24">
      <section className="px-6 md:px-12">
        <header className="mb-12 max-w-2xl">
          <p className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
            Component family — smoke
          </p>
          <h1 className="font-heading mt-3 text-3xl leading-tight font-semibold">ProjectCard</h1>
          <p className="text-muted-foreground mt-6 text-base">
            Five hard-coded cards rendered in a responsive grid. Tab to focus, Enter to follow the
            link. Hover lifts the card with a soft shadow; reduced-motion users see a static state.
          </p>
        </header>

        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {sampleProjects.map((p, i) => (
            <li key={p.id}>
              <ProjectCard {...p} priority={i === 0} />
            </li>
          ))}
        </ul>
      </section>

      <ProjectGallery
        title="Artificial Intelligence"
        description="Here is my collection of A.I. related projects. Im half obsessed with the potential of this technology and I feel the need to explore it in every free moment I have."
        items={sampleProjects}
      />

      <section className="px-6 md:px-12">
        <header className="mb-12 max-w-2xl">
          <h2 className="font-heading text-2xl leading-tight font-semibold">MetricCallout</h2>
          <p className="text-muted-foreground mt-6 text-base">
            Display number + uppercase tracking label. Used inside case-study outcome sections.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-12 sm:grid-cols-3">
          <MetricCallout n={42} label="Cases shipped" suffix="+" />
          <MetricCallout n="3.2" label="Sec time-to-first-token" suffix="s" />
          <MetricCallout n={98} label="% Lighthouse perf" />
        </div>
      </section>

      <section className="px-6 md:px-12">
        <header className="mb-12 max-w-2xl">
          <h2 className="font-heading text-2xl leading-tight font-semibold">TechStackBadges</h2>
          <p className="text-muted-foreground mt-6 text-base">
            Pill row, truncates past <code>max</code> with an inline +N more.
          </p>
        </header>

        <div className="flex flex-col gap-6">
          <TechStackBadges items={['Next.js', 'Supabase', 'OpenAI', 'pgvector']} />
          <TechStackBadges
            items={['Next.js', 'Supabase', 'OpenAI', 'pgvector', 'Tailwind', 'Motion', 'shadcn']}
            max={4}
          />
        </div>
      </section>
    </main>
  )
}
