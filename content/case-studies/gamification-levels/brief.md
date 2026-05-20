---
title: Building a Gamified Loyalty System / Levels
role: Head of Product Design, RockWallet
period: 2025-04 – present
status: in-flight (Level 1 + Level 2 shipping with RW 2.0 MVP; Levels 3–5 post-MVP)
team: Design (myself + Inna Posokhova), Product (Megan Conard, Ron Tarter), Compliance, Engineering (iOS + Android + BE)
stack: Figma, SumSub (KYC), Sardine (post-MVP KYC Express), Yu-Kai Chou Octalysis framework
sources:
  - confluence:R2/RockWallet+Profile+Account (id 3484778571)
  - confluence:R2/User+Story+10+Profile+All+Levels+Page+Level+1+All+Categories (id 3844571137)
  - confluence:R2/User+Story+11+Profile+All+Levels+Page+Level+1+In+Progress+All+Categories (id 3844669441)
  - confluence:R2/User+Story+21+Profile+All+Levels+Page+Level+2 (id 3846012998)
  - confluence:R2/User+Story+20+Profile+KYC+Widget+Level+2 (id 3846078810)
  - confluence:R2/User+Story+6+Profile+KYC+Widget+Level+1+In+Progress (id 3836379137)
  - confluence:R2/User+Story+25+Profile+KYC+Widget+Pending+Review (id 3847061583)
  - confluence:R2/User+Story+5+Profile+KYC+Widget+Level+1+Category+2 (id 3844571173)
  - confluence:R2/Onboarding+Login+Recovery (id 3496312886)
  - confluence:R2/Results+KYC+user+test (id 3871342901)
  - confluence:R2/RockWallet+-+2.0+Vision (id 3341713449)
  - asana:1212811778883765 — "Additional Account Levels (Trusted Customer, Incentives, Gamification)"
  - asana:1212659654733375 — "Merchant Account Level Gamification" (MNEE Pay roadmap)
---

# Building a Gamified Loyalty System / Levels

## Context

Most crypto wallets target degens and crypto-anarchists — users who don't want an account, don't want KYC, and don't want a relationship with the issuer. RockWallet is the opposite: identity-verified, compliance-first, and regulated. That positioning is our moat, but it's also a UX tax. A new user can do the simple things (store, send, receive crypto) without ever verifying who they are — so why would they bother? And without verification, they can't buy with a card, ACH, or sell back to fiat, which is where our revenue lives.

The brief for RockWallet 2.0 named the problem directly: how do we get a timid, skeptical, crypto-curious user to *want* to invest in their profile? Not just tolerate KYC, but treat it as progress. The team had circulated the idea of a "tiering system" the way an exchange would (Coinbase Earn, Binance VIP) — but those models reward whales. Our user isn't a whale. They're someone who downloaded a wallet because a friend told them to.

I joined the work in April 2025 as Head of Product Design and made the case that the levels system shouldn't be an afterthought bolted onto KYC; it should be the *frame* for onboarding, identity, and feature access — the spine that ties together SumSub verification, source-of-funds collection, fee unlocks, and every "you can't do that yet" moment in the app.

## The problem

Three things had to be true at once:

1. **Compliance** — every level had to map cleanly to a regulatory state (Level 1 = no KYC, Level 2 = full SumSub KYC + sanctions screening, Level 3+ = behavioral trust).
2. **Motivation** — a Level 1 user with a $0 balance had to feel like progressing was *for them*, not for us. The original framing ("complete KYC to unlock fiat") reads as a gate, not a game.
3. **Geo-aware** — we operate across jurisdictional categories (Category 1, 2, 5 in the user-test pages), and a user in a restricted geo can't unlock Level 2 at all. The system had to gracefully say "you can't progress yet" without shaming them.

We also had a Post-MVP problem: the long-term levels (3, 4, 5/VIP) had to encode behavioral signals — transaction count, no chargebacks, account age, trading volume — without straying into "streaks" or anything that could be read as encouraging users to over-invest. Compliance flagged streaks specifically as legally grey (source: RockWallet Profile/Account, Section 2).

## My role

Head of Product Design and the design DRI on the levels system. I owned the gamification framework choice, the structure of the Profile section, the visual system for the Levels strip, every state of the KYC widget (Level 1 fresh, Level 1 in-progress, Level 1 Cat-2 restricted, Pending Review, Level 2 max), and the "All Levels" page that explains the journey. I worked directly with Megan Conard (PM) and Inna Posokhova (designer) on the user-story breakdown, and ran the user testing that validated the motivational frame.

## Approach

I started by rejecting the default mental model. A "tier system" is something a company designs for itself — revenue tiers, customer-value tiers. A "levels system" is something a user lives inside. The question I kept coming back to: *what would make a 28-year-old who has never bought crypto feel like leveling up is the obvious next step?*

