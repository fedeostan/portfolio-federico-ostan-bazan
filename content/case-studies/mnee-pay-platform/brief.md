---
title: "MNEE Pay: Stablecoin Payments Platform"
role: Head of Product Design, RockWallet
period: 2024-12 – present
status: in-flight (MVP rolling out by phase; MNEE token live since July 2024)
team: Design (myself + collaborators), Product (Megan Conard, Ron Tarter), Solution Architecture, Compliance, Engineering (BE + iOS + Android + Merchant Portal FE)
stack: Figma, Fireblocks, MPC/SSS custody (2-of-3 Shamir), WebAuthn/Passkeys, Stripe (gateway reference), POS partners (Clover/Square/Toast/PAX/Verifone — roadmap), 1Sat Ordinals + ERC-20, CRB (US off-ramp), Borderless (international off-ramp)
sources:
  - confluence:MPP/High+Level+Requirements (id 4164812817)
  - confluence:MPP/User+Story+4+Profile+Settings+Page (id 4551278605)
  - asana:1212198821861316 — MASTER_MNEE-PAY Project Plan
  - asana:1212613721080544 — MNEE Pay - Product Roadmap
  - asana:1212198632958692 — MVP 1 — MNEE Pay Sprint 1
  - asana:1212659651109350 — Passkey Authentication (Login)
  - asana:1212659654733442 — QR Payments: Phase 1 (Static)
  - asana:1213483987507867 — QR Payments: Phase 2 (Dynamic)
  - asana:1212659654733371 — Yield Rewards within MNEE Pay (Phase 1)
  - asana:1212659654733383 — SSS Wallet Support for MNEE Pay
  - asana:1212695566608782 — Receipt: Consumer receives receipt from MNEE Pay
  - asana:1212990381723679 — PRD: Refunds within the app
  - asana:1212659651109354 — Swap & Send Integration
  - asana:1212262080713961 — Competitive Analysis: Business Accounts in Crypto
  - asana:1212659654733375 — Merchant Account Level Gamification
---

# MNEE Pay: Stablecoin Payments Platform

## Context

MNEE Pay is RockWallet's stablecoin payments platform — a merchant-facing product that lets businesses accept any major stablecoin on any major chain and settle in a single normalized asset: MNEE, our own USD-backed stablecoin. The thesis is simple to state and hard to build: legacy card networks (Visa, Mastercard, the interchange tax, the chargeback regime, the PCI overhead) are an aging settlement rail, and stablecoins are the next one. MNEE Pay positions us not as a "crypto payment processor" sitting on the side of the real payments stack, but as a new settlement rail that intends to coexist with — and over time replace — that stack (source: confluence:4164812817, "It is a new global settlement rail designed to coexist with—and eventually replace—legacy card networks").

The MNEE token itself has been in circulation since July 2024, lives on ERC-20 and 1Sat Ordinals, is fully 1:1 backed by US Treasuries and cash, issued under a Delaware money transmitter license, GENIUS Act compliant, and attested monthly by Wolfe & Co. (source: asana:1212262080713961). As of late 2025 there was roughly $100M of MNEE in circulation. The platform's commercial moat is a 0.99% merchant fee with no chargebacks, no PCI overhead, optional auto-conversion to fiat via CRB (US) or Borderless (international), and yield on held MNEE.

I joined this work as Head of Product Design when MNEE Pay moved from "the token" to "the platform" — when the question changed from "is the stablecoin real?" to "what does the merchant actually see, click, and trust?"

## The problem

A stablecoin payments platform has three completely different users and three completely different interfaces:

1. **The merchant** — needs to integrate MNEE Pay into an existing tech stack (Stripe gateway, Clover POS, online checkout, retail QR code) with as little engineering work as possible. The MNEE Pay High-Level Requirements doc says it explicitly: "at its core, for MNEE Pay to be successful, it needs to be easy for merchants to integrate MNEE Pay into their existing technology stack with no coding required" (source: confluence:4164812817).
2. **The consumer** — needs to be able to pay with any stablecoin (USDC, USDT, PYUSD, DAI…) on any chain (Solana, Optimism, Tron, Base, Arbitrum, 1Sat Ordinals…) and not have to think about any of that.
3. **The operator** — needs to monitor a payment-session state machine across thousands of merchants and millions of sessions, with refunds, partial refunds, settlement webhooks, OFAC screening, and an attribution ledger that survives a primary-DB outage.

Layered on top: the merchant portal had to be a real product surface (not a developer dashboard), and the consumer surface had to live across QR codes, POS terminals, gateway redirects, and the RockWallet retail app itself.

## My role

Head of Product Design on the platform side. I owned the design system for the Merchant Portal, the consumer-facing payment experience across surfaces (QR static, QR dynamic, receipts, refund flows), and the design language that ties MNEE Pay to RockWallet retail without making MNEE Pay look like a sub-brand. I worked with Megan and Ron on the high-level product structure, and with Solution Architecture on the design implications of the payment-session model (specifically: what state transitions need a user-visible surface, and which can stay backend-only).

I also drove the cross-product design problem: the consumer paying at a MNEE Pay merchant might be a RockWallet user, or might be using a different wallet entirely. The handoff between "your wallet" and "the merchant's checkout" had to feel like one product if you were a RockWallet user, and like a clean third-party integration if you weren't.

## Approach

I started from the payment session as the canonical object — same as the architecture team. Every design decision had to be representable as a state of that object, with a status from the agreed set: `awaiting payment → on-chain pending → confirmed → settled → completed`, plus `failed`, `expired`, and `refunded` (source: confluence:4164812817, section 2.2). If a screen couldn't be mapped to a session state, it didn't ship.

