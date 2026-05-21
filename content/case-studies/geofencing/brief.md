---
title: Geofencing & Regional Feature Restriction
role: Head of Product Design, RockWallet
period: 2026-02 – present
status: shipped (Sierra Leone restriction, periodic detection) / in-flight (tiered UX rollout)
team: Product Design (me), Compliance, Product Management, Backend, iOS, Android, QA
stack: Figma, Prometheus design system, Flutter, native location APIs, IP geolocation, SumSub geo-attestation
sources:
  - asana:1213112843228400
  - confluence:R2/Infrastructure-PRD-Feature-Restriction-by-Geolocation
  - confluence:R2/Geo-Restriction-UX-Strategy-Comparative-Analysis-Recommendation
  - confluence:R2/Draft-Geolocation-Feature-Restriction-Strategy
  - confluence:R2/Appendix-Geo-Categories-changes
---

# Geofencing & Regional Feature Restriction

## Context

RockWallet operates in a regulatory environment where the cost of getting geographic compliance wrong is existential. We hold US money-transmitter licenses on a state-by-state basis, partner with Cross River Bank, and serve users in jurisdictions whose crypto rules range from permissive to "you may not even hold an account here." The Feature Region Restriction (SL) project — the Sierra Leone implementation specifically — was the moment we hardened RW 2.0's geolocation engine from a configurable list into a defensible product surface (asana:1213112843228400).

Sierra Leone landed on the restricted list as a compliance directive in early February. We had a small window to ship a working restriction before the rule took effect, and the constraint was uncomfortable: we had to do it inside an app already in active UAT for the 2.0 launch, without regressing the rest of the geo system, and without producing the kind of locked-out-of-my-own-money experience that destroys trust in a wallet.

This case study is about that specific implementation, but it sits inside a larger geofencing architecture I worked on across Q1 — the Category 1–6 model (confluence:Appendix-Geo-Categories-changes), the verification eligibility logic, and the layered UX strategy that emerged from it (confluence:Geo-Restriction-UX-Strategy-Comparative-Analysis-Recommendation).

## The problem

Geo-restriction looks trivial on paper: detect location, look up rules, block features. In practice, three things make it hard.

First, *signal disagreement*. A user's IP, their GPS, their self-attested country at onboarding, and their SumSub-verified country can all disagree. We had to define which signal wins when, and why, in a way Compliance would sign off on (confluence:Draft-Geolocation-Feature-Restriction-Strategy).

Second, *the human user*. A user who lives in New York and travels to Hawaii for a weekend is not a fraud signal. Locking them out of their portfolio because of GPS drift is a custody-grade trust violation. We had to design a model that was tight on regulation but generous on travel and edge cases.

Third, *graceful failure*. The earlier in the flow we can warn the user, the more humane the experience — but the later check is the one that's regulatorily safe. Both checks have to exist. The UX has to make a late block feel like a system event, not a betrayal.

## My role

I led design end-to-end on the Sierra Leone implementation and on the broader RW 2.0 geofencing UX. I owned the verification eligibility flow, the configurable category model (1–6), the blocking-screen component library, and the comparative analysis that landed the team on the tiered (entry-block + confirmation-fallback) approach (confluence:Geo-Restriction-UX-Strategy-Comparative-Analysis-Recommendation). I partnered with Compliance to encode the rule matrix, with Backend on the rules-engine contract, and with the Operator Portal team (asana:1212768485728321) on the Geolocation Widget that exposes operator override.

I did not own the legal classification of jurisdictions; that came from our legal/compliance counsel. I shaped the technical architecture by writing the user-journey contract that the rules engine had to satisfy.

## Approach

**Start by mapping signal disagreement.** Before drawing a single screen I built a 2D matrix: signal source (onboarding, IP, GPS, SumSub) on one axis, jurisdiction category (1–6) on the other. Each cell asked "what does the user see, and what features do they get, when these two signals say X and Y?" That matrix exposed the cases nobody had thought through — for example, a user who onboarded in a Category 1 country but whose IP currently resolves to Category 5. We landed on a precedence rule (any restricted signal restricts) and then designed the messaging that explains the asymmetry to the user without invoking the word "blocked" twice (confluence:Draft-Geolocation-Feature-Restriction-Strategy).

**Encode the category model.** Categories 1 through 6 emerged as the right granularity: Category 1 fully supported, Categories 2–5 partial (KYC required, coming soon, restricted features), Category 6 sanctions/prohibited. Sierra Leone landed in Category 5 — restricted from trade features, but users could still hold and view (confluence:Appendix-Geo-Categories-changes). That mapping is now the lingua franca between Product, Engineering, and Compliance.

**Build the verification eligibility layer.** The first deliverable on the SL project was Verification Eligibility Determination — a single backend call that, given a user's signals, returns their category and the resulting feature mask (asana:1213112843228400). I designed the UI surface for this: a single banner pattern on the portfolio screen, a single shared blocking component used by every transaction entry point, and a category-specific "coming soon" or "location restricted" screen. One component, one tone, one taxonomy.

