# Case Study Template Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `/case-studies/[slug]` — a Server-Component-only route that renders any published project from Supabase as a polished, OpenAI-blog-style case study, with dynamic OG cards and 404 handling.

**Architecture:** Server Components throughout. `page.tsx` fetches via `getProjectBySlug()` and dispatches to a stack of pure presentational components. `CaseStudyBody` reads `section_type` (layout marker — `text` / `image+text` / `metrics` / `gallery`) and renders the right child. Pure helpers in `lib/case-study/sections.ts` resolve hero asset, gallery assets, and image+text side alternation.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind v4, TypeScript, Supabase SSR, `react-markdown` + `remark-gfm`, `next/og` for dynamic OG images.

**Spec:** `docs/superpowers/specs/2026-05-19-case-study-template-design.md`

**Verification convention:** This repo has no unit-test framework. Each task ends with `pnpm typecheck` (and where relevant, `pnpm build` + manual browser check) as the verification gate. Lock `pnpm typecheck` clean before committing every task.

---

## Task 1: Install dependencies and configure remote image domains

**Files:**

- Modify: `package.json` (via `pnpm add`)
- Modify: `next.config.ts`

- [ ] **Step 1: Install runtime dependencies**

Run:

```bash
pnpm add react-markdown remark-gfm
```

Expected: both packages added to `dependencies` in `package.json`; `pnpm-lock.yaml` updated.

- [ ] **Step 2: Add remote image patterns to next.config.ts**

Open `next.config.ts` and replace its contents with:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;
```

Why: the seed uses `placehold.co` for hero / OG images, and any future Supabase Storage uploads will be served from `*.supabase.co`. Without these, `next/image` refuses to optimise external URLs.

- [ ] **Step 3: Verify typecheck and build still clean**

Run:

```bash
pnpm typecheck && pnpm build
```

Expected: both pass with no errors.

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml next.config.ts
git commit -m "$(cat <<'EOF'
chore(case-study): add react-markdown + remark-gfm + remote image patterns (#23)

Pulls in the markdown deps used by the case-study body and whitelists
placehold.co (seed) and *.supabase.co (future storage) for next/image.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Pure section helpers (`lib/case-study/sections.ts`)

**Files:**

- Create: `lib/case-study/sections.ts`

- [ ] **Step 1: Create the helpers file**

Create `lib/case-study/sections.ts` with:

```ts
import type {
  ProjectAssetRow,
  ProjectSectionRow,
} from "@/lib/db/queries";

export const SECTION_TYPES = ["text", "image+text", "metrics", "gallery"] as const;
export type SectionType = (typeof SECTION_TYPES)[number];

/**
 * Normalises a raw section_type string from the DB into a known layout type.
 * Unknown / null values fall through to "text" so the page never crashes on
 * legacy seed data.
 */
export function normalizeSectionType(raw: string | null | undefined): SectionType {
  if (raw && (SECTION_TYPES as readonly string[]).includes(raw)) {
    return raw as SectionType;
  }
  return "text";
}

/**
 * Sort sections by their `order` field, treating null as Infinity so legacy
 * rows without an order land at the end deterministically.
 */
export function sortSections(sections: ProjectSectionRow[]): ProjectSectionRow[] {
  return [...sections].sort(
    (a, b) => (a.order ?? Number.POSITIVE_INFINITY) - (b.order ?? Number.POSITIVE_INFINITY),
  );
}

/**
 * Returns the first asset where `type = 'hero'`, ordered by `order`.
 * `null` if none — hero card is then skipped.
 */
export function getHeroAsset(assets: ProjectAssetRow[]): ProjectAssetRow | null {
  const heroes = assets
    .filter((a) => a.type === "hero")
    .sort((a, b) => (a.order ?? Number.POSITIVE_INFINITY) - (b.order ?? Number.POSITIVE_INFINITY));
  return heroes[0] ?? null;
}

/**
 * All non-hero assets, ordered by `order`. Used by Gallery and as the asset
 * pool for image+text splits.
 */
export function getGalleryAssets(assets: ProjectAssetRow[]): ProjectAssetRow[] {
  return assets
    .filter((a) => a.type !== "hero")
    .sort((a, b) => (a.order ?? Number.POSITIVE_INFINITY) - (b.order ?? Number.POSITIVE_INFINITY));
}

/**
 * For a given `image+text` section, returns the side the image should sit on.
 * Counts how many `image+text` sections precede this one (by sorted order)
 * and alternates: even index → 'left', odd index → 'right'. Matches the
 * Figma rhythm without requiring editor input.
 */
export function splitSideFor(
  section: ProjectSectionRow,
  allSections: ProjectSectionRow[],
): "left" | "right" {
  const sorted = sortSections(allSections).filter(
    (s) => normalizeSectionType(s.section_type) === "image+text",
  );
  const index = sorted.findIndex((s) => s.id === section.id);
  return index % 2 === 0 ? "left" : "right";
}

