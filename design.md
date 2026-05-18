---
version: alpha
name: Federico Ostan-Bazán — Portfolio
description: >-
  Monochrome, near-white, conversational portfolio. Token values are sourced
  from the Figma file qXV92qqNpqAICevWuxRxpK and mirror Tailwind / shadcn
  semantic roles 1:1 so that `app/globals.css` can be regenerated from this
  document without divergence.
colors:
  ink: "#0a0a0a"
  ink-muted: "#737373"
  surface: "#ffffff"
  page: "#fafafa"
  border: "#e5e5e5"
  accent: "#f5f5f5"
  primary: "{colors.ink}"
  primary-foreground: "{colors.surface}"
  background: "{colors.page}"
  foreground: "{colors.ink}"
  card: "{colors.surface}"
  card-foreground: "{colors.ink}"
  popover: "{colors.surface}"
  popover-foreground: "{colors.ink}"
  secondary: "{colors.accent}"
  secondary-foreground: "{colors.ink}"
  muted: "{colors.accent}"
  muted-foreground: "{colors.ink-muted}"
  accent-foreground: "{colors.ink}"
  destructive: "#dc2626"
  input: "{colors.border}"
  ring: "{colors.ink-muted}"
typography:
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: 400
    lineHeight: 16px
    letterSpacing: 0em
  caption-medium:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: 500
    lineHeight: 16px
    letterSpacing: 0em
  body:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 500
    lineHeight: 24px
    letterSpacing: 0em
  title:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: 600
    lineHeight: 28px
    letterSpacing: 0em
  heading:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: 500
    lineHeight: 32px
    letterSpacing: 0em
  heading-emphasis:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: 600
    lineHeight: 32px
    letterSpacing: 0em
spacing:
  "0": 0px
  "3": 12px
  "6": 24px
  "12": 48px
rounded:
  lg: 10px
  4xl: 26px
  full: 9999px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
  button-outline:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    typography: "{typography.body}"
    rounded: "{rounded.full}"
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.card-foreground}"
    rounded: "{rounded.4xl}"
---

# Federico Ostan-Bazán — Portfolio Design System

## Overview

A monochrome, conversational portfolio that opens as a chat-style hero and
unfolds into project work. The mood is calm and editorial: near-white page,
true-black ink, a single typeface (Inter), generous breathing room, and soft
elevation reserved for floating surfaces (cards, the dock, hovered tiles).

Personality cues:

- **Confident, not loud.** No chromatic brand colour — contrast comes from ink
  on near-white, not from hue. Accents are gestural (motion, elevation) not
  pigmented.
- **Conversational.** The hero behaves like an input field. Type weight stays
  in the medium / semibold range so the page reads like prose, not marketing.
- **Tactile.** Cards have real radius (26px) and a real shadow. The dock and
  hero input feel pressable.

## Colors

The palette is fully monochrome neutral. Pure white is reserved for *surfaces
that float above the page* (cards, popovers, the chat input). The page itself
sits on a warmer near-white so white surfaces read as elevated rather than
flush.

- **Ink (`#0a0a0a`):** Body and heading text, primary button fills, icon
  default. This is Tailwind's `neutral-950` — true neutral, no blue cast.
- **Ink-muted (`#737373`):** Secondary copy, captions, placeholder text, ring
  / focus halo. Tailwind `neutral-500`.
- **Surface (`#ffffff`):** Cards, popovers, the chat input pill, the dock.
- **Page (`#fafafa`):** The body background. Sits one step below Surface so
  white cards have implicit elevation even without shadow.
- **Border (`#e5e5e5`):** Hairline dividers, input borders, card borders.
- **Accent (`#f5f5f5`):** Hovered or pressed neutral states, secondary button
  fill, muted backgrounds.

Dark theme is **not** a target for M1.

## Typography

Single family: **Inter**, variable. Weight ramp is intentionally narrow —
400 (Regular), 500 (Medium), 600 (Semi Bold) — to keep the page feeling like a
single voice.

Type roles (size / line-height / weight):