For the merchant portal I structured the IA around four jobs:
- **Get paid** (modules — checkout configurations — and the payment session list)
- **Move money** (settlement, withdraw to MNEE wallet, optional off-ramp to CRB/Borderless)
- **Manage** (refunds, disputes, receipts, API keys, webhooks)
- **Understand** (analytics, reporting, exports)

That framing replaced what was originally a much more developer-y "API docs and a transactions list" layout. Refunds (full and partial, up to 3 per transaction, always to the original wallet/token/network) became their own first-class flow (source: asana:1212990381723679) rather than a button buried in transaction detail.

For the consumer side I leaned into the simplest possible surface: a QR code or a checkout button that resolves to a payment session, and a wallet-side confirmation step. Phase 1 of QR Payments is static (one address per merchant module); Phase 2 is dynamic (a unique session per scan) (asana:1212659654733442, 1213483987507867). The static-first sequencing was a deliberate call — static QR can ship without any real-time backend round-trip and lets us pilot with retail merchants before the dynamic-session infra is hardened.

For the cross-product handoff I designed a "merchant receipt" surface (asana:1212695566608782) that doubles as a marketing surface for RockWallet itself: the consumer who paid with a non-RockWallet wallet gets a receipt that gently points them toward the RockWallet app. This was a Ron suggestion that I extended into a designed pattern — receipts as a growth driver, not just a record of purchase.

On security/UX: the platform is moving from full-custody to a 2-of-3 Shamir's Secret Sharing model that mirrors RockWallet retail (User shard via WebAuthn/Passkeys, MNEE Hot shard for automated settlement, MNEE Recovery shard third-party-held). The design implication is that every outbound payout requires a passkey prompt from the merchant — a meaningful UX moment that I designed alongside the SSS rollout (source: confluence:4164812817 section 5; asana:1212659654733383). Passkey authentication for login is its own task (asana:1212659651109350) and ships in S12.

## Key decisions

- **Payment Session as the design contract.** If it isn't a state, it isn't a screen.
- **Static QR before dynamic QR.** Ship a pilotable surface first; harden the session-per-scan model second.
- **Refunds are first-class.** Up to 3 partials per transaction, always to the original wallet/token/network, refund fee covers our gas. Don't bury them.
- **Settlement asset is always MNEE.** Merchants accept many stablecoins, receive one. Don't make merchants think about chains.
- **Receipts as a growth surface.** Cross-product, not just a record.
- **Passkeys for outbound, not inbound.** Receiving doesn't need biometrics; sending/refunding/withdrawing does.
- **Merchant Portal IA = four jobs (Get paid / Move money / Manage / Understand).** Replaces dev-dashboard mental model.
- **Merchant Account Level Gamification (asana:1212659654733375) reuses the retail Levels framework.** Same Octalysis frame, different milestones (volume, refund rate, KYB completion). One pattern across the two products.

## Outcome

MVP 1 scope is shipping in phased sprints across S8–S12 (MNEE Pay sprint cadence): Authentication, Onboarding, Login, Wallet Infrastructure, MNEE conversion engine, tokens supported, aggregate wallet balance, Send/Store/Receive, Transaction List with filter/sort/CSV export, Transaction Details, Create/Edit/Delete Module, API Documentation, Style & Branding (source: asana:1212198632958692). KYB/KYC verification on MNEE Pay shipped in R2 (asana:1212452030193900). Passkey Authentication for login is in S12 (asana:1212659651109350). Refunds shipped in S9 MNEE Pay (asana:1212990381723679).

Post-MVP roadmap items I've designed against include: SSS Wallet Support, Yield Rewards Phase 1, additional stablecoins/networks (DAI, PYUSD; Polygon), additional cryptos, Cross-Asset Refund Module, Dynamic Receipt Service, CRB and Borderless off-ramp routing, Compliance/OFAC pre-screening, the Native POS App (Clover/Square/Toast/PAX/Verifone), and the loyalty/rewards rule engine.

## Reflection

The biggest tension across this work has been resisting feature-creep into "let's also be a card network." We're not. The discipline of saying "MNEE Pay is settlement infrastructure plus a thin merchant surface, not a vertically integrated payments company" has shaped almost every design call I've made — especially around what *not* to put in the merchant portal at MVP (no advanced analytics dashboards, no marketing campaign tooling, no point-of-sale device management). Every one of those is a real future product; none of them is MVP.

The thing I underestimated: how much design work the *receipt* would take. A receipt is the only surface that touches every payment, every consumer, every merchant — RockWallet user or not. Treating it as a marketing/growth/compliance/UX object simultaneously meant it ended up with more careful thinking than the merchant portal homepage.

The thing I'm proud of: a merchant integrating MNEE Pay through Stripe doesn't need to know that any of this stablecoin infrastructure exists. They get a 0.99% fee, no chargebacks, money in their MNEE wallet, optional off-ramp to USD. That's the whole pitch, and the UX honors it.

## Links

- Confluence (MPP space): https://bayes.atlassian.net/wiki/spaces/MPP/pages/4164812817/High+Level+Requirements
- Asana (Roadmap): https://app.asana.com/1/1203889043133244/project/1212613721080544
- Asana (Master plan): https://app.asana.com/1/1203889043133244/project/1212198821861316
- Related wiki: [[domain/mnee]], [[products/rockwallet-2.0-mobile]]