/**
 * Pairs an `image+text` section with one of the gallery assets, by matching
 * `order`. If no exact match, returns the asset at the same positional index
 * among image+text sections. If still none, returns null and TextImageSplit
 * renders text-only.
 */
export function assetForImageTextSection(
  section: ProjectSectionRow,
  allSections: ProjectSectionRow[],
  galleryAssets: ProjectAssetRow[],
): ProjectAssetRow | null {
  const exact = galleryAssets.find((a) => a.order === section.order);
  if (exact) return exact;
  const splits = sortSections(allSections).filter(
    (s) => normalizeSectionType(s.section_type) === "image+text",
  );
  const idx = splits.findIndex((s) => s.id === section.id);
  return galleryAssets[idx] ?? null;
}
```

- [ ] **Step 2: Verify typecheck passes**

Run:

```bash
pnpm typecheck
```

Expected: clean — no errors from the new file.

- [ ] **Step 3: Commit**

```bash
git add lib/case-study/sections.ts
git commit -m "$(cat <<'EOF'
feat(case-study): pure section + asset helpers (#23)

Adds normalizeSectionType, sortSections, getHeroAsset, getGalleryAssets,
splitSideFor, and assetForImageTextSection. Pure functions, no React —
CaseStudyBody dispatch logic stays trivial.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: `ImageWithCaption` component

**Files:**

- Create: `components/case-study/ImageWithCaption.tsx`

- [ ] **Step 1: Create the component**

Create `components/case-study/ImageWithCaption.tsx`:

```tsx
import Image from "next/image";

import { cn } from "@/lib/utils";

type ImageWithCaptionProps = {
  src: string;
  alt: string;
  caption?: string | null;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
};

export function ImageWithCaption({
  src,
  alt,
  caption,
  width = 1140,
  height = 720,
  className,
  priority = false,
  sizes = "(min-width: 1280px) 1140px, 100vw",
}: ImageWithCaptionProps) {
  return (
    <figure className={cn("flex flex-col gap-3", className)}>
      <div className="bg-surface relative w-full overflow-hidden rounded-4xl">
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          priority={priority}
          sizes={sizes}
          className="h-auto w-full object-cover"
        />
      </div>
      {caption ? (
        <figcaption className="text-muted-foreground text-center text-xs leading-4 font-normal">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
```

- [ ] **Step 2: Verify typecheck**

Run:

```bash
pnpm typecheck
```

Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add components/case-study/ImageWithCaption.tsx
git commit -m "$(cat <<'EOF'
feat(case-study): ImageWithCaption with rounded-4xl card + figcaption (#23)

Reusable figure — next/image inside the bg-surface rounded card with an
optional centered caption in muted-foreground. Used by Gallery, body
markdown ![alt](src "caption") shorthand, and TextImageSplit.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Markdown renderer (`lib/case-study/markdown.tsx`)

**Files:**

- Create: `lib/case-study/markdown.tsx`

- [ ] **Step 1: Create the renderer**

Create `lib/case-study/markdown.tsx`:

```tsx
import Link from "next/link";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

import { ImageWithCaption } from "@/components/case-study/ImageWithCaption";
import { cn } from "@/lib/utils";

type MarkdownProps = {
  content: string;
  className?: string;
};

const components: Components = {
  p({ children }) {
    return (
      <p className="text-muted-foreground text-base leading-6 font-medium">
        {children}
      </p>
    );
  },
  h1({ children }) {
    return (
      <h1 className="text-foreground text-2xl leading-8 font-semibold">
        {children}
      </h1>
    );
  },
  h2({ children }) {
    return (
      <h2 className="text-foreground text-2xl leading-8 font-semibold">
        {children}
      </h2>
    );
  },
  h3({ children }) {
    return (
      <h3 className="text-foreground text-xl leading-7 font-semibold">
        {children}
      </h3>
    );
  },
  ul({ children }) {
    return (
      <ul className="text-muted-foreground list-disc space-y-2 pl-6 text-base leading-6 font-medium">
        {children}
      </ul>
    );
  },
  ol({ children }) {
    return (
      <ol className="text-muted-foreground list-decimal space-y-2 pl-6 text-base leading-6 font-medium">
        {children}
      </ol>
    );
  },
  strong({ children }) {
    return <strong className="text-foreground font-semibold">{children}</strong>;
  },
  a({ href, children }) {
    if (!href) return <span>{children}</span>;
    const isExternal = /^https?:\/\//.test(href);
    if (isExternal) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="text-foreground underline underline-offset-4 hover:no-underline"
        >
          {children}
        </a>
      );
    }
    return (
      <Link
        href={href}
        className="text-foreground underline underline-offset-4 hover:no-underline"
      >
        {children}
      </Link>
    );
  },
  img({ src, alt, title }) {
    if (typeof src !== "string") return null;
    return <ImageWithCaption src={src} alt={alt ?? ""} caption={title} />;
  },
  code({ children }) {
    return (
      <code className="bg-accent text-foreground rounded-sm px-1.5 py-0.5 font-mono text-sm">
        {children}
      </code>
    );
  },
};

export function Markdown({ content, className }: MarkdownProps) {
  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
```

- [ ] **Step 2: Verify typecheck**

Run:

```bash
pnpm typecheck
```

Expected: clean. If `react-markdown` types complain about `Components` shape, check that the `pnpm add` step pulled v9+ (server-compatible).

- [ ] **Step 3: Commit**

```bash
git add lib/case-study/markdown.tsx
git commit -m "$(cat <<'EOF'
feat(case-study): markdown renderer with design-token type ramp (#23)

react-markdown + remark-gfm wired with custom renderers for p/h1/h2/h3,
lists, links (external opens in new tab, internal uses next/link), images
(![alt](src "caption") → ImageWithCaption), and inline code in Geist Mono.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: `CaseStudyHero` component

**Files:**

- Create: `components/case-study/CaseStudyHero.tsx`

- [ ] **Step 1: Create the component**

Create `components/case-study/CaseStudyHero.tsx`:

```tsx
import Image from "next/image";

import { cn } from "@/lib/utils";
import type { ProjectAssetRow, ProjectWithRelations } from "@/lib/db/queries";

type CaseStudyHeroProps = {
  project: ProjectWithRelations;
  heroAsset: ProjectAssetRow | null;
  className?: string;
};

const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

function formatDate(project: ProjectWithRelations): string | null {
  if (project.created_at) {
    return DATE_FORMATTER.format(new Date(project.created_at));
  }
  if (project.year) {
    return String(project.year);
  }
  return null;
}

export function CaseStudyHero({ project, heroAsset, className }: CaseStudyHeroProps) {
  const date = formatDate(project);
  const tags = [project.category, project.role, project.client].filter(
    (v): v is string => Boolean(v),
  );

  return (
    <header className={cn("flex flex-col items-center gap-12", className)}>
      <div className="flex w-full max-w-[610px] flex-col items-center gap-6 text-center">
        <div className="text-foreground flex flex-wrap items-center justify-center gap-6 text-base leading-6 font-medium">
          {date ? <span>{date}</span> : null}
          {tags.map((t) => (
            <span key={t} className="text-muted-foreground capitalize">
              {t}
            </span>
          ))}
        </div>
        <h1 className="text-foreground text-4xl leading-10 font-semibold">
          {project.title}
        </h1>
        {project.summary ? (
          <p className="text-muted-foreground text-base leading-6 font-medium">
            {project.summary}
          </p>
        ) : null}
      </div>

      {heroAsset ? (
        <div className="bg-surface relative aspect-[1140/457] w-full overflow-hidden rounded-4xl">
          <Image
            src={heroAsset.url}
            alt={heroAsset.alt_text ?? project.title}
            fill
            priority
            sizes="(min-width: 1280px) 1140px, 100vw"
            className="object-cover"
          />
        </div>
      ) : null}
    </header>
  );
}
```

- [ ] **Step 2: Verify typecheck**

Run:

```bash
pnpm typecheck
```

Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add components/case-study/CaseStudyHero.tsx
git commit -m "$(cat <<'EOF'
feat(case-study): CaseStudyHero with centered metadata + title + hero card (#23)

Header block: date + category/role/client tags, 36px semibold title,
muted subtitle, then a full-width aspect-[1140/457] rounded-4xl card
rendering the first project_assets row where type = 'hero'. Image card
is skipped when no hero asset exists.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: `TextImageSplit` component

**Files:**

- Create: `components/case-study/TextImageSplit.tsx`

- [ ] **Step 1: Create the component**

Create `components/case-study/TextImageSplit.tsx`:

```tsx
import Image from "next/image";

import { Markdown } from "@/lib/case-study/markdown";
import { cn } from "@/lib/utils";
import type { ProjectAssetRow } from "@/lib/db/queries";

type TextImageSplitProps = {
  side: "left" | "right";
  heading?: string | null;
  contentMd?: string | null;
  asset: ProjectAssetRow | null;
  className?: string;
};

export function TextImageSplit({
  side,
  heading,
  contentMd,
  asset,
  className,
}: TextImageSplitProps) {
  const imageBlock = asset ? (
    <div
      className={cn(
        "bg-surface flex h-[430px] w-full max-w-[340px] flex-col items-center justify-end overflow-hidden rounded-4xl p-6 md:shrink-0",
      )}
    >
      <div className="relative h-full w-full">
        <Image
          src={asset.url}
          alt={asset.alt_text ?? heading ?? ""}
          fill
          sizes="340px"
          className="object-cover"
        />
      </div>
      {heading ? (
        <p className="text-foreground mt-6 w-full text-xl leading-7 font-semibold">
          {heading}
        </p>
      ) : null}
    </div>
  ) : null;

  const textBlock = (
    <div className="flex w-full max-w-[420px] flex-col gap-6">
      {contentMd ? (
        <div className="text-foreground text-xl leading-7 font-medium">
          <Markdown content={contentMd} />
        </div>
      ) : null}
    </div>
  );

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-12 md:items-stretch",
        side === "left" ? "md:flex-row" : "md:flex-row-reverse",
        className,
      )}
    >
      {imageBlock}
      {textBlock}
    </div>
  );
}
```

- [ ] **Step 2: Verify typecheck**

Run:

```bash
pnpm typecheck
```

Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add components/case-study/TextImageSplit.tsx
git commit -m "$(cat <<'EOF'
feat(case-study): TextImageSplit with side prop + auto-stack on mobile (#23)

Two-column layout matching Figma 10:715 image+text rhythm. 340×430
rounded-4xl image card on one side, 420px markdown text block on the
other. Stacks vertically below md. `side` prop is set by the body
dispatcher via splitSideFor().

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: `MetricsRow` component

**Files:**

- Create: `components/case-study/MetricsRow.tsx`

- [ ] **Step 1: Create the component**

Create `components/case-study/MetricsRow.tsx`:

```tsx
import { MetricCallout } from "@/components/project/MetricCallout";
import { cn } from "@/lib/utils";

