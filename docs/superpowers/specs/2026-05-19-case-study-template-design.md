# Case Study Template — Design Spec

**Issue:** [#23](https://github.com/fedeostan/portfolio-federico-ostan-bazan/issues/23) — Case Study template `/case-studies/[slug]`
**Milestone:** M5 — Contact + Case Study
**Date:** 2026-05-19
**Status:** Approved — ready for implementation plan

## Goal

Deliver `/case-studies/[slug]` — a dynamic route that renders any published project from Supabase as a rich, OpenAI-blog-style case study. Visiting `/case-studies/seed-ai-project` shows a complete page generated entirely from DB content; visiting an unpublished or missing slug returns 404; share-link previews show a polished OG card.

Visual reference: Figma node `10-715` in file `qXV92qqNpqAICevWuxRxpK` ("Personal Project").

## Architecture

### Route + data flow

`app/case-studies/[slug]/page.tsx` is a Server Component. It calls the existing `getProjectBySlug(slug)` helper in `lib/db/queries.ts`, which returns the project row plus `project_sections` and `project_assets` in one round-trip. If the row is missing or `published = false`, the page calls `notFound()` (Next's default 404).

`generateStaticParams()` pre-builds every published slug at build time. `generateMetadata()` produces `<title>`, description, and Open Graph + Twitter card metadata from the project row.

### Component tree

```
app/case-studies/[slug]/
  page.tsx                  ← server: fetch + 404 + metadata
  opengraph-image.tsx       ← server: dynamic OG via next/og ImageResponse (edge runtime)

components/case-study/
  CaseStudyHero.tsx         ← server: date row + tag pills + 36px title + muted subtitle + hero asset card
  CaseStudyBody.tsx         ← server: sort sections by `order`, dispatch on section_type
  ImageWithCaption.tsx      ← server: next/image + figcaption
  TextImageSplit.tsx        ← server: 50/50 grid with `side: 'left' | 'right'`
  MetricsRow.tsx            ← server: 3-col responsive grid wrapping the existing MetricCallout
  Gallery.tsx               ← server: vertical stack of ImageWithCaption

lib/case-study/
  markdown.tsx              ← shared react-markdown setup + custom renderers
  sections.ts               ← pure helpers: groupSections(), getHeroAsset(), getGalleryAssets(), splitSideFor()
```

### CaseStudyBody dispatch contract

`section_type` is a layout marker, not a narrative beat. Dispatch table:

| `section_type` | Renderer                                                               |
| -------------- | ---------------------------------------------------------------------- |
| `text`         | `<Markdown content={section.content_md} />` inside a 687px prose column |
| `image+text`   | `<TextImageSplit side={...} text={...} asset={...} />`                  |
| `metrics`      | `<MetricsRow metrics={project.metrics} />`                              |
| `gallery`      | `<Gallery assets={galleryAssets} />`                                    |
| anything else  | falls through to `text` (graceful default)                              |

Pure helpers in `lib/case-study/sections.ts` resolve:

- `getHeroAsset(assets)` → first `project_assets` row where `type = 'hero'`, ordered by `order`
- `getGalleryAssets(assets)` → all non-hero assets, ordered by `order`
- `splitSideFor(section, allSections)` → `'left'` for the 1st `image+text` section, `'right'` for the 2nd, alternating thereafter. Auto-alternation matches the Figma rhythm without editor input.

`MetricsRow` reads `project.metrics` (jsonb) from props passed down from `page.tsx`. The section row is just a "where in the flow does this go" marker.

### Why server components throughout

Everything on this page is render-from-data — no client state, no event handlers. That keeps the bundle tiny and lets `generateStaticParams()` truly pre-render. A future lightbox in `Gallery` would be added as a small `"use client"` wrapper without touching the dispatch.

## Layout & visual fidelity

Matches Figma node `10-715`.

### Page chrome

- Background: `#fafafa` (already the body bg in `globals.css`).
- No internal scroll-snap. `BottomDock` is already global, so it appears automatically.
- Responsive container: `mx-auto max-w-[1140px] px-6 md:px-12 lg:px-[150px]`.

### CaseStudyHero

- Top metadata row: date in `foreground`, then category and any extra tag pills in `muted-foreground`, separated by 24px gap (`gap-6`), centered, `text-base/medium`.
- Title: 36px / 40 line-height / semibold (`size/4xl`), centered, `text-black`, max-width 610px.
- Subtitle: `text-base/medium`, `muted-foreground`, centered, same max-width.
- Hero image card: full width of the 1140px column, `aspect-[1140/457]` (≈2.49 ratio), `rounded-4xl` (26px), `bg-surface`. Uses `next/image` with `priority` + `sizes="(min-width: 1280px) 1140px, 100vw"`.

If `getHeroAsset()` returns `null`, the title block renders but the image card is skipped (no empty placeholder).

### Body column

The Figma narrows the prose column to 687px (centered inside the 1140 frame). Each `text` section and named-heading section is wrapped in `max-w-[687px] mx-auto`. Wide sections (hero card, image+text splits) use the full 1140 to feel expansive — this dual width is a deliberate editorial choice that mirrors the Figma rhythm and keeps prose at ~75-character line length.

### TextImageSplit

- 2-column flex with `gap-12` (48px), centered.
- Image card: 340×430, `rounded-4xl`, `bg-surface`.
- Text: 420px wide at `text-xl/medium` (20px / 28px).
- `side` prop swaps `flex-row` ↔ `flex-row-reverse`.
- Stacks vertically below `md` breakpoint.

### MetricsRow

3-col responsive grid (1-col on mobile, 3-col on `md`+) wrapping the existing `MetricCallout` from `components/project/MetricCallout.tsx`. Reads `project.metrics` jsonb as `Record<string, string>` where the value is the metric and the key is the label.

If `project.metrics` is empty or null, `MetricsRow` returns `null` even when a `metrics` section row is present.

### Gallery

Vertical stack of `ImageWithCaption` components, ordered by `project_assets.order`. No carousel — keeps the editorial mood and avoids a client-side dependency. Lightbox is deferred to a future issue.

### Section spacing

Top-level vertical gap between sections: `gap-12` (48px). Matches the Figma.

## Markdown rendering

Install: `pnpm add react-markdown remark-gfm`.

`lib/case-study/markdown.tsx` exports a `<Markdown content={...} />` server component that wires `remarkPlugins={[remarkGfm]}` and the following renderer overrides:

- `img` → `<ImageWithCaption src={src} alt={alt} caption={title} />`. Markdown `![alt](src "caption")` puts the caption in `title`, which we treat as the figcaption.
- `a` → external links get `target="_blank" rel="noreferrer"` + an external-link icon; internal links use `next/link`.
- `h1` / `h2` / `h3` → mapped to design.md type roles (`title` / `heading` / `heading-emphasis`). Headings inside body sections start at h3 since the section's own `heading` field is the h2.
- `code` → inline code uses Geist Mono (already wired in `app/layout.tsx`).

This keeps Markdown as the natural input format for prose blocks while giving editors `![]()` shorthand for inline figures.

## Open Graph + metadata

Two-layer approach:

1. **Static fallback.** `generateMetadata()` sets `openGraph.images` and `twitter.images` from `project.og_image`. This is what twitter / Slack / iMessage unfurl pulls if the dynamic OG route fails.
2. **Dynamic OG image.** `app/case-studies/[slug]/opengraph-image.tsx` exports a Route Segment Config OG handler using `ImageResponse` from `next/og`. Renders a 1200×630 monochrome card: `#fafafa` bg, 96px Inter Semibold title, "Federico Ostan-Bazán" footer in `ink-muted` (`#737373`). Next prefers this file-route OG image when present.

`ImageResponse` requires `export const runtime = 'edge'` in the OG file (only the OG file, not the page).

## Error handling & edge cases

- Missing or unpublished slug → `notFound()` (Next's default 404; no custom 404 page in M5).
- Project with zero sections → CaseStudyBody renders nothing; CaseStudyHero alone still looks complete.
- Project with no hero asset → CaseStudyHero renders the title block, skips the image card.
- Empty `metrics` jsonb → MetricsRow returns `null`.
- Invalid `section_type` → falls through to the `text` renderer.
- External image domains → `next.config.ts` needs `images.remotePatterns` entries for `placehold.co` (seed data) and the Supabase Storage host. Implementation step will check and add any missing entries.

## Data migration

The seed currently uses semantic `section_type` values (`problem`, `solution`, `outcome`). Migrate `scripts/seed-dev.ts`:

- All existing semantic sections → `section_type: 'text'`, preserving their `heading` and `content_md`.
- Add one `image+text` section to each seed project (consuming the second `project_assets` row).
- Add one `metrics` section to each seed project (the `metrics` jsonb already exists in the seed).
- Add one `gallery` section to projects that have ≥ 2 non-hero assets.

The DB column is `string | null` and unindexed — no schema migration required.

## Testing / verification

No test framework is set up in this repo today; verification is:

1. `pnpm typecheck` — clean
2. `pnpm tokens:lint` — clean (design.md linter)
3. `pnpm build` — succeeds; statically generates all published case-study routes (proves `generateStaticParams`)
4. `pnpm db:seed` — re-seeds with the new section_type taxonomy
5. Manual: `/case-studies/seed-ai-project` and `/case-studies/seed-mobile-project` render correctly; `/case-studies/nope` returns 404
6. Manual: hit `/case-studies/seed-ai-project/opengraph-image` in dev server, confirm it renders a 1200×630 PNG
7. Lighthouse SEO ≥ 95 on a case-study page (issue QA target)

## Out of scope (deliberately)

- Lightbox / pinch-zoom in `Gallery` — wait for a Figma reference
- Scroll-driven motion / reveal animations — separate motion issue
- `prev / next case study` navigation at the bottom — not in #23
- Custom 404 page styling — Next default is fine for M5
- Section reordering UI — editors edit the DB directly
- Dark theme — design.md notes "Dark theme is not a target for M1"

## Files

**Create:**

- `app/case-studies/[slug]/page.tsx`
- `app/case-studies/[slug]/opengraph-image.tsx`
- `components/case-study/CaseStudyHero.tsx`
- `components/case-study/CaseStudyBody.tsx`
- `components/case-study/ImageWithCaption.tsx`
- `components/case-study/TextImageSplit.tsx`
- `components/case-study/MetricsRow.tsx`
- `components/case-study/Gallery.tsx`
- `lib/case-study/markdown.tsx`
- `lib/case-study/sections.ts`

**Modify:**

- `scripts/seed-dev.ts` — migrate section_type taxonomy + add image+text / metrics / gallery section rows
- `next.config.ts` — add `images.remotePatterns` if missing
- `package.json` — `pnpm add react-markdown remark-gfm`

## Decisions log

| Decision                                 | Choice                                                      | Rationale                                                                                              |
| ---------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `section_type` taxonomy                  | Layout-based (`text` / `image+text` / `metrics` / `gallery`) | Clean separation: `section_type` names a layout, not a narrative beat. CaseStudyBody dispatch is trivial. |
| Build metrics + gallery now or defer?    | Build minimal versions now                                  | MetricsRow is a thin wrapper over existing `MetricCallout`. Gallery is a simple stack — no carousel.    |
| TextImageSplit side rule                 | Auto-alternate by order                                     | Matches Figma rhythm without editor input.                                                              |
| Carousel vs stack for Gallery            | Stack                                                       | Matches editorial mood; no client-side dependency; easier to verify accessibility.                      |
| Hero asset source                        | First `project_assets` row where `type = 'hero'`            | Schema already supports it; seed already populates it.                                                  |
| OG image strategy                        | Both static (`project.og_image`) and dynamic (`next/og`)    | Dynamic renders fresh per-deploy; static is a graceful fallback if Edge runtime fails.                  |
