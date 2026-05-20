---
title: Analysis Widget
role: Head of Product Design, RockWallet
period: 2026-02 – present
status: in-flight (Direction 1 V1 in active design; persona gating + regulatory review committed before V1 ships)
team: Design (myself + collaborators Sandra and Taryn on competitive research), Product, Compliance, Engineering
stack: Figma, CoinMarketCap (price action data), wallet holdings data, RockWallet personas (Crypto Curious "Rebecca", Crypto Convert)
sources:
  - asana:1213748723380860 — Analysis Widget Roadmap
  - asana:1212811778883574 — Portfolio Analysis Widgets (kickoff)
  - asana:1212018544600963 — Analysis Widgets Planning
  - asana:1213748793590301 — Top Movers widget (V1)
  - asana:1213748793652943 — Trending Swaps widget (V1)
  - asana:1213246114768931 — Recent Transactions on Home Page (related widget pattern)
---

# Analysis Widget

## Context

The Analysis Widget started as a research question from competitive review: how do other crypto platforms (Coinbase, Robinhood, Crypto.com, Cash App) tell a user something about *the state of their portfolio* — whether they're more of a risk-taker, what's moving, what's trending — without giving investment advice? The kickoff task is explicit about that framing (source: asana:1212811778883574, "research how other platforms display the 'state' of your platform — whether you're more of a risk taker or not, navigating your portfolio").

This is genuinely hard in our context. RockWallet's primary persona is "Rebecca" — the Crypto Curious user, often new, often unsure, often timid. The exact user we should *not* be nudging toward speculative behavior. But she's also the user who needs the most context to feel confident — "what should I look at?" "what are people doing?" "is this normal?" The widget is the design surface where we try to give her that context without turning the app into a casino.

Sandra and Taryn ran the competitive research in February 2026. Out of that came a roadmap (asana:1213748723380860) with a clear "Direction 1" thesis: holdings-personalized, persona-gated, no global discovery, no investment-advice framing. Two V1 widgets — Top Movers and Trending Swaps — and an explicit commitment to scale review and regulatory review before either ships.

## The problem

The widget surface had to navigate three constraints simultaneously:

1. **Regulatory.** We are a US-licensed, KYC'd, compliance-first platform. Anything that reads as "tip" or "recommendation" or "trending stock" is a problem. "Sell signal" copy is a problem. Streaks, gamified discovery, FOMO loops are problems (this is the same constraint that drove the [[gamification-levels]] decision to drop streaks).
2. **Persona-fit.** Rebecca needs context. The Crypto Convert (the more advanced persona) wants signal. The widget has to serve both without giving Rebecca more rope than she should have.
3. **Editorial integrity.** "Trending" needs a definition. "Most bought" needs a definition. If the user taps and asks "why is this trending?" the answer can't be a black box.

The default version of this widget — the one every competitor ships — fails all three.

## My role

Head of Product Design. I worked with Sandra and Taryn on the upstream research and competitive landscape, then took ownership of the design system for the widget family (shared anatomy, dismissibility, info-tooltip patterns, persona gating logic) and the editorial rules that govern what each widget is allowed to say. I also drove the debate-and-decision process that escalated the persona gating, the V2 editorial layer, and the regulatory review trigger into roadmap commitments rather than nice-to-haves.

## Approach

I structured the work around three design moves:

**Holdings-personalized, not global.** Top Movers V1 shows the fastest price action *among assets the user already holds* — not the global crypto market. Trending Swaps V1 shows pairs relevant to the user's holdings, not global volume leaders. This is the single most important call. It eliminates the "Bitcoin is up 12% today — buy now!" failure mode by construction: if the user doesn't hold a thing, we don't surface it. The widget exists to help users *understand what they already own*, not to discover new assets to gamble on (source: asana:1213748793590301, "Holdings-only V1 — no global movers, no discovery surface, no regulatory exposure").

