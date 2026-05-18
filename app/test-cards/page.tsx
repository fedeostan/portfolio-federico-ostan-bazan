import { MetricCallout } from "@/components/project/MetricCallout";
import { ProjectCard } from "@/components/project/ProjectCard";
import { ProjectGallery } from "@/components/project/ProjectGallery";
import { TechStackBadges } from "@/components/project/TechStackBadges";
import type { ProjectCardProps } from "@/types/project";

const sampleProjects: ProjectCardProps[] = [
  {
    id: "p1",
    slug: "synthwave-agent",
    title: "Synthwave Agent",
    summary:
      "A retrieval-augmented assistant that drafts product specs from raw research notes.",
    category: "ai",
    og_image:
      "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1080&q=80",
    role: "Lead Engineer",
    year: 2025,
    tech_stack: ["Next.js", "Supabase", "OpenAI", "pgvector"],
    highlight: "outcome",
  },
  {
    id: "p2",
    slug: "fieldnote",
    title: "Fieldnote",
    summary:
      "Mobile journaling for field researchers — offline-first, end-to-end encrypted entries.",
    category: "mobile",
    og_image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1080&q=80",
    role: "Solo Designer / Engineer",
    year: 2024,
    tech_stack: ["Expo", "SQLite", "Zustand"],
    highlight: "process",
  },
  {
    id: "p3",
    slug: "atlas-os",
    title: "Atlas OS",
    summary:
      "Desktop overlay that turns scattered tabs into a navigable command surface.",
    category: "desktop",
    og_image:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1080&q=80",
    role: "Founding Designer",
    year: 2024,
    tech_stack: ["Tauri", "Rust", "React"],
  },
  {
    id: "p4",
    slug: "letterpress",
    title: "Letterpress",
    summary:
      "A monospace newsletter template optimized for long-form essays and code excerpts.",
    category: "personal",
    og_image: null,
    role: "Personal Project",
    year: 2023,
    tech_stack: ["Astro", "MDX"],
  },
  {
    id: "p5",
    slug: "voicewright",
    title: "Voicewright",
    summary:
      "Realtime transcription tool tuned for interviews; speaker diarization on-device.",
    category: "ai",
    og_image:
      "https://images.unsplash.com/photo-1589254065878-42c9da997008?auto=format&fit=crop&w=1080&q=80",
    role: "Engineer",
    year: 2025,
    tech_stack: ["Whisper", "WebRTC", "Next.js", "Modal"],
    highlight: "metrics",
  },
];

export default function TestCardsPage() {
  return (
    <main className="mx-auto flex w-full flex-col gap-24 py-24">
      <section className="px-6 md:px-12">
        <header className="mb-12 max-w-2xl">
          <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
            Component family — smoke
          </p>
          <h1 className="mt-3 font-heading text-3xl leading-tight font-semibold">
            ProjectCard
          </h1>
          <p className="mt-6 text-base leading-6 text-muted-foreground">
            Five hard-coded cards in a responsive grid. Cards with an
            <code> og_image</code> render image + dark gradient + white text;
            cards with <code>og_image: null</code> fall back to the
            blank-placeholder state from the Figma frame. Hover scales the
            image, slides the arrow, adds a soft shadow.
          </p>
        </header>

        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {sampleProjects.map((p) => (
            <li key={p.id}>
              <ProjectCard {...p} />
            </li>
          ))}
        </ul>
      </section>

      <ProjectGallery
        title="Artificial Inteligence"
        description="Here is my collection of A.I. related projects. Im half obseded with the potential of this techonolgy and I feel the need to epxlore by mysefl in every free time I have. Please enjoy epxloring some of them as I much enjoy working on them."
        items={sampleProjects}
      />

      <section className="px-6 md:px-12">
        <header className="mb-12 max-w-2xl">
          <h2 className="font-heading text-2xl leading-8 font-semibold">
            MetricCallout
          </h2>
          <p className="mt-6 text-base leading-6 text-muted-foreground">
            Display number + uppercase tracking label. Used inside case-study
            outcome sections.
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
          <h2 className="font-heading text-2xl leading-8 font-semibold">
            TechStackBadges
          </h2>
          <p className="mt-6 text-base leading-6 text-muted-foreground">
            Pill row, truncates past <code>max</code> with an inline +N more.
          </p>
        </header>

        <div className="flex flex-col gap-6">
          <TechStackBadges
            items={["Next.js", "Supabase", "OpenAI", "pgvector"]}
          />
          <TechStackBadges
            items={[
              "Next.js",
              "Supabase",
              "OpenAI",
              "pgvector",
              "Tailwind",
              "Motion",
              "shadcn",
            ]}
            max={4}
          />
        </div>
      </section>
    </main>
  );
}
