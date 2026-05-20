---
title: Reorganizing the Asset & Transaction Categories
role: Head of Product Design, RockWallet
period: 2025-07 – present
status: in-flight (Full Asset Details + Balance Widget shipping in S12; Multiple-Network token UI shipping with Token Roadmap)
team: Design (myself + Inna Posokhova), Product (Alex Straus, Megan Conard), Engineering (iOS + Android + BE), Compliance, Token Partnerships
stack: Figma, CoinMarketCap (price + stats feed), Fireblocks (wallet infra), token kits (per-asset content)
sources:
  - confluence:R2/ASSET+DETAILS+PRD+Full+Asset+Details+Page (id 3704324097)
  - confluence:R2/Portfolio+PRD+Asset+List+-+Tokens+in+your+Portfolio (id 3556933657)
  - confluence:R2/Portfolio+PRD+Asset+List+of+Tokens+not+in+Portfolio (id 3556474928)
  - confluence:R2/Token+Kit+Template (id 3509321790)
  - confluence:R2/BTC+Token+Kit (id 3538255899)
  - confluence:R2/BSV+Token+Kit (id 3509911569)
  - confluence:R2/XRP+Token+Kit (id 3723821079)
  - confluence:R2/LTC+Token+Kit (id 3729555457)
  - confluence:R2/User+Story+2+Navigate+to+Asset+Detail+Page (id 3560800362)
  - confluence:R2/User+Story+3+Navigate+to+Asset+Detail+Page (id 3560308747)
  - confluence:R2/RockWallet+Mobile+App+2.0+-+Business+Architecture_v2.0 (id 3792273418)
  - confluence:OP/Flow+of+Funds+Training+Guide (id 3613556755)
  - asana:1213334258119925 — "Full Asset Details Page"
  - asana:1213246114768943 — "Asset Details Balance Widget"
  - asana:1214351417490629 — "Buy/Swap/Sell Quick Action Buttons on Asset Detail Page"
  - asana:1213334258119908 — "Multiple Network Token Selection"
  - asana:1212811778883491 — "Add search to token selection drawer"
  - asana:1212811778883781 — "Merchandising MNEE Token (When selecting USDC)"
---

# Reorganizing the Asset & Transaction Categories

## Context

When I came to the asset taxonomy work in mid-2025, RockWallet's wallet UI had inherited a structure from the 1.0 codebase that didn't survive contact with the 2.0 product. Three forces were pulling on it at once:

1. **The token list was growing.** We were moving from a handful of legacy assets (BTC, BSV, LTC, XRP, ETH, USDC) into MNEE as a first-party stablecoin and a roadmap of additional ERC-20 tokens. Each new token raised the same question: where does it belong, how do we describe it, how do users distinguish it from the others?
2. **Multi-network was no longer optional.** MNEE itself lives on two networks (ERC-20 and 1Sat Ordinals on BSV). USDC lives on multiple chains. A "USDC" row in a list is a lie — it's actually three or four different assets sharing a ticker.
3. **Transaction types were diverging from "Send / Receive."** RW 2.0 introduced Buy (Card), Buy (ACH), Sell (ACH), Swap, internal portfolio transfers, and Tap-to-Pay. The Operator Portal had a clean taxonomy (source: confluence:3613556755, Flow of Funds Training Guide). The user app did not.

The asset and transaction taxonomy was no longer a list — it was the spine of how a user understands what they own, what they did, and what they can do next.

## The problem

The legacy model treated assets as a flat list and transactions as a chronological feed. That worked when there were six tokens and three actions. It broke when:

- A user owned MNEE on both Ethereum and BSV and saw a single "MNEE" balance that didn't reconcile against either chain.
- A user wanted to send BSV but the "Send" tile was disabled because their geo restricted ACH — and they couldn't tell whether the problem was the asset or the action.
- A token kit (the per-asset content unit — name, ticker, category, utility, brand, about copy, social links) existed for some tokens and not others, so the Asset Details page felt half-built.
- A user reading their transaction history couldn't distinguish a Buy (Card) from a Buy (ACH) — both said "Buy" but had wildly different settlement times, custody states, and support paths.

The compounding issue: every team was solving its own slice. The trade team treated Buy/Sell/Swap as flows. The portfolio team treated assets as rows. The token-onboarding team produced token kits in isolation. Nothing was load-bearing across all three.

## My role

Head of Product Design. I owned the cross-cutting taxonomy — the rules for how an asset is described, where its categorization lives, how multi-network ownership is shown, how transaction types are labeled and filtered, and how the Asset Details Page becomes the single source of truth for everything a user needs to know about an asset they own (or might).

I was not the PM on any single PRD inside this — Alex Straus owned the Asset Details PRD (source: confluence:3704324097) and Megan Conard owned much of the trade flow. My job was the connective tissue: the Token Kit template, the Asset Details template, the multi-network breakdown, the Transaction Activity taxonomy, and the patterns Inna would then design against.

## Approach

I started with the Token Kit template (confluence:3509321790) because it's the upstream artifact — if every supported token has a structured kit with the same fields (Name, Ticker, Blockchain(s), Contract Address(es), Decimals, Token Standard, Launch Date, Status on RockWallet, **Category**, Utility, About, Brand, Logo), then every downstream surface (Asset Details, Buy list, Swap-to drawer, Receive screen) can be generated from the same data. We populated this for BTC ("Layer 1 / UTXO / Digital Gold"), BSV, XRP, LTC, MNEE, and the ERC-20 tokens, and made it a required artifact for any new token going forward.