- **caption** — 12 / 16 / 400. Metadata, footnotes.
- **caption-medium** — 12 / 16 / 500. UI labels inside cards.
- **body** — 16 / 24 / 500. Default running text and button labels.
- **title** — 20 / 28 / 600. Card titles, section labels.
- **heading** — 24 / 32 / 500. Hero / section headings (the light-weight
  variant — the chat-style hero uses this).
- **heading-emphasis** — 24 / 32 / 600. Heavier section headings inside
  cards.

No display ramp above 24px is in use today; if the hero copy ever needs to
scale, add a `display` token here first, then mirror it in `globals.css`.

## Layout

Spacing scale follows Tailwind's 4px grid but is restricted to the few values
the Figma uses:

- **0** — 0px. Used for collapsing the gap inside grids.
- **3** — 12px. Inline gaps inside an input or button (icon ↔ label).
- **6** — 24px. Default gap between grouped controls or stacked text blocks.
- **12** — 48px. Section-level separation in the hero.

`stroke-width` for hairlines and icons is **2px**, applied via `stroke-2`.

## Elevation & Depth

One named elevation level — **shadow-lg** — composed of two stacked drop
shadows to feel atmospheric rather than hard:

- `0 4px 6px -4px rgba(0, 0, 0, 0.10)`
- `0 10px 15px -3px rgba(0, 0, 0, 0.10)`

Applied to: floating cards on hover, the dock, the chat input pill, popovers.
Static cards do **not** receive shadow — they rely on the Page vs Surface
contrast for separation.

## Shapes

Three radii, no in-between values:

- **lg (10px)** — buttons, inputs, small cards, list rows.
- **4xl (26px)** — feature cards, the chat input pill, hero containers.
- **full (9999px)** — pills, the dock, avatars, outline-style filter chips.

Everything else inherits from these. Avoid introducing new radii without
adding a token here first.

## Components

A small base set is mapped in the YAML for reference; the canonical
implementation lives in `components/ui/*` (shadcn). The mappings below are
intentionally minimal — they document the *role* of each surface, not its
full visual spec.

## Do's and Don'ts

- **Do** drive every colour, radius, spacing and type value from this file via
  the CSS variables in `app/globals.css` and the typed exports in
  `lib/design-tokens.ts`. No hex codes anywhere else in the codebase.
- **Do** add a new token to `design.md` first when you need a value that
  doesn't exist; only then add it to `globals.css` and (if needed) to
  `design-tokens.ts`. The lint command `pnpm tokens:lint` enforces structural
  validity.
- **Do** keep buttons and inputs at `rounded-lg` (10px). Pills (`rounded-full`)
  are reserved for filter chips and the dock.
- **Don't** introduce chromatic colours. If a state needs to feel "active",
  use elevation, weight, or fill (Accent vs Surface) — not hue.
- **Don't** use pure white (`#ffffff`) as a page background. The page is
  `#fafafa`; white is for elevated surfaces.
- **Don't** mix font families. Inter only, three weights only.

## Motion

> Non-normative section — preserved by the linter. Captures motion intent for
> the hero, dock, and gallery so that animation work in later issues stays
> consistent with the static design.

Durations:

- **fast** — 120ms. Hover / pressed states on buttons and chips.
- **base** — 220ms. Dock magnification, input focus ring, card hover lift.
- **slow** — 420ms. Hero state transitions, gallery slide-in.

Easings:

- **standard** — `cubic-bezier(0.2, 0.0, 0.0, 1.0)`. Default for entering /
  resting motion.
- **emphasized** — `cubic-bezier(0.3, 0.0, 0.0, 1.0)`. Hero opens, dock
  magnify.
- **exit** — `cubic-bezier(0.4, 0.0, 1.0, 1.0)`. Items leaving the viewport
  or popovers dismissing.

Reduced-motion: respect `prefers-reduced-motion: reduce` everywhere. Fall back
to instantaneous state changes (no slide / lift), but keep the focus-ring
fade so keyboard users still see affordance.
