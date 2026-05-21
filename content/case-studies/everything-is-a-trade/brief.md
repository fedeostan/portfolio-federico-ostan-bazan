---
title: Everything Is a Trade — One Architecture for Every Value Transfer
role: Head of Product Design, RockWallet
period: 2025 – 2026
status: shipped (core); architectural foundation for future transfer types
team: Federico Ostan Bazan (concept owner + design lead), UX Design team, Product, RW2.0 mobile engineering, Trade Orchestration backend, Compliance
stack: Figma, Prometheus design system, native iOS + Android, unified trade orchestration service
sources:
  - wiki:design-system/prometheus.md
  - confluence:R2 (The New RockWallet space — Trade flows)
  - confluence:MPP (MNEE Pay Platform space — payment session model)
related:
  - "[[trade-experience]]"
  - "[[the-redesign]]"
  - "[[rockwallet-2-redesign]]"
  - "[[asset-categories]]"
  - "[[integration-stack]]"
---

# Everything Is a Trade — One Architecture for Every Value Transfer

## Context

Every wallet on the market does the same thing differently. *Buy* lives in one flow with one set of screens, one set of components, one set of confirmation patterns. *Sell* lives in another. *Swap* in a third. Send-to-an-address is a fourth. Receive is a fifth. Inside the product, each of these is a different surface owned by a different feature team with a different mental model. To the user, they're all conceptually the same act: *I am moving value from one place to another, and I'd like to know what I'm getting on the other side.* The product was forcing the user to learn five different versions of one idea.

During the RW2.0 rebuild I introduced a unifying concept across the entire wallet: **Everything Is a Trade.** Buy, sell, swap, future portfolio-to-portfolio transfers, future bank-to-wallet movements, future person-to-person transfers — all share one flow, one set of components, one confirmation pattern, one error vocabulary. They look the same. They behave the same. The only thing that changes is the two values on the ends of the trade.

This case study is about how I shaped that concept into a product architecture, and what it unlocks for the company once it's in place.

## The problem

Three things were broken about the old model.

**The user was paying a tax.** Every time a user crossed from one type of transaction to another — say from buying with a credit card to swapping between two crypto assets — they had to relearn the flow. Different confirmation screens, different spread disclosure, different error states, different button labels, different placement of the primary action. The cognitive load was real and it showed up in the funnel: drop-off on the second-ever transaction was higher than on the first because the second one was usually a *different type*, and the muscle memory didn't transfer.

**The product team was paying a worse tax.** Five flows meant five Figma files, five sets of edge-case decisions, five copy reviews, five rounds of error-state design, five QA matrices. Every change to spread display, or compliance disclosure, or confirmation pattern had to be made five times — and inevitably wasn't, so the flows drifted further apart over time. We were spending design and engineering cycles maintaining inconsistency.

**The company was capped by it.** The roadmap had ambitions that the old architecture could not support without writing each one as a brand-new flow: portfolio-to-portfolio transfers (move value between sub-accounts), person-to-person sends, bank account on-ramps and off-ramps, MNEE Pay-to-wallet movements, withdrawals to external wallets, scheduled trades, automation rules. Every one of those would have shipped as a new feature with new screens. That was untenable.

## My role

I owned the concept. I named it, framed it, sold it to product and engineering leadership, and led the design that implemented it across the wallet. Specifically:

- I authored the canonical *Trade* component vocabulary in Prometheus — the unified confirmation surface, the from/to selector pair, the spread disclosure, the rate refresh, the error states, the success state.
- I designed the screen-level applications of that vocabulary across Buy, Sell, and Swap, and shaped how the team would extend it to future trade types.
- I worked with the backend team to align the Trade Orchestration service to the same conceptual model — one orchestration shape, parameterized by the asset and account on each end.
- I defended the architecture in compliance review, where it had real implications for how disclosures were presented across vendors.

I don't own the orchestration service itself, the vendor integrations underneath, or the trading engine. I shape the surface and the conceptual contract; backend implements the engine.

## Approach

The mental model I started from: **every action in this product is the movement of value from a `from` to a `to`.** Buy is a trade from fiat (via a vendor) to crypto. Sell is a trade from crypto to fiat. Swap is a trade between two cryptos. A future portfolio transfer is a trade from one of your accounts to another. A future P2P send is a trade from your account to someone else's. A future bank transfer is a trade from your wallet to your bank account, or back. The only meaningful variables in any of these are: *what is on the left, what is on the right, what does the rail in the middle cost, and what does the user see when it lands.*