type MetricsRowProps = {
  metrics: Record<string, string | number> | null | undefined;
  className?: string;
};

function isPlainRecord(
  value: unknown,
): value is Record<string, string | number> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

export function MetricsRow({ metrics, className }: MetricsRowProps) {
  if (!isPlainRecord(metrics)) return null;
  const entries = Object.entries(metrics).filter(
    ([, value]) => value !== null && value !== undefined && value !== "",
  );
  if (entries.length === 0) return null;

  return (
    <div
      className={cn(
        "grid w-full grid-cols-1 gap-12 md:grid-cols-3",
        className,
      )}
    >
      {entries.map(([label, value]) => (
        <MetricCallout key={label} n={value} label={label.replace(/_/g, " ")} />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Verify typecheck**

Run:

```bash
pnpm typecheck
```

Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add components/case-study/MetricsRow.tsx
git commit -m "$(cat <<'EOF'
feat(case-study): MetricsRow wraps MetricCallout in a 3-col grid (#23)

Reads project.metrics jsonb (Record<string, string|number>), filters empty
values, and renders one MetricCallout per entry in a 1-col → 3-col grid.
Returns null when metrics is empty so an orphan section row doesn't
render a blank space.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: `Gallery` component

**Files:**

- Create: `components/case-study/Gallery.tsx`

- [ ] **Step 1: Create the component**

Create `components/case-study/Gallery.tsx`:

```tsx
import { ImageWithCaption } from "@/components/case-study/ImageWithCaption";
import { cn } from "@/lib/utils";
import type { ProjectAssetRow } from "@/lib/db/queries";

type GalleryProps = {
  assets: ProjectAssetRow[];
  className?: string;
};

export function Gallery({ assets, className }: GalleryProps) {
  if (assets.length === 0) return null;

  return (
    <div className={cn("flex w-full flex-col gap-12", className)}>
      {assets.map((asset) => (
        <ImageWithCaption
          key={asset.id}
          src={asset.url}
          alt={asset.alt_text ?? ""}
          caption={asset.caption}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Verify typecheck**

Run:

```bash
pnpm typecheck
```

Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add components/case-study/Gallery.tsx
git commit -m "$(cat <<'EOF'
feat(case-study): Gallery stacks ImageWithCaption vertically (#23)

Simple vertical stack — no carousel, no lightbox. Matches the editorial
mood and keeps the page fully server-rendered. Lightbox can be added as
a client island later if a Figma reference appears.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 9: `CaseStudyBody` dispatcher

**Files:**

- Create: `components/case-study/CaseStudyBody.tsx`

- [ ] **Step 1: Create the dispatcher**

Create `components/case-study/CaseStudyBody.tsx`:

```tsx
import { Gallery } from "@/components/case-study/Gallery";
import { MetricsRow } from "@/components/case-study/MetricsRow";
import { TextImageSplit } from "@/components/case-study/TextImageSplit";
import { Markdown } from "@/lib/case-study/markdown";
import {
  assetForImageTextSection,
  getGalleryAssets,
  normalizeSectionType,
  sortSections,
  splitSideFor,
} from "@/lib/case-study/sections";
import { cn } from "@/lib/utils";
import type {
  ProjectAssetRow,
  ProjectSectionRow,
  ProjectWithRelations,
} from "@/lib/db/queries";

type CaseStudyBodyProps = {
  project: ProjectWithRelations;
  className?: string;
};

function SectionHeading({ heading }: { heading: string | null | undefined }) {
  if (!heading) return null;
  return (
    <h2 className="text-foreground text-2xl leading-8 font-semibold">
      {heading}
    </h2>
  );
}

function TextSection({ section }: { section: ProjectSectionRow }) {
  return (
    <section className="mx-auto flex w-full max-w-[687px] flex-col gap-6">
      <SectionHeading heading={section.heading} />
      {section.content_md ? <Markdown content={section.content_md} /> : null}
    </section>
  );
}

function ImageTextSection({
  section,
  side,
  asset,
}: {
  section: ProjectSectionRow;
  side: "left" | "right";
  asset: ProjectAssetRow | null;
}) {
  return (
    <section className="w-full">
      <TextImageSplit
        side={side}
        heading={section.heading}
        contentMd={section.content_md}
        asset={asset}
      />
    </section>
  );
}

function MetricsSection({
  section,
  metrics,
}: {
  section: ProjectSectionRow;
  metrics: ProjectWithRelations["metrics"];
}) {
  return (
    <section className="mx-auto flex w-full max-w-[1140px] flex-col gap-6">
      <SectionHeading heading={section.heading} />
      <MetricsRow metrics={metrics as Record<string, string | number> | null} />
    </section>
  );
}

function GallerySection({
  section,
  assets,
}: {
  section: ProjectSectionRow;
  assets: ProjectAssetRow[];
}) {
  return (
    <section className="mx-auto flex w-full max-w-[1140px] flex-col gap-6">
      <SectionHeading heading={section.heading} />
      <Gallery assets={assets} />
    </section>
  );
}

export function CaseStudyBody({ project, className }: CaseStudyBodyProps) {
  const sections = sortSections(project.project_sections);
  const galleryAssets = getGalleryAssets(project.project_assets);

  return (
    <div className={cn("flex flex-col gap-12", className)}>
      {sections.map((section) => {
        const type = normalizeSectionType(section.section_type);
        switch (type) {
          case "image+text":
            return (
              <ImageTextSection
                key={section.id}
                section={section}
                side={splitSideFor(section, sections)}
                asset={assetForImageTextSection(section, sections, galleryAssets)}
              />
            );
          case "metrics":
            return (
              <MetricsSection
                key={section.id}
                section={section}
                metrics={project.metrics}
              />
            );
          case "gallery":
            return (
              <GallerySection
                key={section.id}
                section={section}
                assets={galleryAssets}
              />
            );
          case "text":
          default:
            return <TextSection key={section.id} section={section} />;
        }
      })}
    </div>
  );
}
```

- [ ] **Step 2: Verify typecheck**

Run:

```bash
pnpm typecheck
```

Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add components/case-study/CaseStudyBody.tsx
git commit -m "$(cat <<'EOF'
feat(case-study): CaseStudyBody dispatch table on section_type (#23)

Reads sorted project_sections and dispatches each row to the right
renderer: text / image+text / metrics / gallery, with unknown section
types falling through to text. Pairs image+text sections with gallery
assets via assetForImageTextSection() and alternates sides via
splitSideFor().

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 10: `app/case-studies/[slug]/page.tsx`

**Files:**

- Create: `app/case-studies/[slug]/page.tsx`

- [ ] **Step 1: Create the page**

Create `app/case-studies/[slug]/page.tsx`:

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CaseStudyBody } from "@/components/case-study/CaseStudyBody";
import { CaseStudyHero } from "@/components/case-study/CaseStudyHero";
import { createServerClient } from "@/lib/db/client";
import { getProjectBySlug } from "@/lib/db/queries";
import { getHeroAsset } from "@/lib/case-study/sections";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("projects")
    .select("slug")
    .eq("published", true);
  return (data ?? []).map((row) => ({ slug: row.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { data: project } = await getProjectBySlug(slug);
  if (!project) return {};

  const title = `${project.title} — Federico Ostan-Bazán`;
  const description = project.summary ?? undefined;
  const ogImage = project.og_image ?? undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function CaseStudyPage({ params }: PageProps) {
  const { slug } = await params;
  const { data: project } = await getProjectBySlug(slug);
  if (!project) notFound();

  const heroAsset = getHeroAsset(project.project_assets);

  return (
    <article className="mx-auto flex w-full max-w-[1140px] flex-col gap-12 px-6 py-12 md:px-12 lg:px-[150px] lg:py-20">
      <CaseStudyHero project={project} heroAsset={heroAsset} />
      <CaseStudyBody project={project} />
    </article>
  );
}
```

- [ ] **Step 2: Verify typecheck**

Run:

```bash
pnpm typecheck
```

Expected: clean.

- [ ] **Step 3: Verify build registers the new routes**

Run:

```bash
pnpm build
```

Expected: build succeeds and the route list includes `● /case-studies/[slug]` with one prerendered entry per published slug (e.g. `seed-ai-project`, `seed-mobile-project`, `seed-desktop-project`).

If the build hits Supabase env errors, that means `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` aren't loaded in the build shell. Add them via `vercel env pull` or by sourcing `.env.local` before the build — do not skip the verification.

- [ ] **Step 4: Commit**

```bash
git add app/case-studies/[slug]/page.tsx
git commit -m "$(cat <<'EOF'
feat(case-study): /case-studies/[slug] route with SSG + metadata (#23)

Server-rendered page. generateStaticParams enumerates published slugs at
build time; generateMetadata builds title/description/OG/Twitter from the
project row; notFound() handles unpublished or missing slugs.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 11: Dynamic OG image route

**Files:**

- Create: `app/case-studies/[slug]/opengraph-image.tsx`

- [ ] **Step 1: Create the OG handler**

Create `app/case-studies/[slug]/opengraph-image.tsx`:

```tsx
import { ImageResponse } from "next/og";

import { getProjectBySlug } from "@/lib/db/queries";

export const runtime = "edge";
export const alt = "Federico Ostan-Bazán — case study";
export const size = { width: 1200, height: 630 } as const;
export const contentType = "image/png";

type OgProps = {
  params: Promise<{ slug: string }>;
};

export default async function OgImage({ params }: OgProps) {
  const { slug } = await params;
  const { data: project } = await getProjectBySlug(slug);
  const title = project?.title ?? "Federico Ostan-Bazán";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "96px",
          background: "#fafafa",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div
          style={{
            color: "#0a0a0a",
            fontSize: 96,
            fontWeight: 600,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            display: "flex",
          }}
        >
          {title}
        </div>
        <div
          style={{
            color: "#737373",
            fontSize: 32,
            fontWeight: 500,
            display: "flex",
          }}
        >
          Federico Ostan-Bazán
        </div>
      </div>
    ),
    { ...size },
  );
}
```

- [ ] **Step 2: Verify typecheck**

Run:

```bash
pnpm typecheck
```

Expected: clean.

- [ ] **Step 3: Verify build still passes**

Run:

```bash
pnpm build
```

Expected: build succeeds. The OG file shows up in the route table under the same `[slug]` segment.

- [ ] **Step 4: Commit**

```bash
git add app/case-studies/[slug]/opengraph-image.tsx
git commit -m "$(cat <<'EOF'
feat(case-study): dynamic OG image via next/og (#23)

1200×630 monochrome card — #fafafa bg, 96px Inter Semibold project title,
muted "Federico Ostan-Bazán" footer. Runs on the edge runtime as
required by next/og ImageResponse.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 12: Migrate seed data to the new section_type taxonomy

**Files:**

- Modify: `scripts/seed-dev.ts`

- [ ] **Step 1: Rewrite the PROJECTS array and add a wipe step**

Open `scripts/seed-dev.ts` and replace the body of the file (everything from `const PROJECTS: SeedProject[] = [` through the end of the `main()` function) with the version below. Keep the existing imports and the `SeedProject` type alias at the top of the file — only the `PROJECTS` array and the `main()` body change.

```ts
const PROJECTS: SeedProject[] = [
  {
    slug: "seed-ai-project",
    title: "Aurora — AI Writing Companion",
    role: "Lead Product Designer",
    client: "Placeholder Labs",
    year: 2025,
    summary:
      "An AI-native writing tool that turns rough thoughts into structured drafts.",
    description:
      "Aurora is a placeholder AI project used to exercise the case-study template. It demonstrates end-to-end retrieval with sections, assets, and tech stack metadata.",
    tech_stack: ["Next.js", "AI SDK", "Vercel AI Gateway", "Supabase"],
    metrics: { adoption: "12k waitlist", retention: "44% D30", nps: "62" },
    category: "ai",
    og_image: "https://placehold.co/1200x630/png?text=Aurora",
    published: true,
    sections: [
      {
        section_type: "text",
        heading: "The blank page is the enemy",
        content_md:
          "Writers stall at the first sentence. **Aurora** bridges intent and structure so first drafts arrive in minutes, not hours.\n\nWe started by interviewing 32 long-form writers and discovered that *outline anxiety* — not prose — was the real friction point.",
        order: 1,
      },
      {
        section_type: "image+text",
        heading: "Outline-first AI",
        content_md:
          "Instead of generating prose first, Aurora generates a navigable outline you can edit before any paragraph is written.",
        order: 2,
      },
      {
        section_type: "metrics",
        heading: "Outcomes",
        content_md: null,
        order: 3,
      },
      {
        section_type: "text",
        heading: "What we learned",
        content_md:
          "Beta users shipped **3.4× more drafts per week** without sacrificing voice consistency. The outline-first approach worked because it externalised the cognitive load of structure.",
        order: 4,
      },
      {
        section_type: "image+text",
        heading: "Voice consistency",
        content_md:
          "A second model continuously checks new paragraphs against the writer's existing voice — flagging tone drift before it compounds.",
        order: 5,
      },
      {
        section_type: "gallery",
        heading: "Screens",
        content_md: null,
        order: 6,
      },
    ],
    assets: [
      {
        type: "hero",
        url: "https://placehold.co/1600x900/png?text=Aurora+Hero",
        alt_text: "Aurora hero placeholder",
        caption: "Hero shot — placeholder",
        order: 1,
      },
      {
        type: "screenshot",
        url: "https://placehold.co/1200x800/png?text=Outline",
        alt_text: "Outline editor screen",
        caption: "Outline-first editor",
        order: 2,
      },
      {
        type: "screenshot",
        url: "https://placehold.co/1200x800/png?text=Voice",
        alt_text: "Voice consistency screen",
        caption: "Voice consistency panel",
        order: 5,
      },
      {
        type: "screenshot",
        url: "https://placehold.co/1200x800/png?text=Drafts",
        alt_text: "Drafts list",
        caption: "Drafts dashboard",
        order: 7,
      },
      {
        type: "screenshot",
        url: "https://placehold.co/1200x800/png?text=Settings",
        alt_text: "Settings panel",
        caption: "Settings",
        order: 8,
      },
    ],
  },
  {
    slug: "seed-mobile-project",
    title: "Tide — Mobile Meditation",
    role: "Senior Product Designer",
    client: "Placeholder Wellness",
    year: 2024,
    summary:
      "A mobile-first meditation app with adaptive session length based on heart-rate variability.",
    description:
      "Tide is a placeholder mobile project used to exercise retrieval and the mobile category filter.",
    tech_stack: ["React Native", "Expo", "HealthKit", "TypeScript"],
    metrics: { rating: "4.8 App Store", sessions: "2.1M monthly", retention: "58% D30" },
    category: "mobile",
    og_image: "https://placehold.co/1200x630/png?text=Tide",
    published: true,
    sections: [
      {
        section_type: "text",
        heading: "Sessions that don't fit your day",
        content_md:
          "Most meditation apps assume a fixed 10-minute window. **Tide adapts** to the time and energy you actually have.",
        order: 1,
      },
      {
        section_type: "image+text",
        heading: "Adaptive sessions",
        content_md:
          "We use HRV signals and a quick mood check to pick a 2–20 minute session that suits the moment.",
        order: 2,
      },
      {
        section_type: "metrics",
        heading: "Outcomes",
        content_md: null,
        order: 3,
      },
    ],
    assets: [
      {
        type: "hero",
        url: "https://placehold.co/1600x900/png?text=Tide+Hero",
        alt_text: "Tide hero placeholder",
        caption: "Hero shot — placeholder",
        order: 1,
      },
      {
        type: "screenshot",
        url: "https://placehold.co/1200x800/png?text=Tide+Adaptive",
        alt_text: "Adaptive session selector",
        caption: "Adaptive session selector",
        order: 2,
      },
    ],
  },
  {
    slug: "seed-desktop-project",
    title: "Quartz — Desktop Code Map",
    role: "Design Engineer",
    client: "Placeholder Devtools",
    year: 2023,
    summary:
      "A native desktop app that visualises large codebases as zoomable maps.",
    description:
      "Quartz is a placeholder desktop project used to exercise the desktop category and the case-study layout for dense technical content.",
    tech_stack: ["Tauri", "Rust", "WebGL", "TypeScript"],
    metrics: { repos_indexed: "8k", users: "1.2k weekly active" },
    category: "desktop",
    og_image: "https://placehold.co/1200x630/png?text=Quartz",
    published: true,
    sections: [
      {
        section_type: "text",
        heading: "Codebases as terra incognita",
        content_md:
          "New engineers spend weeks orienting in a large repo. **Quartz** makes structure visible at a glance.",
        order: 1,
      },
      {
        section_type: "image+text",
        heading: "Zoomable architecture maps",
        content_md:
          "We render a force-directed graph in WebGL, with *semantic zoom* from system → module → file.",
        order: 2,
      },
      {
        section_type: "metrics",
        heading: "Adoption",
        content_md: null,
        order: 3,
      },
    ],
    assets: [
      {
        type: "hero",
        url: "https://placehold.co/1600x900/png?text=Quartz+Hero",
        alt_text: "Quartz hero placeholder",
        caption: "Hero shot — placeholder",
        order: 1,
      },
      {
        type: "screenshot",
        url: "https://placehold.co/1200x800/png?text=Quartz+Map",
        alt_text: "Architecture map screen",
        caption: "Architecture map",
        order: 2,
      },
    ],
  },
];

async function main() {
  const supabase = createServerClient();

  // Wipe existing seed rows so this script is idempotent.
  // FK from project_sections / project_assets cascades on project delete.
  const slugs = PROJECTS.map((p) => p.slug);
  const { error: wipeError } = await supabase
    .from("projects")
    .delete()
    .in("slug", slugs);
  if (wipeError) {
    throw new Error(`Failed to wipe seed projects: ${wipeError.message}`);
  }

  for (const { sections, assets, ...project } of PROJECTS) {
    const { data: inserted, error: projectError } = await supabase
      .from("projects")
      .insert(project)
      .select("id, slug")
      .single();

    if (projectError || !inserted) {
      throw new Error(
        `Failed to insert project ${project.slug}: ${projectError?.message ?? "no row returned"}`,
      );
    }

    const projectId = inserted.id;

    if (sections.length > 0) {
      const { error: sectionsError } = await supabase
        .from("project_sections")
        .insert(sections.map((s) => ({ ...s, project_id: projectId })));
      if (sectionsError) {
        throw new Error(
          `Failed to insert sections for ${project.slug}: ${sectionsError.message}`,
        );
      }
    }

    if (assets.length > 0) {
      const { error: assetsError } = await supabase
        .from("project_assets")
        .insert(assets.map((a) => ({ ...a, project_id: projectId })));
      if (assetsError) {
        throw new Error(
          `Failed to insert assets for ${project.slug}: ${assetsError.message}`,
        );
      }
    }

    console.log(`  ✓ ${project.slug}`);
  }

  console.log(`Seeded ${PROJECTS.length} projects`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

If `project_sections` / `project_assets` do NOT have `ON DELETE CASCADE` foreign keys to `projects`, the wipe step will fail. In that case, check `supabase/migrations/0001_initial_schema.sql` and add the cascade to the FK definitions in a new migration before continuing. (Spec note: this is the expected behaviour — verify on first run, not blindly.)

- [ ] **Step 2: Verify typecheck**

Run:

```bash
pnpm typecheck
```

Expected: clean.

- [ ] **Step 3: Re-seed the database**

Run:

```bash
pnpm db:seed
```

Expected output:

```
  ✓ seed-ai-project
  ✓ seed-mobile-project
  ✓ seed-desktop-project
Seeded 3 projects
```

If you see a foreign-key error on the wipe step, fix the schema migration as noted above before continuing.

- [ ] **Step 4: Commit**

```bash
git add scripts/seed-dev.ts
git commit -m "$(cat <<'EOF'
feat(case-study): migrate seed to layout-based section types (#23)

- problem/solution/outcome → text + image+text + metrics + gallery
- adds richer sections + extra screenshot assets so the new layout
  components have something to render
- wipes existing seed rows before insert so the script is idempotent

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 13: Final QA and build verification

**Files:** none (verification only)

- [ ] **Step 1: Type and token lint**

Run:

```bash
pnpm typecheck && pnpm tokens:lint
```

Expected: both clean.

- [ ] **Step 2: Build and confirm static generation**

Run:

```bash
pnpm build
```

Expected: build succeeds; the route table includes:

```
● /case-studies/[slug]
  ├ /case-studies/seed-ai-project
  ├ /case-studies/seed-mobile-project
  └ /case-studies/seed-desktop-project
```

The `●` (or `○`) indicates Static, which proves `generateStaticParams()` ran at build time.

- [ ] **Step 3: Manual browser QA — happy path**

Run:

```bash
pnpm dev
```

In a browser, visit:

1. `http://localhost:3000/case-studies/seed-ai-project` — verify:
   - Centered date + tag pills + 36px title + muted subtitle at the top
   - Hero image card directly below at `aspect-[1140/457]`, `rounded-4xl`
   - Body sections render in `order` from the DB
   - Markdown bold (`**Aurora**`) and italics (`*outline anxiety*`) render
   - `image+text` sections alternate sides (1st = image-left, 2nd = image-right)
   - `metrics` section shows 3 callouts in a row on desktop, stacked on mobile
   - `gallery` section shows the screenshots as a vertical stack
   - `BottomDock` is visible (it's global)
2. `http://localhost:3000/case-studies/seed-mobile-project` — same checks, fewer sections (no gallery row).
3. `http://localhost:3000/case-studies/seed-desktop-project` — same checks.

- [ ] **Step 4: Manual browser QA — 404 path**

Visit `http://localhost:3000/case-studies/nope-not-a-real-slug` — expect the Next default 404 page.

- [ ] **Step 5: Manual OG image check**

Visit `http://localhost:3000/case-studies/seed-ai-project/opengraph-image` — expect a 1200×630 PNG with `Aurora — AI Writing Companion` in large semibold ink, `Federico Ostan-Bazán` in muted gray at the bottom-left, `#fafafa` background.

- [ ] **Step 6: Mobile responsive check**

Open Chrome devtools, switch to mobile viewport (375px wide), revisit `/case-studies/seed-ai-project`. Verify:

- Hero title still readable, body column fills viewport with `px-6` padding
- `TextImageSplit` sections stack vertically (image on top, text below)
- `MetricsRow` shows one column
- No horizontal scroll anywhere

- [ ] **Step 7: Lighthouse SEO check (optional, but in QA checklist)**

In Chrome devtools → Lighthouse → SEO only → run on `/case-studies/seed-ai-project` in **dev mode is fine for a smoke check**, but for a real number run `pnpm build && pnpm start` and Lighthouse on `:3000`. Target: SEO ≥ 95.

- [ ] **Step 8: No commit for this task (verification only)**

If any check fails, fix in the relevant earlier task and re-verify the affected steps before moving on. Do not paper over visual or 404 issues with "good enough" — the spec's Done When clause is explicit about polish.

---

## Done When

- All 13 tasks complete
- `pnpm typecheck` clean
- `pnpm build` succeeds and prerenders every published case-study slug
- `/case-studies/seed-ai-project` renders the full layout end-to-end
- `/case-studies/nope` returns 404
- OG image route returns a 1200×630 PNG
- Mobile viewport is clean (no overflow, sections stack)

## What this plan does NOT touch

- Lightbox / pinch-zoom for `Gallery` (deferred)
- Scroll-driven reveal motion (separate motion issue)
- prev / next case-study navigation
- Custom 404 page styling
- Section reordering UI
- Dark theme
