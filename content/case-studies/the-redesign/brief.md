---
title: The Redesign — Modernizing RockWallet Without Losing the Brand
role: Head of Product Design, RockWallet
period: 2025 – 2026
status: shipped
team: Federico Ostan Bazan (design lead), UX Design team, Product, RW2.0 mobile engineering, Marketing, Brand
stack: Figma, Prometheus design system, native iOS + Android, glassmorphic UI patterns, design tokens
sources:
  - wiki:design-system/prometheus.md
  - wiki:projects/rw-web-prod-canvas.md
  - figma:vT4esHtsM9b4JdCy2q5Nex (Prometheus Design System)
  - figma:R94pMAkvOLPDbJZFSVOg8E (Prometheus Icons)
  - confluence:R2 (The New RockWallet space)
related:
  - "[[rockwallet-2-redesign]]"
  - "[[prometheus-design-system]]"
  - "[[design-engineering-transformation]]"
  - "[[everything-is-a-trade]]"
---

# The Redesign — Modernizing RockWallet Without Losing the Brand

## Context

RockWallet 1.0 was a competent wallet. It worked, it was secure, it had a roadmap. What it didn't do was *look like itself in 2026.* The crypto category had matured around it. The competitors that mattered — Coinbase, Robinhood Crypto, the next wave of stablecoin-first wallets — all carried a visual confidence that signalled scale, trust, and money-grade seriousness. RockWallet, by comparison, read as a 2022 fintech app that had aged in place. Same product, same brand, but a UI that quietly undersold what the company had become.

I led a top-to-bottom redesign of the entire product as part of the RW2.0 rebuild. Every surface, every screen, every component. The constraint I set from day one: *we don't relaunch the brand, we re-render it.* Customers needed to recognize the product. Regulators, partners, and the board needed to feel a step change. That tension — continuity for the existing user, transformation for everyone else — was the design problem.

## The problem

Three things were happening at once that made the old UI a liability:

1. **Perceived value was below actual value.** RockWallet had matured into a multi-product platform — wallet, trading, MNEE Pay, custody, regional regulatory work — but the UI still presented like a simple consumer wallet. Sophisticated users were undersold; institutional partners were unimpressed. The aesthetic was capping growth.
2. **The visual language was inconsistent surface-to-surface.** Different generations of features had been added by different teams against drifting Figma references. Spacing, type hierarchy, button treatment, surface elevation — none of it was systematized. The product looked like it had been built in pieces, because it had been.
3. **The category had moved.** Glassmorphism, soft surfaces with deliberate light handling, restrained color, high-contrast type, and confident negative space — these had become the visual vocabulary of premium fintech and crypto. Standing still meant looking dated.

## My role

I led the redesign end-to-end as Head of Product Design. I owned the visual direction, the brand-continuity framework, the surface system, the typography stack, the color and contrast strategy, every component in Prometheus, and the screen-by-screen application across the RW2.0 product. I co-designed with the rest of the UX team where individual flow specialists owned subareas, but the language — the rules that make every screen look like a RockWallet screen — is mine. I also defended the redesign at every executive review, partnered with Marketing to land the visual story in launch communications, and ran the rollout slowly enough that nothing felt like a brand discontinuity to existing users.

Engineering owned implementation. I sat with iOS and Android leads through token adoption and motion behavior. The design system pipeline I built in parallel (see [[design-engineering-transformation]] and [[prometheus-design-system]]) is what made the redesign physically possible at this scale — without a token system and a published component vocabulary, this work would have shipped inconsistently or not at all.

## Approach

The strategic frame was simple: **keep the brand, raise the floor.** Logo, primary palette, name, voice — untouched. Everything below the brand line — type system, surfaces, components, motion, density, contrast posture — rebuilt from zero against a new visual thesis.

The thesis had three pillars.

**One: darker, by design.** The 1.0 product defaulted to a mid-tone background that felt neither light nor dark — characteristic of fintech apps optimized for the screenshot store. I moved the default to a deep, near-black background with carefully tuned warm undertones. Dark mode wasn't a setting; it became the canonical experience. Light mode was redesigned later as a derivative, not a peer. The rationale was perceptual and commercial in equal measure: darker backgrounds read more expensive, more serious, more "money on the table." They also make every color overlay more legible, which mattered for the third pillar.

**Two: glassmorphism, applied with restraint.** I introduced a frosted-surface system — translucent cards, blurred backdrops, subtle inner highlights — but resisted the trap of decorating with it. Glass surfaces are reserved for elements that should feel suspended: action sheets, modals, the trade confirmation surface, the balance card on the home dashboard. Inline components (rows, list items, inputs) stayed solid. The result is hierarchy without chrome: the eye knows which surfaces are interactive and which are structural without ever being told. Done well, glassmorphism is a depth language, not a style.