Once I framed the model that way, the design followed quickly. The flow itself is a single screen with three regions: a **from selector**, a **to selector**, and an **amount + rate disclosure** strip between them. The user picks two ends and an amount; the system calculates and shows the trade preview; one tap commits. The confirmation surface — glassmorphic, full-bleed, the moment of clarity before the user signs — is the same surface regardless of whether they're buying with Sardine, swapping inside the wallet, or selling out to a vendor (see [[integration-stack]] for the vendor side of this).

The detail work was in the parameterization. Different trade types have different disclosures (spread vs. fee vs. exchange rate), different rate-refresh cadences, different verification gates (Passkeys may or may not be required — see [[trade-experience]]), different vendor brands to surface in fine print. I designed a slot system inside the unified component so each trade type plugs its specific disclosures into the same physical shape. The user sees one pattern. The system serves five. The product team designs one component and configures it five ways.

The naming work mattered. Calling it "Everything Is a Trade" gave the concept teeth. Engineers, PMs, compliance reviewers, and marketers all use the phrase now. When a new feature is proposed, the first design question is "is this a Trade?" — and if it is, it inherits the architecture instead of inventing a new one. Naming the idea made it transferable across the company, and that's what makes it durable.

I also designed the *from / to selector* as an abstraction the rest of the product could use. The selector doesn't care whether the slot is a fiat balance, a crypto holding, a portfolio, another user (in the future), or a bank account (in the future). It surfaces whichever value-bearing endpoints the current user is authorized to use. This is the wedge that lets future transfer types ship as configuration, not as new flows.

## Key decisions

- **Frame every value movement as a Trade.** Not as "Buy," "Sell," or "Swap" first. The verbs become surfaces *of* a Trade, not separate flows.
- **One confirmation surface, parameterized.** The glassmorphic confirm screen is the same physical component for every trade type. Disclosures, vendor brands, and verification gates slot in.
- **From / To as an abstraction over endpoints.** The selector treats "your USD balance," "your MNEE balance," "a credit card via Sardine," "your bank account," "another user," and "another of your portfolios" as the same kind of thing — endpoints. Today three of those exist. Tomorrow the rest plug in without new screens.
- **One vocabulary across compliance, copy, and motion.** Spread, rate refresh, error states, success states, and the disclosure footer share a single language. Compliance reviews one model, not five.
- **Name the concept.** "Everything Is a Trade" travels through the company. It's now the framing question at the start of every new transactional feature.
- **Don't ship the future types prematurely.** P2P, portfolio-to-portfolio, and bank-to-wallet do not ship in V1 — but the architecture they need does. The harder thing is preserving optionality without paying for unused complexity. I designed in the shape of these future endpoints without exposing them.

## Outcome

- **Buy, Sell, and Swap shipped against the unified Trade architecture.** Same confirmation surface, same from/to selector, same disclosure pattern, same error vocabulary.
- **The Trade Orchestration backend is aligned to the model.** Backend operates against the same conceptual contract the UI does, so adding a new trade type is genuinely additive rather than a parallel rebuild.
- **Design and engineering cost-to-add for a new trade type dropped substantially.** A new vendor integration or transfer type is now a configuration of the unified flow, not a greenfield design.
- **The vocabulary is in use.** "Is this a Trade?" is the question the product team asks at the start of new transactional work. The concept is sticky inside the company.
- **The roadmap unlocks are real.** Portfolio-to-portfolio transfers, P2P sends, bank on/off-ramps, scheduled trades — each one is now a small product surface, not a new flow to design from scratch.

## Reflection

The hardest part of this project wasn't the design — it was the politics. Different teams owned Buy, Sell, and Swap before unification, and merging conceptually-similar flows under one banner meant rearranging some org-chart edges. The work that made the architecture stick was less "drawing components" and more "running enough alignment conversations that everyone agreed the wallet is making one promise, not five."

The thing I'd do differently is publish the architectural concept earlier. I introduced it well into the RW2.0 rebuild, after we'd already designed Buy and Sell separately. If I'd led with the concept and worked outward into the verbs, the convergence would have cost less and the V1 surface area would have been cleaner. Lesson taken: when an architectural reframe is available, name it first and design second.

## Links

- Related case studies: [[trade-experience]], [[the-redesign]], [[rockwallet-2-redesign]], [[asset-categories]], [[integration-stack]], [[mnee-pay-platform]]
- Related wiki: [[design-system/prometheus]]
