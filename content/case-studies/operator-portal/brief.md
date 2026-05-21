---
title: The Operator Portal
role: Head of Product Design, RockWallet
period: 2026-01 – present
status: shipped (MVP) / in-flight (roadmap enhancements)
team: Product Design (me), Product Management, Backend, Frontend (portal), QA, Compliance, Customer Success, Payments / Fraud team
stack: Figma, Prometheus design system, internal web stack, QuickSite (analytics fallback), SumSub / Sardine / Spreedly data feeds
sources:
  - asana:1212768485728321
  - asana:1213492914163300
  - confluence:R2/Operator-Portal-Scope-at-Launch
  - confluence:R2/Duplicate-and-Optimize-the-Operator-Portal-for-RW-2.0
  - confluence:R2/Operator-Portal-Requirements-Overview
  - confluence:R2/Admin-Portal
---

# The Operator Portal

## Context

Every customer-facing fintech has a second product that customers never see. RockWallet's is the Operator Portal — the internal web app that Compliance, Payments, Fraud, and Customer Success operators use to investigate accounts, adjust limits, enable or disable features, trace transactions across vendors, and act on the alerts that drive day-to-day operations. It is the connective tissue between Sardine flags, SumSub verifications, Spreedly transactions, Cybrid orchestration, and the user-facing wallet.

RW 1.0 had an Operator Portal that worked, more or less, the way operator tooling usually works in a young company: built incrementally, optimised for whoever shouted loudest, slow at scale, and inconsistent enough that operators kept private spreadsheets to compensate (confluence:Duplicate-and-Optimize-the-Operator-Portal-for-RW-2.0). The 2.0 rebuild gave us the opportunity to ship a clean, scalable, role-aware operator surface alongside the consumer redesign. The Operator Portal MVP (asana:1212768485728321) and the Operator Portal Product Roadmap (asana:1213492914163300) track that work.

## The problem

Operator tools are usually designed badly — and the cost of that bad design is invisible to the customer but enormous to the company. An operator who needs ninety seconds instead of fifteen to resolve a chargeback investigation, multiplied by a thousand investigations a month, is six person-weeks of lost productivity a year. Bad operator tools also produce bad customer outcomes: a flag investigated slowly is a customer locked out longer; a limit changed without an audit trail is a compliance gap.

For RW 2.0 the specific problem was four-fold:

1. The 1.0 portal couldn't scale to the data volumes 2.0 would produce.
2. RW 2.0 architecturally changed the data model (Trade ID instead of separate Trade/Transaction IDs), so the portal couldn't be lifted-and-shifted.
3. We were adding new vendors (Spreedly, SumSub replacing Veriff) whose data needed first-class portal surfaces.
4. Compliance and the regulator both required granular, immutable audit trails on every operator action that touched a customer account.

## My role

I led design end-to-end on the Operator Portal MVP and continue to lead it through the roadmap (asana:1213492914163300). That includes the customer detail page, the trade / send-receive / swap / buy-sell tabs, the Feature Enablement Widget, the Verification Widget, the Limits Widget, the Geolocation Widget, the Audit Trail subsystem, the Wallet Address Widget, the Payment Methods surfaces, and the cross-tab search/sort/filter behaviour. I worked closely with the Payments, Fraud, and Compliance teams (Layal, Jan, Jessica, Alex, Phil, Megan — confluence:Operator-Portal-Requirements-Overview) to validate that what we shipped matched their actual workflows.

I owned the design system extensions specific to operator tooling — table density, status tag taxonomy, audit-trail patterning, widget composition — and the cross-widget consistency that the 1.0 portal lacked. I did not own backend data contracts; I shaped them by writing the user-journey contract operators needed.

I'll be honest about scope: the Operator Portal Roadmap (asana:1213492914163300) is a large, ongoing piece of work. What shipped at MVP is meaningful but partial. The "in-flight" list is long, and the bug list above it is longer.

## Approach

**Start with the operator's day, not the portal's tabs.** The first artefact wasn't a wireframe, it was a journey map of the three highest-volume operator workflows: investigate a flagged transaction, resolve a KYC escalation, and adjust a customer's limits or feature enablement. Each of those workflows crosses multiple tabs in the portal. Designing around the tabs makes the portal feel like a database browser; designing around the workflow makes it feel like a tool. The journey maps drove the customer detail page layout and the cross-tab filtering model.

**Tab + widget composition.** The MVP exposes six primary tabs (Customers, Buy/Sell, Trades, Send/Receive, Spreads, Swap) and a customer detail page composed of widgets: Verification, Limits, Feature Enablement, Audit Trail, Wallet Address, Payment Methods, Geolocation (confluence:Operator-Portal-Scope-at-Launch). The widget model came directly from the consumer wallet's home screen — same architectural primitive, different content. That gives Engineering a single composition system and gives operators a consistent mental model: a customer is a person made of widgets, each widget owns a slice of state, each widget has consistent actions.

**Audit trail as a first-class subsystem, not a log file.** Every operator action that mutates customer state — enable/disable Buy ACH, enable/disable Buy Card, Sell enable/disable, Swap enable/disable, limit changes, payment validation, liveness check toggles, geolocation overrides — fires an audit event with reason, actor, timestamp, and pre/post values (asana:1212764558669472 ff.). I designed the audit drawer as a reverse-chronological card list with the reason inline, not buried — partly because Compliance needs that for regulatory defence, partly because operators learn from each other's reasoning. Asana tracks the full audit-event inventory across BE, FE, and QA for each event type.

