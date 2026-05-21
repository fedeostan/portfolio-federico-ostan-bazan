---
title: Prometheus — RockWallet's Design System Foundation
role: Head of Product Design, RockWallet
period: 2025-Q4 – present
status: in-flight
team: Federico Ostan Bazan (design + ownership), RockWallet UX team, native mobile engineering (Android + iOS), web engineering (future @rockwallet/ui consumers)
stack: Figma (Variables + Code Connect), Jetpack Compose, SwiftUI, Tailwind v4, Next.js 16, Vercel, planned npm package @rockwallet/ui
sources:
  - wiki:design-system/prometheus
  - wiki:projects/rw-web-prod-canvas
  - wiki:repos/rw-web-prod
  - figma:vT4esHtsM9b4JdCy2q5Nex
  - figma:R94pMAkvOLPDbJZFSVOg8E
  - https://github.com/ostanfederico/rw-web-prod
---

# Prometheus — RockWallet's Design System Foundation

## Context

RockWallet ships native iOS and Android wallets plus a growing set of web surfaces. For years the visual language lived in designers' heads and a few drift-prone Figma files. As the team scaled and RockWallet 2.0 came into view, that informal model started costing real money — every cross-platform feature began with rediscovering tokens, redrawing the same button, and arguing about spacing. We needed a design system that was authoritative in Figma, mirrored faithfully in native code, and ready to expand to the web.

Prometheus is that system. It currently exists as a pair of Figma libraries with first-class token variables, with native code mirrors in the wallet apps and a deliberately staged plan for the web layer. The companion initiative — the Product Whiteboard (PWB) canvas — is where the future web components will be born before they graduate into a published `@rockwallet/ui` npm package.

## The problem

A design system isn't a Figma file; it's a contract. The Prometheus contract has to hold across four platforms (Figma, Android, iOS, web) and survive product velocity. The specific problems I was trying to solve:

1. **No single source of truth.** Tokens lived in code on Android and iOS but were re-keyed by hand into Figma. Drift was constant.
2. **No web implementation.** The web surfaces were ad-hoc, often borrowing styles from whichever native app the engineer had open last.
3. **No place to *try* components before committing.** Designers had nowhere to test a new pattern on an actual phone, in actual fingers, before asking native engineering to build it.
4. **No clear path from Figma to code.** Code Connect existed in theory; no one had wired it.

## My role

I own Prometheus end-to-end as Head of Product Design. Concretely:

- I author and maintain the Prometheus Design System and Prometheus Icons Figma libraries (wiki:design-system/prometheus).
- I defined the token namespace — `Color/*`, `Size/*`, `Space/*`, `font-weight/*`, `letter-space/*`, composite text styles — and verified it via the Figma MCP `get_variable_defs` API.
- I shaped the native code mirrors: the Android `wallet-v2-android/theme` Compose tokens (`Color.kt`, `Spacing.kt`, `FontSize.kt`, `AppTheme.kt`) and the iOS `RWSystemDesign` foundation.
- I scoped, built, and shipped the Product Whiteboard PWA (`rw-web-prod`) as the staging ground for the future web layer.
- I drafted the four-phase roadmap that ends with a published `@rockwallet/ui` package and Code Connect mappings across all platforms.

Engineering owns the native consumer apps and will own `@rockwallet/ui` once it ships. Everything upstream of that — the Figma libraries, the token system, the PWB canvas, the roadmap — is mine.

## Approach

I started with the tokens because tokens compose. Color first, then Space, then Size, then font weight and letter spacing. I refused composite text styles until the primitives were stable, and I refused components until composite styles were stable. The order matters: every component change you make before tokens are settled costs you twice.

Second, I drew the cross-platform map honestly. Android and iOS already had token files. Rather than overwrite them, I treated them as code mirrors of the Figma library — the Figma is canonical, the native files conform. For web I made the harder call: don't even *try* to mirror until there's a real React surface that can prove the tokens work in CSS. Until that exists, the PWB canvas seeds `styles/tokens.css` from the Android values as a temporary bridge (wiki:repos/rw-web-prod).

Third, I built the Product Whiteboard canvas — a frontend-only Next.js 16 PWA on Tailwind v4 that lives at a public Vercel URL. The whole point is that designers can push a branch, get a preview URL, install it on their phone via Add-to-Home-Screen, and iterate on a real device. No real APIs, no auth, no tests, no backend — those would all be distractions. Just an installable canvas with mocked data and empty slots for flows and components (wiki:projects/rw-web-prod-canvas).