**The three-tier UX recommendation.** Mid-project I wrote a 3,000-word comparative analysis (confluence:Geo-Restriction-UX-Strategy-Comparative-Analysis-Recommendation) arguing that the team's three competing approaches — full-app block, entry-point block, and confirmation-time block — were not alternatives but layers. The recommendation: Approach 2 (entry block) as the default; Approach 3 (confirmation block) as a silent fallback for in-flight location changes; Approach 1 (full block) only for jurisdictions where holding an account is illegal. The analysis grounded the recommendation in Nielsen's heuristics, Baymard's checkout research, and NN/G's writing on hostile error patterns. It was the document that ended a circular debate that had been running for two sprints.

**Test the edge cases first.** UAT testing for SL (asana:1213113401963741 ff.) prioritised the asymmetric cases: traveller crosses border mid-trade, IP and GPS disagree, user attempts re-onboarding after a category change. Each of those had a designed response. The "your location appears to have changed since you started this transaction" copy was something I argued hard for because it attributes the failure to a comprehensible system event rather than a generic block.

## Key decisions

- **Tiered UX (entry block + confirmation fallback), not full app block.** Locking a user out of their own portfolio is a trust violation we don't take unless legal explicitly requires it. Sierra Leone is Category 5, not 6 — read-only access stays.
- **One shared blocking component across Buy / Sell / Swap / Send / Withdraw.** No per-feature variation. Inconsistency breaks Nielsen Heuristic #4 (consistency and standards) and turns a coherent policy into a perceived bug.
- **Self-attested onboarding country as the floor, IP + GPS as overlays.** The most permissive signal alone never grants access; the most restrictive signal alone never blocks read access. Compromise that satisfied Compliance and preserved traveller UX.
- **Operator override is widget-only, not user-facing.** Geolocation overrides go through L2 tickets and the Operator Portal Geolocation Widget (confluence:Operator-Portal-Geolocation-Widget) rather than self-service, because the failure mode of self-service override is unbounded.
- **Instrument the Tier B (confirmation) fire rate.** If more than ~1% of restricted-region attempts reach confirmation before being blocked, the entry-level Tier A coverage has gaps. We made this an analytics gate, not a one-time QA pass.
- **Periodic geolocation detection rather than just onboarding-time.** Geo isn't a one-shot signal; users move. We ship periodic re-checks (RPB-3464, RPB-10010, RPB-10016, RPB-10017) so the rules engine stays current.

## Outcome

The Sierra Leone restriction shipped with backend, iOS, Android, and QA all closing their tasks (asana:1213113401963741–1213113401963751). The verification eligibility flow and database/rules configuration are live and now drive every geofence decision in RW 2.0. The category model is the canonical reference in Product, Engineering, and Compliance conversations. The tiered UX strategy was adopted by the team and is the basis for the persistent-banner pattern on restricted-state portfolio screens (still rolling out at time of writing).

Periodic geolocation detection ships across iOS, Android, and backend as part of the broader RW 2.0 launch. The Operator Portal's Geolocation Widget (confluence:Operator-Portal-Geolocation-Widget) gives Compliance the override surface for edge cases.

## Reflection

The thing I'd do differently: I should have written the comparative analysis (the tiered-UX recommendation) at the start of the project, not in the middle. Two sprints of circular debate could have been one. When the problem space includes regulators, lawyers, designers, and engineers all arguing in slightly different vocabularies, written analysis grounded in shared external sources (NN/G, Baymard, Nielsen) is the cheapest way to converge.

The thing I underestimated: the operator UX. The Geolocation Widget in the Operator Portal is still rough — it loads but doesn't yet support override (confluence:Operator-Portal-Scope-at-Launch lists it explicitly under "Will not be able to") and the override has to be done via L2 ticket. That gap is on my roadmap to close.

The thing I wouldn't change: the refusal to ship full-app block as the default. Every other crypto product I benchmarked defaults to locking the user out of the app when the geofence fires. We don't. Wallet users in restricted regions can still see their assets, and that single decision — defended in the comparative analysis — is the one I'm most proud of.

## Links

- Confluence: <https://bayes.atlassian.net/wiki/spaces/R2/pages/3715727403/Infrastructure+PRD+Feature+Restriction+by+Geolocation>
- Confluence: <https://bayes.atlassian.net/wiki/spaces/R2/pages/5009342472/Geo-Restriction+UX+Strategy+Comparative+Analysis+Recommendation>
- Confluence: <https://bayes.atlassian.net/wiki/spaces/R2/pages/3850141726/Appendix+Geo+Categories+changes>
- Asana: <https://app.asana.com/0/1213112843228400>
- Related wiki pages: [[design-system/prometheus]] · [[projects/rw-web-prod-canvas]]