**Feature Enablement Widget as the operator's escape valve.** When something goes wrong with a customer — a chargeback, a fraud flag, a region mismatch — the first thing an operator needs is the ability to disable specific transaction types for that customer surgically, not nuclear-option freeze the whole account. The Feature Enablement Widget gives them per-feature toggles (Buy ACH, Buy Card, Sell, Swap, Send, Receive) wired to the same rules engine the consumer app reads from. Geo-restrictions display "Location Restricted" instead of toggles when the user's region drives the block, which prevents operators from accidentally overriding a regulatory rule (confluence:Display-Restriction-Reasons-on-the-Feature-Enablement-Widget).

**Spreedly, Sardine, SumSub data as first-class widgets, not appendices.** The 1.0 portal showed vendor data inconsistently — sometimes inline, sometimes via deep-link, sometimes via copy-paste. I pushed for the 2.0 portal to surface each vendor's authoritative fields as widgets in the customer record: SumSub risk data in the Verification Widget, Sardine risk in the trade row, Spreedly token + gateway transaction IDs as searchable columns on Buy/Sell (confluence:Operator-Portal-Spreedly-Data-Fields-for-Operator-Portal). The Gateway Transaction ID column alone closed a real reconciliation gap operators had been working around manually.

**Designing for the operator who hates change.** Compliance and Payments operators were already trained on the 1.0 portal. Throwing them at an unfamiliar UI on day one of RW 2.0 launch was a real risk. I kept the IA broadly similar (tabs, customer detail page, widget composition) so the operators' muscle memory transferred, while quietly modernising the table density, the status tag taxonomy, and the audit-trail experience underneath. The post-launch bug list (asana:1213912197773717 and dozens of sentence-case copy tickets) is the price of that conservatism — but it's a much cheaper price than retraining operators.

## Key decisions

- **Widget composition shared with the consumer app's home screen.** Same architectural primitive. Trade-off: more upfront design system work; payoff is one composition system serving two products.
- **Audit trail as a designed subsystem, not a log.** Every mutating action emits an event; every event has a reason; every reason is visible to the next operator. Trade-off: more screens, more QA; payoff is compliance defensibility plus operator-to-operator knowledge transfer.
- **Operator can disable per-feature, not just per-account.** Granularity > nuclear option. Trade-off: more state to manage; payoff is dramatically better customer outcomes during investigations.
- **Geo-restrictions display as "Location Restricted" rather than togglable.** Operators can't accidentally override a regulatory rule. Trade-off: less operator flexibility; payoff is no Compliance incidents from accidental overrides.
- **Keep the IA broadly similar to 1.0.** Reduces retraining cost. Trade-off: doesn't fix every IA wart from 1.0; payoff is a soft landing for the operator team.
- **MVP ships without SSO, Liveness, ACH Linking, and Geolocation Override** (confluence:Operator-Portal-Scope-at-Launch). Hard call. We documented exactly what's not in MVP so operators wouldn't assume parity. Each of those is on the roadmap (asana:1213492914163300).

## Outcome

The Operator Portal MVP shipped alongside RW 2.0 (asana:1212768485728321, status green as of late March 2026). At launch the portal supports: six primary tab views with sort/filter/search across all encrypted fields; the customer detail page with Verification, Limits, Feature Enablement, and Audit Trail widgets; vendor data integration for SumSub, Sardine, and Spreedly; per-feature enable/disable with audit trail on every action; wallet address visibility and copy. Operators have been using it in production for the soft-launch and public-release cohorts.

The roadmap (asana:1213492914163300) tracks the next phase: Liveness Widget enhancements, SSO for authentication, Geolocation Widget override functionality, Wallet Address Widget, the Slack alerts subsystem, fee-related bug fixes, payment-method status updates, encrypted-field search, and an extensive copy / sentence-case pass driven by operator UAT feedback.

## Reflection

The thing I'd do differently: I'd invest a sprint on copy quality before launch. The post-launch bug list is dominated by Title Case → sentence-case fixes, "Trade Id" → "Trade ID" fixes, label disagreements between tabs (asana:1213748784388189, 1213748859007578, 1213748871986506, 1213746832065787 ff.). None of those are individually catastrophic; collectively they signal a hurried final week. A dedicated copy pass with the operator team would have eliminated 80% of those tickets pre-launch.

The thing I underestimated: how much the *absence* of features matters to operator UX. The "will not be able to" list at launch (confluence:Operator-Portal-Scope-at-Launch) — Liveness, ACH Linking, Geolocation Override, Customer Payment Method management, SSO — is where operators feel the MVP-ness most acutely. Designing the "this is coming, here's the workaround" surface inside the portal would have been a smaller investment than the support load those gaps produce. That's a pattern I'd reapply on the next MVP I ship.

The thing I wouldn't change: treating the Operator Portal as a first-class product, not as a backstage tool. The widget composition, the audit-trail design, the vendor-data integration as widgets — these are not where most companies invest design time on internal tools, and the leverage is real. Every minute saved per operator investigation is a minute of customer trust preserved.

## Links

- Confluence: <https://bayes.atlassian.net/wiki/spaces/R2/pages/4701028368/Operator+Portal+Scope+at+Launch>
- Confluence: <https://bayes.atlassian.net/wiki/spaces/R2/pages/3762716781/Duplicate+and+Optimize+the+Operator+Portal+for+RW+2.0>
- Confluence: <https://bayes.atlassian.net/wiki/spaces/R2/pages/3615096869/Operator+Portal+Requirements+Overview>
- Asana: <https://app.asana.com/0/1212768485728321> · <https://app.asana.com/0/1213492914163300>
- Related wiki pages: [[design-system/prometheus]] · [[projects/rw-web-prod-canvas]]
