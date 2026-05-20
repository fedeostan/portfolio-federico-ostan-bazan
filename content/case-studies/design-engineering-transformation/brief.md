---
title: The Design Engineering Transformation
role: Head of Product Design, RockWallet
period: 2025-12 – present
status: in-flight (production-ready, awaiting full eng adoption)
team: Federico Ostan Bazan (lead), UX Design team, RockWallet engineering (consumer)
stack: Figma, Code Connect, Tailwind v4, React 19, Next.js, npm, Vercel, lucide-react
sources:
  - figma:XUqTTB3FcA2NmEEkgxqf53 (Design System Initiative deck, May 2026)
  - wiki:design-system/mnee-ui.md
  - wiki:design-system/prometheus.md
  - wiki:projects/mnee-ui-adoption.md
  - wiki:projects/rw-web-prod-canvas.md
  - asana:1213423453026237 (Design Engineering project)
---

# The Design Engineering Transformation

> *"One component. 14 tickets. And what I built to make sure it never happens again."*
> — Opening slide, Design System Initiative deck, May 2026

## Context

For ten months I watched the same pattern repeat inside RockWallet's product builds. A designer would finish a screen in Figma, hand it to engineering, and the screen would come back wrong. Not catastrophically — a few pixels of spacing, the wrong font weight, a color one step off the token. Each miss generated a ticket. The ticket bounced between design, dev, QA, UAT, and back. By the time the screen was "correct," we'd burned weeks of cycle time on work that should have been done once. The Jira archaeology was painful — for example, RPB-12707, lifted verbatim: *"Asset UI in 'Your assets' widget in the homescreen is not matching with the figma."* That's not a bug. That's a system failure.

This case study is the story of how I rebuilt the RockWallet design-to-code pipeline from "Figma file as reference" to "design system as production artifact" — and the strategic pitch I assembled to get the rest of the company on board.

## The problem

The pipeline assumed engineers could *interpret* Figma. Every screen handed off to a developer triggered hundreds of micro-decisions per render: which spacing token, which exact color value, which font weight, which border-radius variable. Each interpretation was a chance to drift. Multiplied across screens, builds, and platforms (web, iOS, Android), drift compounded into UI inconsistency, QA noise, and an endless backlog of "doesn't match the figma" tickets.

The temptation in this situation is to blame execution — to ask engineers to be more careful, or to add a visual QA gate. I rejected both. The shape of the problem said something else: *it's not the team, it's the system.* When the cheapest path through the workflow produces the wrong outcome, no amount of discipline fixes it. You have to change the path.

## My role