From there I worked down to the Asset Details Page (the most concentrated surface — every taxonomy decision shows up on it). Inna and I structured it as two states with one shared shell: **Held** (balance widget, average buy price, transaction history scoped to this asset, paymail for BSV) and **Not Held** (chart, About, market stats, CTAs only). The shell — sticky action buttons (Buy/Swap/Sell), glassmorphic header, shimmer loading — is identical. The decision to make Held/Not-Held a state on the same page rather than two pages was deliberate; it preserves the user's mental model when they go from "thinking about buying" to "owning it."

The hardest single problem was multi-network. I rejected the first pass, which had MNEE-on-ETH and MNEE-on-BSV as separate rows in the portfolio. That makes them look like different assets. Instead, on the Asset Details page for MNEE, the Balance widget expands to break down the *same* total balance across networks. The user sees "MNEE: $X total → Ethereum: $Y, BSV: $Z." For the Buy flow, we kept the simpler list pattern at MVP and added a confirm step ("which network?") after selection — a compromise that lets us ship without over-designing the buy list (source: asana:1213334258119908).

For transactions, I aligned the user-facing taxonomy to the Operator Portal taxonomy (Send, Store, Receive, Buy-Card, Buy-ACH, Swap, Sell-ACH). Same words, same filters, same definitions across customer app and support tooling. This is unglamorous infrastructure work — but the cost of *not* doing it is every support ticket starting with "what kind of transaction is this?"

A small but load-bearing call: I added MNEE merchandising as a layer *on top of* the taxonomy, not inside it. When a user selects USDC in Buy or Swap, we surface a drawer offering MNEE instead (lower fees, faster settlement). MNEE doesn't replace USDC in the category — both are listed as stablecoins — but the system gets to nudge (source: asana:1212811778883781).

## Key decisions

- **Token Kit as the source-of-truth artifact.** Every supported token has one. Every downstream surface reads from it. No surface invents its own copy.
- **Asset Details = Held / Not-Held on one page, not two.** Continuity of mental model from intent to ownership.
- **Multi-network shown by *expanding the balance widget*, not by adding rows to the portfolio.** One asset, one identity, with sub-network breakdown when relevant.
- **Buy list keeps the flat pattern at MVP; confirm network *after* selection.** Trade complexity vs ship-ability — we'll revisit when more multi-network tokens land.
- **Customer-app transaction types = Operator Portal transaction types.** Same labels, same filters. Reduces support friction.
- **Quick-Action buttons (Buy/Swap/Sell) sticky and asset-scoped.** The action travels with the asset context, so the user never has to re-select the token in the next flow. (The pre-selection got descoped for MVP — see asana:1214351417490629 — but the pattern stays.)
- **Search in the token-selection drawer descoped for MVP.** Compromise call: the list is short enough today (asana:1212811778883491). Revisit when token count crosses ~15.
- **MNEE merchandising lives in the *flow*, not the *taxonomy*.** Don't pollute the category structure with marketing logic.
- **Asset categories live in the Token Kit (e.g., BTC = "Layer 1 / UTXO / Digital Gold"), surfaced on the Asset Details Stats panel.** Categories are descriptive (what is this token?), not navigational (don't try to filter portfolio by category at MVP).

## Outcome

Shipping with RW 2.0 MVP:

- Asset Details Page with Held and Not-Held states, sticky Buy/Swap/Sell CTAs, balance widget with average buy price, asset-scoped transaction history, About + Stats + Learn-More sections (source: asana:1213334258119925, S12 sprint).
- Balance Widget as a standalone shippable unit (asana:1213246114768943).
- Token Kits populated and live for the MVP token set; template adopted for future onboarding (confluence:3509321790).
- Multi-network MNEE balance breakdown on Asset Details (asana:1213334258119908).
- Aligned transaction taxonomy between customer app, Recent Transactions home widget, full Activity screen, and Operator Portal.

Several pieces are explicitly Post-MVP and documented: per-portfolio balance widgets, portfolio allocation, advanced charting, token announcements/community widgets, asset-specific price notifications, and the CMS that will eventually drive Learn-More content.

## Reflection

Taxonomy work is invisible when it goes well and disastrous when it doesn't. The biggest risk I ran was over-engineering the multi-network case before we had enough multi-network tokens to learn from — I had to keep dialing back the design to "the simplest thing that survives the next two tokens we add" rather than "the most elegant thing that survives ten."

The thing I wish I'd done sooner: I should have written the cross-team taxonomy doc (Token Kit fields, transaction types, category vocabulary) *before* the first Asset Details PRD, not in parallel with it. We re-litigated the same naming questions in three different PRDs because the upstream artifact didn't exist yet. Lesson logged.

The thing I'm proud of: a designer joining the team six months from now can read a Token Kit, read the Asset Details PRD, and know what every screen for a new token should look like without asking anyone. That's the win.

## Links

- Confluence: https://bayes.atlassian.net/wiki/spaces/R2/pages/3704324097/ASSET+DETAILS+PRD+Full+Asset+Details+Page
- Confluence: https://bayes.atlassian.net/wiki/spaces/R2/pages/3509321790/Token+Kit+Template
- Confluence: https://bayes.atlassian.net/wiki/spaces/R2/pages/3556933657/Portfolio+PRD+Asset+List+-+Tokens+in+your+Portfolio
- Confluence: https://bayes.atlassian.net/wiki/spaces/OP/pages/3613556755/Flow+of+Funds+Training+Guide
- Asana: https://app.asana.com/1/1203889043133244/project/1212811778883422/task/1213334258119925
- Asana: https://app.asana.com/1/1203889043133244/project/1212811792578884/task/1213334258119908
- Related wiki: [[products/rockwallet-2.0-mobile]], [[domain/mnee]], [[design-system/prometheus]]