**Persona gating, not feature flags.** Trending Swaps V1 is gated to the Crypto Convert persona only. The Crypto Curious user (Rebecca) never sees V1 — she sees Top Movers (with conditional rendering: at least 3 assets held before it appears, which acts as a natural gate without needing an engineering rule). This was a hard call because gating by persona creates two product surfaces, but the alternative is making the same widget safe for Rebecca *and* useful for the Crypto Convert simultaneously, which is the kind of constraint that produces a widget that's bad at both jobs (source: asana:1213748793652943).

**Editorial layer committed before V1 ships, not after.** "Trending" needs a definition on the card itself ("Trending = highest swap volume in the last 24h"). "Most bought" / "most sold" need friction tooltips that explicitly disclaim investment advice ("Selling activity across RockWallet users in the last 24h. This is not investment advice."). V2 has an editorial reasons layer + news feed integration — and that V2 work has to be *committed to the roadmap* before V1 ships, not deferred to a wishlist (source: asana:1213748793652943, "V2 context layer (editorial reasons + news feed integration) must be committed to the roadmap before V1 ships").

A small but load-bearing call on CTAs: Trending Swaps V1 has a "View pair" CTA only — *not* "Swap now." The difference is the entire user-research thesis. "View pair" routes to the Asset Details page where the user gets context, market stats, and trade actions in the proper frame. "Swap now" routes directly into a Swap flow with the pair pre-selected, which is the casino move.

Sizing was debated: Top Movers was upsized from XS to S based on debate review (the gating + editorial requirements added scope). Trending Swaps went from S to S–M for similar reasons. I tracked the sizing notes directly in the Asana task descriptions so the engineering team can see the rationale rather than just the final number.

## Key decisions

- **Holdings-personalized V1, not global.** No discovery surface. No regulatory exposure.
- **Top Movers ungated; Trending Swaps Crypto-Convert-only.** Persona gating is real, not a feature flag.
- **3-asset conditional render on Top Movers.** Natural gate for Rebecca; she has to hold a few things before she even sees the widget.
- **3 sortable views on Top Movers: fastest price action / most bought / most sold.** Each has a friction tooltip.
- **Friction tooltip on "most sold" explicitly disclaims investment advice.**
- **Definition of "trending" lives on the card, not in a help doc.**
- **"View pair" CTA only on Trending Swaps V1. No "Swap now."**
- **V2 editorial layer (reasons + news feed) is a *roadmap commitment*, not a wishlist.**
- **Dismissible widgets.** Rebecca can opt out without admin intervention.
- **Scale review trigger documented in the design brief.** Behaviors change at scale; we want a tripwire.
- **Sizing decisions tracked in task descriptions, not lost in Slack.**

## Outcome

V1 design is in flight for both widgets. The roadmap commits to the V2 editorial layer before V1 ships. The persona gating, conditional render, and editorial constraints are documented in the Asana task notes (asana:1213748793590301, 1213748793652943) so engineering and QA can verify against them.

This widget family will feed back into the broader RW 2.0 Home Page work — alongside the Recent Transactions home widget (asana:1213246114768931) — as part of the "what does Rebecca see when she opens the app?" surface.

## Reflection

The thing this project taught me: the most valuable design work on a regulated product is often the work of *removing* features that look harmless. "Trending swaps" looks like a feature. With the wrong default ("global pairs by volume", "Swap now" CTA, no definition on the card, no persona gating, no V2 editorial commitment), it becomes a regulatory and ethical liability. Every decision above is a removal of a default, and every removal had to be argued.

What I'd do differently: I'd have brought compliance into the design conversation in week 1, not at the regulatory-review checkpoint. The constraints would have shaped the first sketches instead of getting bolted on.

What I'm proud of: this widget will ship without a single FOMO loop, no investment advice framing, holdings-personalized only, and Rebecca will see a version that's actively safer than what she'd find on any competing platform. That's the bar.

## Links

- Asana (Roadmap): https://app.asana.com/1/1203889043133244/project/1213748723380860
- Asana (Top Movers): https://app.asana.com/1/1203889043133244/project/1213748723380860/task/1213748793590301
- Asana (Trending Swaps): https://app.asana.com/1/1203889043133244/project/1213748723380860/task/1213748793652943
- Related wiki: [[products/rockwallet-2.0-mobile]]