I anchored the design in Yu-Kai Chou's Octalysis framework and picked two of the eight core drives intentionally: **Development & Accomplishment** (the user wants to feel like they're making progress and gaining competence) and **Ownership & Possession** (the user wants to feel that this account, this wallet, this progress is *theirs*). I deliberately did not use Social Influence or Scarcity — both common in fintech gamification, both wrong for a timid user who already feels behind. The full rationale is in the Profile/Account PRD (source: confluence:3484778571, "We use the Gamification methodology from Yu-Kai Chou and selected two key drivers").

From there I worked backward into the surface. The Profile screen became the home of the levels system. Each user state — fresh signup, mid-KYC dropoff, pending compliance review, full Level 2, geo-restricted — got its own KYC widget specification. The "All Levels" page (User Stories 10, 11, 21, 26) is a single scrollable view where the user can see every tier, what they unlock, what they need to do, and where they are now. Progress is communicated three ways simultaneously: a banner card at the top of Profile, a progress bar (30% → 53% → 76% → 90% pending → 100%), and a "Steps to Progress" list.

For MVP we deliberately collapsed the system to two levels — Level 1 (store/send/receive crypto, no fiat) and Level 2 (full trade access after SumSub KYC). The "Fully Realized" five-level table (1 → 2 → 3 → 4 → 5 VIP) is documented but explicitly post-MVP. This was a hard call: the long version is more motivating, but shipping five tiers with only two backend-supported states would have been theatre. We chose to ship the spine and grow into it.

User testing validated the approach. One participant called Levels "more interesting, more challenging" and said they "saw Levels as a motivating feature" (source: confluence:3871342901, KYC user test results). That was the unlock — the levels weren't reading as a compliance gate, they were reading as a game worth playing.

## Key decisions

- **Two Octalysis drives, not eight.** Development & Accomplishment + Ownership & Possession. Explicitly *not* Social Influence, *not* Scarcity, *not* Unpredictability. Documented the rejection criteria so future PMs don't reintroduce them.
- **No streaks at MVP.** Compliance flagged "log in 3 days in a row to earn a tip" as legally grey — it can be read as encouraging investment behavior. We're exploring heat-map and learning-module variants post-MVP.
- **Levels = compliance state, not loyalty state, at MVP.** Level 2 = SumSub-verified. Don't let marketing dilute the meaning by adding promotional levels in between.
- **The Profile screen is the home, not Settings.** Levels live in Profile because Profile is the user's relationship with their account. Settings is where you change a password.
- **Geo-restricted users get a dignified state.** Cat-2 users get a "Notify me when available" CTA, not an error. The widget for "you can't progress" looks intentional, not broken (User Story 5).
- **Pending Review is its own state.** A user who has submitted KYC and is waiting on compliance is *not* a Level 1 user and *not* a Level 2 user. They get a 90% progress bar that doesn't advance and clear messaging (User Story 25).
- **Five levels documented even if we ship two.** The "Fully Realized" table commits the org to what Level 5 (VIP) means: lowest fees, free trades, lower swap minimums, six wallets, eligible for airdrops. Putting it on paper prevents the system from drifting.

## Outcome

Levels is shipping as part of RW 2.0 MVP — Level 1 and Level 2, the Profile section, the All Levels page, the eight KYC widget states (one per user condition), and the SumSub integration that drives the transition. The system is QA'd against geo categories (Cat 1, Cat 2, Cat 5) in active Jira tickets (e.g., RPB-11847, RPB-11848). Operator Portal includes the ability to remove advanced levels in fraud cases — a requirement I pushed for early so the system doesn't paint compliance into a corner (source: asana:1212811778883765).

The MNEE Pay side of the business has a parallel "Merchant Account Level Gamification" effort (asana:1212659654733375) that will reuse this framework on the merchant portal — same Octalysis frame, different milestones (volume, refund rate, KYB completion).

## Reflection

The thing I'd do differently: I'd push earlier for the "Fully Realized" five-level table to live on a public marketing page, not just in a PRD. The system motivates more when users can see where they're going, even if it's months away. I also underestimated how much energy the "Pending Review" state would take — it's the most emotionally fragile moment in the entire onboarding, and we ended up specifying it as carefully as Level 2 itself. Good lesson: the in-between states matter more than the destinations.

The part I'm proud of: we built a compliance system that reads as a game without ever pretending KYC is fun. We didn't paper over the work; we made the work feel like progress.

## Links

- Confluence: https://bayes.atlassian.net/wiki/spaces/R2/pages/3484778571/RockWallet+Profile+Account
- Confluence: https://bayes.atlassian.net/wiki/spaces/R2/pages/3844571137/User+Story+10+Profile+All+Levels+Page+Level+1+All+Categories
- Confluence: https://bayes.atlassian.net/wiki/spaces/R2/pages/3871342901/Results+KYC+user+test
- Asana: https://app.asana.com/1/1203889043133244/project/1212811792578884/task/1212811778883765
- Asana: https://app.asana.com/1/1203889043133244/project/1212613721080544/task/1212659654733375
- Related wiki: [[products/rockwallet-2.0-mobile]], [[domain/kyc]]
