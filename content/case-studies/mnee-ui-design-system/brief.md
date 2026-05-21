---
title: MNEE UI — A Product-Led Design System
role: Head of Product Design, RockWallet
period: 2026-01 – present
status: in-flight
team: Federico Ostan Bazan (design, ownership, publishing), MNEE product team, mnee-xyz engineering (consumers)
stack: Figma, Tailwind v4, React 19, Next.js 15, npm, lucide-react, Vercel
sources:
  - wiki:design-system/mnee-ui
  - wiki:projects/mnee-ui-adoption
  - wiki:repos/merchant-portal-frontend
  - figma:qzjrgEgx4q7MAU9ypgwp48
  - https://mnee-ui.vercel.app/
  - https://github.com/mnee-xyz/merchant-portal-frontend
---

# MNEE UI — A Product-Led Design System

## Context

MNEE is a stablecoin product that ships its own merchant surfaces — a merchant portal, a Pay checkout, and several embedded experiences. By early 2026 the surface area had grown faster than the supporting visual language. Different frontends were diverging on button styles, modal behaviors, table densities, and even the meaning of "primary." Engineering was making perfectly reasonable choices in isolation, but the result felt like three different products under one name.

At the same time, the broader RockWallet design org was rebuilding its native mobile stack and was beginning to think of design systems as actual products, not just Figma libraries. The MNEE merchant portal — younger, web-only, smaller team — was the right place to prove out an end-to-end model: design library, code library, docs, and a real consumer, all owned by Product Design.

This case study is about MNEE UI: the npm package `@mnee-ui/ui`, the Figma library that drives it, and the still-in-flight adoption story in the merchant portal.

## The problem

The MNEE merchant portal had a working design language only in Figma. Engineering reimplemented patterns per feature branch, and inconsistencies compounded with every shipped surface. We needed three things at once: (1) a published code library so engineers stop rebuilding primitives, (2) a Figma library that is genuinely the source of truth (not a stale mirror), and (3) a tight enough feedback loop that design changes propagate without political overhead.

The harder, less visible problem: the merchant portal was on Tailwind v3.4.18 and the engineering team didn't have bandwidth for a v4 migration. If I built the system on v4 it wouldn't drop in. If I built it on v3 it would be obsolete on arrival. I chose v4 anyway, and then I had to solve the adoption blocker myself.

## My role

I own MNEE UI end-to-end — design, code, docs, publishing, and consumer integration strategy.

- I author the Figma library at `qzjrgEgx4q7MAU9ypgwp48` ("ShadCN" file).
- I write the React components in `/Users/fostan/mnee-ui` against vanilla Tailwind v4 — no ShadCN runtime, no headless library.
- I publish `@mnee-ui/ui` to npm myself. v0.1.1 is live today (wiki:design-system/mnee-ui).
- I run the docs site at https://mnee-ui.vercel.app/ (Next.js 15 app inside the same monorepo, `app/docs/`).
- I maintain a local Tailwind v4 fork of `merchant-portal-frontend` as a dogfooding harness because the upstream consumer can't yet take the dependency (wiki:projects/mnee-ui-adoption).

Engineering owns the consumer integration once the v4 migration lands. Everything before that point is mine.

## Approach

I started by drawing a hard scope line. MNEE UI ships **primitives and reusable composites** — Button, Badge, Card, Input, Toast, Icons, Banner, Table, Drawer, Modal, Alert, CodeBlock. It does **not** ship anything Redux-bound or business-specific — no auth screens, no `BalanceCard`, no `TransactionRow`. Those live in product repos and consume the primitives. This rule has saved me a dozen judgment calls.

Second, I leaned into a design-first workflow. The Figma library is the source of design truth; the npm package is the code implementation of that truth. When I want to change a token or component, the Figma file moves first, then the code, then a new patch release goes out. This is the reverse of what most engineer-led systems do and it works because I sit in both halves of the loop.