**Three: high contrast, against the dark.** With the background dark, I designed the type system to sit confidently on top of it — high-contrast white for primary text, deliberate grayscale steps for hierarchy, and a single saturated brand accent for action. No softened greens, no muted CTAs. The brand color reads brighter against the new background than it ever did against the old, so it now does its actual job: directing attention. Numbers — balances, prices, deltas — are typeset in a tabular variant of the system face so they align column-to-column at a glance. Money should *look like money.*

The fourth, less visible pillar was that I used the redesign as cover to improve every flow underneath it. When you're already rebuilding the surface, fixing the funnel costs almost nothing extra. So I shipped: a routed KYC onboarding ([[onboarding-redesign]]), a unified trade architecture ([[everything-is-a-trade]]), a reworked asset model ([[asset-categories]]), a gamified levels system ([[gamification-levels]]), and the geofencing model for regional restriction ([[geofencing]]). The redesign isn't only "RW1 looks different now." It's "every flow you do every day now works the way it should have worked from the start."

The rollout was deliberately conservative. Existing users moved over in cohorts. Push notifications and in-app prompts framed it as a refresh, not a relaunch. Marketing landed the visual story in App Store screenshots, press placements, and the affiliate program around the public launch ([[rockwallet-2-redesign]]). Nobody woke up to a new product they didn't recognize.

## Key decisions

- **Brand untouched, system rebuilt.** Logo and primary palette stayed. The visual rebuild happened underneath the brand line, not on top of it. This is what let the redesign feel like the same RockWallet that customers already trusted, while everything else about the experience changed.
- **Dark-by-default, not dark-as-mode.** Light mode is now the alternate, not the canonical view. This was a perception bet: dark UI reads more premium in the crypto category and gives glassmorphism the canvas it needs to work.
- **Glassmorphism as a depth language, not a decoration.** Frosted surfaces are reserved for elements that should feel elevated. Inline components stay solid. The rule keeps the system from descending into Y2K nostalgia.
- **One saturated accent, used sparingly.** A single brand accent does all the heavy lifting for action. The redesign explicitly does not multi-color CTAs by feature; that pattern erodes brand and confuses hierarchy.
- **Tabular numerics everywhere money is shown.** Balances, prices, deltas, and percentages use a tabular variant of the system face so columns align without manual adjustment.
- **Ship the redesign and the flow improvements together.** The redesign was the political cover to fix what the old flows couldn't easily get budget for. Onboarding, trade architecture, asset categories, levels, geofencing — all rebuilt in parallel.
- **Cohort rollout, not big-bang.** Existing users moved into the new product in waves. Marketing framed it as a refresh. The strategic message was continuity; the actual delivery was transformation.

## Outcome

- **Every surface of the RW2.0 retail product is now on the new visual system.** Onboarding, dashboard, asset details, trade flows, transaction history, settings, MNEE merchandising — all rendered against Prometheus tokens.
- **Perceived value moved.** Partner conversations and qualitative reviews after the redesign read materially differently — the product is now described in terms of "premium," "polished," "serious," language the 1.0 product rarely earned.
- **Brand continuity held.** Users recognized the new product as RockWallet. No measurable confusion at the brand level on launch.
- **Five major flow rebuilds shipped under the redesign umbrella** that would have been hard to fund individually: onboarding routing, the unified trade architecture, the asset/category model, the levels system, and the geofencing framework.
- **The system is reusable.** Because the redesign was systematized into Prometheus rather than painted by hand, every new screen RockWallet ships from here onward inherits the visual language for free.

## Reflection

The strongest move in this project was refusing to relaunch the brand. The redesign would have been less ambitious to defend — a clean break, a new logo, a press cycle — but it would have cost the company the trust it had spent years building. The harder version, where everything below the brand line changes and the brand stays, is the version that actually lifts the product without breaking the customer relationship.

The thing I'd do differently is invest earlier in the motion language. The static system is strong; the motion grammar around it (how surfaces enter, how glass reveals, how the trade confirmation animates) lagged the rest of the work and got finalized later than it should have. Motion is where premium products feel premium. Next iteration starts there.

## Links

- Prometheus Design System (Figma): https://www.figma.com/design/vT4esHtsM9b4JdCy2q5Nex/Prometheus-Design-System
- Prometheus Icons (Figma): https://www.figma.com/design/R94pMAkvOLPDbJZFSVOg8E/Prometheus-Icons
- Related case studies: [[rockwallet-2-redesign]], [[prometheus-design-system]], [[design-engineering-transformation]], [[everything-is-a-trade]], [[onboarding-redesign]], [[asset-categories]], [[gamification-levels]], [[geofencing]]
- Related wiki: [[design-system/prometheus]], [[projects/rw-web-prod-canvas]]