Fourth, I wrote down the graduation criterion. A component "graduates" into `@rockwallet/ui` only after it's been used in two or more flows inside the canvas. This is the rule that prevents `@rockwallet/ui` from becoming yet another graveyard of speculative components.

Fifth, I deliberately separated the design-system arc from the MNEE UI arc. Prometheus is the long-term RockWallet system. MNEE UI is its own product (wiki:design-system/mnee-ui). They share patterns (Tailwind v4, `cn()`, variant records, Federico publishes) but they are not the same library and they are not on the same release train. Conflating them would have slowed both.

## Key decisions

- **Figma is canonical.** Variables in the Prometheus DS file are the source of truth; native and web token files are mirrors. This is enforced by review, not by tooling, and that's fine for now.
- **Build the canvas before the npm package.** I refused to start `@rockwallet/ui` until we had a place to incubate components on real phones. The order is: canvas → component used in 2+ flows → graduate to npm → native apps consume via WebView.
- **Dark-only, English-only, no real APIs in the canvas.** Hard scope rules. Every time a designer asked for "just a login screen" I pointed at the rules doc (wiki:projects/rw-web-prod-canvas).
- **Vercel branch previews as the install loop.** Every `flow/<name>` or `component/<name>` branch gets its own preview URL and QR code. The PR label `ready-for-ds` is the signal to graduate.
- **CSS variables, never hardcoded hex.** Enforced in the canvas's CLAUDE.md. Tokens come from `styles/tokens.css`, full stop.
- **Code Connect deferred to Phase 4.** I want it, but I won't gate component delivery on it. Phase 4 is when the bidirectional mapping between the Prometheus Figma files and `@rockwallet/ui` becomes real.
- **Native WebView is the long-term distribution path.** Phase 3 of the roadmap installs `@rockwallet/ui` inside native iOS `WKWebView` and Android `WebView`, so the web layer becomes a shared rendering surface for the wallet apps without a full RN/Compose rewrite.

## Outcome

- Two Prometheus Figma libraries live and in active use: Prometheus Design System (`vT4esHtsM9b4JdCy2q5Nex`) and Prometheus Icons (`R94pMAkvOLPDbJZFSVOg8E`).
- Verified token namespace: `Color/*`, `Size/*`, `Space/*`, `font-weight/*`, `letter-space/*`, plus composite text styles like `Body/Small` — confirmed via Figma MCP (wiki:design-system/prometheus).
- Native code mirrors live on Android (`wallet-v2-android/theme`, Jetpack Compose) and iOS (`RockWallet/Foundation/RWSystemDesign`, SwiftUI).
- Product Whiteboard PWA shipped in a single day on 2026-04-28: Next.js 16, React 19, Tailwind v4, dark-only, installable on iOS Safari and Android Chrome, pull-to-refresh and safe-area padding added the same day after the first phone install.
- Four-phase roadmap documented in `docs/ROADMAP.md`: PWB canvas → seed `@rockwallet/ui` → native WebView consumption → Code Connect across platforms.
- `@rockwallet/ui` repo not yet started — intentionally gated on a component reaching the 2+ flows bar.

## Reflection

The hardest part of this project was *not* shipping `@rockwallet/ui` on day one. Every instinct said to start the package, push a Button, and call it a system. I held the line because I've seen what happens to design-system repos that exist before there's anywhere to use them — they ossify around the first decision, and the first decision is almost always wrong.

The PWB canvas is the bet that pays off here. By making it cheap and fast for designers to put components on real phones, the system stays honest. Components graduate because they've earned it, not because someone needed them in a sprint.

What I'd do differently: I would have set up the Figma → token JSON pipeline earlier. Mirroring tokens by hand from Android into the canvas was the right call for a week-one bridge, but it's a fragile bridge and I'm carrying it longer than I'd like.

## Links

- Prometheus DS Figma: https://www.figma.com/design/vT4esHtsM9b4JdCy2q5Nex/Prometheus-Design-System
- Prometheus Icons Figma: https://www.figma.com/design/R94pMAkvOLPDbJZFSVOg8E/Prometheus-Icons
- PWB canvas repo: https://github.com/ostanfederico/rw-web-prod
- PWB production: https://rw-web-prod-federico-ostan-bazans-projects.vercel.app
- Related wiki: [[design-system/prometheus]], [[projects/rw-web-prod-canvas]], [[repos/rw-web-prod]], [[design-system/mnee-ui]]