Third, I made deliberate technology bets that the engineering team hadn't yet ratified. Tailwind v4. Design tokens in `app/globals.css` under the v4 `@theme {}` block. `cn()` for class merging. Variants as `Record<Variant, string>` objects, never switch statements. lucide-react for icons. No CSS-in-JS, no styled-system, no runtime theming layer. The package's only peer dep is `tailwindcss: ^4` (wiki:design-system/mnee-ui).

Fourth — and this is the part I'm proudest of — I solved the adoption blocker without asking eng to drop work. I cloned `merchant-portal-frontend` locally, branched off `feat/refund`, and migrated that branch to Tailwind v4.2.3 in a single commit (`2cf8f93`). That fork is now my dogfooding harness: every component I publish gets dropped into a real screen of the real portal before I cut a release. When engineering does eventually run the v3→v4 migration upstream, they'll have a working reference (wiki:projects/mnee-ui-adoption).

Fifth, I built the docs site at the same URL surface as the system itself — `mnee-ui.vercel.app`. The docs aren't a separate Storybook bolted on later; they're the same Next.js 15 app that hosts the canonical examples. New component → new docs page → new release, in the same PR.

## Key decisions

- **Tailwind v4, even though the consumer is on v3.** Building backward would have meant rebuilding the system in twelve months. I absorbed the adoption cost into a product-side dogfooding fork instead.
- **Federico publishes, not CI.** v0.1.1 is a manual `npm publish` from my machine. This is deliberate at the current scale — I want the release surface tight and the cadence honest. CI comes when the consumer is live upstream.
- **Vanilla Tailwind v4, not ShadCN runtime.** The Figma file is called "ShadCN" because the primitives borrow that aesthetic, but the code has no ShadCN dependency. Less abstraction, fewer breaking changes, simpler diffs.
- **Hard exclusion list.** Anything Redux-bound stays out: `auth/*`, `merchant/*`, `Payment/*`, `BalanceCard`, `ActionButtons`, `TransactionRow`, `TransactionDetailsModal`. These belong to the product repo, not the design system (wiki:design-system/mnee-ui).
- **Dual-purpose repo.** `components/ui/` is the published package; `app/docs/` is the docs site. One repo, one source of truth, one release, no drift.
- **Code Connect is on the roadmap, not the critical path.** I want the Figma "ShadCN" file mapped to the npm components, but I'm not blocking shipping on it. `.figma.tsx` stubs exist; coverage is incomplete and acknowledged (wiki:design-system/mnee-ui open questions).

## Outcome

- `@mnee-ui/ui` v0.1.1 is published on npm.
- 12 components shipped: Button, Badge, Card, Input, Toast, Icons, Banner, Table, Drawer, Modal, Alert, CodeBlock.
- Live public docs at https://mnee-ui.vercel.app/.
- Figma library at `qzjrgEgx4q7MAU9ypgwp48`, used as the source of truth for all MNEE merchant design work.
- A working Tailwind v4 fork of `merchant-portal-frontend` validating real-world adoption ahead of upstream eng work.

Upstream adoption is the next milestone: `merchant-portal-frontend` does not yet declare `@mnee-ui/ui` as a dependency on any branch checked as of 2026-04-24. The v3→v4 migration upstream is the gating step.

## Reflection

The most useful thing I did was refuse to wait for engineering capacity. If I had built MNEE UI on Tailwind v3 to "match" the consumer, the system would already be on a deprecation path. Maintaining a product-side fork felt awkward at first — designers don't usually run migration branches — but it turned the adoption story from a political negotiation into a technical demo. When the eng team does pick up v4, the work is already proven.

The honest weakness: I'm the single point of failure for releases. v0.1.1 is fine; v0.5.x will need a real publish pipeline and at least one other person able to cut a release.

## Links

- Figma: https://www.figma.com/design/qzjrgEgx4q7MAU9ypgwp48/ShadCN
- Docs: https://mnee-ui.vercel.app/
- Consumer repo: https://github.com/mnee-xyz/merchant-portal-frontend
- Related wiki: [[design-system/mnee-ui]], [[projects/mnee-ui-adoption]], [[repos/merchant-portal-frontend]]