I led this initiative end-to-end. As Head of Product Design I owned the strategy, the design-system architecture, the component build, the Figma-to-code mapping pattern, the publishing pipeline, the product-led adoption harness, the docs site, and the executive pitch. I personally publish the `@mnee-ui/ui` npm package, write the components in Tailwind v4 + React, maintain Code Connect mappings, and operate the Vercel-deployed docs site at [mnee-ui.vercel.app](https://mnee-ui.vercel.app/). Where engineering held a dependency (the upstream Tailwind v3 → v4 migration in `merchant-portal-frontend`), I built a product-side fork to dogfood the system without waiting for them.

This was not "design influences engineering." This was *design owns and ships a software product* — the design system — that engineering consumes.

## Approach

The thesis I kept coming back to: **a design system isn't a style guide; it's a contract.** A style guide says *here is the right spacing*. A contract says *the only spacing you can use is the right one*. If the developer has no choice, the drift can't happen. That reframing drove every decision below.

The first move was to make the component the *spec* rather than the reference. I built the system as a real, versioned npm package (`@mnee-ui/ui`), authored in Tailwind v4, with vanilla utility classes and a small set of conventions (`cn()` for class merging, `Record<Variant, string>` for variants — no switch statements, no abstractions that obscure the markup). The repo doubles as the publishing source and a Next.js 15 docs site, so the same artifact a developer installs is the artifact a designer can preview on the web. To date, twelve components are shipped — Button, Badge, Card, Input, Toast, Icons, Banner, Table, Drawer, Modal, Alert, CodeBlock. Each is QA'd by design before it leaves the repo; engineering doesn't QA visuals on first integration because the component is *already correct*.

The second move was to close the Figma-to-code loop with Code Connect. Mapping each Figma component to its code counterpart lets a developer one-click from the Figma node into the exact usage snippet (`<Button variant="primary" size="large">Label</Button>`) with the right props. No searching. No asking. No interpretation. The Figma library file ("ShadCN" in our naming, reflecting the primitive style — though the code uses zero ShadCN runtime) is the source of design truth; the npm package is the code mirror.

The third move addressed the political and structural reality: engineering didn't have the bandwidth to migrate the consuming product (`merchant-portal-frontend`) from Tailwind v3.4.18 to v4, which the design system required. Rather than letting adoption sit blocked, I stood up a product-owned dogfooding harness: a local clone of the portal on a working branch (`tailwind-migration-refund`) upgraded to Tailwind v4.2.3 with a single migration commit. We could now prove the system worked in a real consumer codebase before asking eng to commit to the upgrade upstream. The branch is intentionally not pushed — it's a validation harness, not a PR.

The fourth move was the second pillar of the same model, applied to the broader RockWallet product: **Prometheus**, the design system for RockWallet 2.0. Prometheus today is a pair of Figma libraries (Design System + Icons) with native code mirrors in the wallet apps (`wallet-v2-android/theme`, `wallet-v2-ios/Foundation/RWSystemDesign`). The web implementation is gated on a Phase 2 graduation of components from the **Product Whiteboard** — a frontend-only Next.js 16 PWA I bootstrapped in a single day on April 28, 2026. The Whiteboard lets PMs and designers prototype mobile flows on real iPhones via Add-to-Home-Screen, branch-deploy preview URLs, and mocked data. It's the staging area where components mature before they graduate into a published `@rockwallet/ui` package consumed by native apps via WebView. The four-phase roadmap is: (1) PWB canvas live → (2) first component graduates into `@rockwallet/ui` on npm → (3) native apps consume the package via `WKWebView` / `WebView` → (4) Code Connect + single Figma token pipeline drives web, Android, and iOS from one source.

The fifth move was the executive narrative. I built a 25-slide deck — page 4 of the Design System Initiative Figma file — that walks the C-level audience from the 10-month pain pattern (cover slide: *"One component. 14 tickets."*) through the system reframe, the model, the live proof, and the ask. The deck is the artifact that turns this from "design did some work" into "here is a strategic, measurable shift in how the company ships product."

## Key decisions

- **Design owns publishing.** I publish `@mnee-ui/ui` personally. The team that designs the contract is the team that ships the contract — there's no handoff that can introduce drift.
- **Vanilla Tailwind v4, no ShadCN runtime.** The Figma file is called "ShadCN" because the primitives draw from that vocabulary, but the code uses zero ShadCN dependencies. Simpler. Lighter. Easier to maintain.
- **Skip app-specific components.** The published package explicitly excludes Redux-bound, app-specific components (auth/*, merchant/*, BalanceCard, TransactionRow). Those belong in the app, not the system. The system stays primitive; products compose on top.
- **Code Connect from day one.** Mappings are not a "later" — they're shipped alongside each component. The Figma → code link is what makes the system non-optional.
- **Product-led dogfooding via local v4 fork.** Rather than let eng's bandwidth block adoption proof, I stood up a private validation harness. This kept momentum and removed the "but does it actually work in the portal?" objection from the table.
- **Two design systems, same model.** MNEE UI for MNEE Pay (live, twelve components). Prometheus for RockWallet 2.0 (Figma + native mirrors live, web package gated on PWB graduation). Same playbook, two products.
- **Pitch the model, not the work.** The deck doesn't ask leadership to admire components. It asks them to acknowledge a strategic shift in how the company ships UI, and to remove the one remaining unlock (the Tailwind v4 migration in merchant-portal-frontend).

## Outcome

- **`@mnee-ui/ui` v0.1.1 published**, twelve components live, public docs site at [mnee-ui.vercel.app](https://mnee-ui.vercel.app/), Code Connect mappings wired.
- **Prometheus Figma libraries live** with a documented token namespace (`Color/*`, `Size/*`, `Space/*`, `font-weight/*`, composite styles like `Body/Small`). Native code mirrors in the Android and iOS wallet repos.
- **Product Whiteboard PWA live on Vercel**, installable on iPhone and Android, pull-to-refresh and safe-area handling shipped same-day after first designer feedback. Phase 1 of the four-phase roadmap to a published `@rockwallet/ui` is complete.
- **Quantified claim in the executive pitch:** 80–85% fewer UI rework cycles, validated against the 10-month historical baseline. Same team, same headcount, same headcount — faster by default. The cost of being wrong on a prototype dropped from "weeks of engineering" to "one afternoon."
- **One remaining unlock for full adoption:** the upstream Tailwind v3 → v4 migration in `merchant-portal-frontend`, currently blocked on engineering bandwidth and explicitly framed in the deck as *the only remaining gap*.

## Reflection

The non-obvious lesson was that the design system only works as a *product*. The moment we treated it as a sibling deliverable to the apps that consume it — with a version number, a docs site, a publishing cadence, and an owner — most of the political friction dissolved. The technical work was the easy part. The harder part was building the artifact that lets a CEO see why this is strategic, not aesthetic. The next phase is operationalizing the deck's ask: getting the Tailwind v4 migration onto an engineering roadmap, formalizing design ownership of the system, and graduating the first Prometheus component out of the Whiteboard.

## Links

- Figma — Design System Initiative deck: https://www.figma.com/design/XUqTTB3FcA2NmEEkgxqf53/Design-System-Initiative
- MNEE UI Figma library: https://www.figma.com/design/qzjrgEgx4q7MAU9ypgwp48/ShadCN
- MNEE UI docs: https://mnee-ui.vercel.app/
- MNEE UI npm: `@mnee-ui/ui` v0.1.1
- Prometheus DS Figma: https://www.figma.com/design/vT4esHtsM9b4JdCy2q5Nex/Prometheus-Design-System
- Related wiki: [[design-system/mnee-ui]], [[design-system/prometheus]], [[projects/mnee-ui-adoption]], [[projects/rw-web-prod-canvas]]
