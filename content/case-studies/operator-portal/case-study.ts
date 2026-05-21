import type { SeedProject } from "@/lib/case-study/seed";

const project: SeedProject = {
  slug: "operator-portal",
  title: "The Operator Portal",
  client: "RockWallet",
  role: "Head of Product Design",
  year: 2026,
  category: "desktop",
  published: true,
  summary:
    "The second product customers never see — RockWallet 2.0's internal portal for Compliance, Fraud, and Payments operators, treated as a first-class product, not a backstage tool.",
  description:
    "RW 2.0 Operator Portal MVP — six primary tabs, a widget-composed customer detail page, audit trail as a first-class subsystem, and Sardine / SumSub / Spreedly vendor data surfaced as widgets instead of appendices. Same widget primitive as the consumer wallet's home screen — one composition system, two products. Every operator action that mutates customer state fires an auditable event.",
  tech_stack: [
    "Figma",
    "Prometheus design system",
    "SumSub",
    "Sardine",
    "Spreedly",
    "Cybrid",
    "QuickSite",
  ],
  metrics: {
    "Primary tabs at MVP": "6 (Customers · Buy/Sell · Trades · Send/Receive · Spreads · Swap)",
    "Customer-detail widgets": "7 (Verification · Limits · Feature Enablement · Audit Trail · Wallet Address · Payment Methods · Geolocation)",
    "Per-feature toggles (vs nuclear freeze)": "6 (Buy ACH · Buy Card · Sell · Swap · Send · Receive)",
    "Audit coverage on mutating actions": "100% (actor · reason · pre/post values)",
  },
  og_image_file: "cover.png",
  sections: [
    {
      section_type: "text",
      heading: "The second product customers never see",
      content_md:
        "Every customer-facing fintech has a second product that customers never see. RockWallet's is the **Operator Portal** — the internal web app that Compliance, Payments, Fraud, and Customer Success operators use to investigate accounts, adjust limits, enable or disable features, trace transactions across vendors, and act on the alerts that drive day-to-day operations. It is the connective tissue between Sardine flags, SumSub verifications, Spreedly transactions, Cybrid orchestration, and the user-facing wallet.\n\nRW 1.0 had an Operator Portal that worked the way operator tooling usually works in a young company: built incrementally, optimised for whoever shouted loudest, slow at scale, and inconsistent enough that operators kept private spreadsheets to compensate. The 2.0 rebuild gave us the opportunity to ship a clean, scalable, role-aware operator surface alongside the consumer redesign.",
      order: 10,
    },
    {
      section_type: "text",
      heading: "Bad operator tools are invisible, and they cost everything",
      content_md:
        "Operator tools are usually designed badly — and the cost of that bad design is invisible to the customer but enormous to the company. **An operator who needs ninety seconds instead of fifteen to resolve a chargeback investigation, multiplied by a thousand investigations a month, is six person-weeks of lost productivity a year.** Bad operator tools also produce bad customer outcomes: a flag investigated slowly is a customer locked out longer; a limit changed without an audit trail is a compliance gap.\n\nFor RW 2.0 the specific problem was four-fold: (1) the 1.0 portal couldn't scale to the data volumes 2.0 would produce; (2) RW 2.0 architecturally changed the data model (Trade ID instead of separate Trade/Transaction IDs), so the portal couldn't be lifted-and-shifted; (3) we were adding new vendors (Spreedly, SumSub replacing Veriff) whose data needed first-class portal surfaces; (4) Compliance and the regulator both required granular, immutable audit trails on every operator action that touched a customer account.",
      order: 20,
    },
    {
      section_type: "image+text",
      heading: "Designed around the workflow, not the tabs",
      content_md:
        "The first artefact wasn't a wireframe — it was a journey map of the three highest-volume operator workflows: **investigate a flagged transaction, resolve a KYC escalation, adjust a customer's limits or feature enablement.** Each of those crosses multiple tabs in the portal. Designing around the tabs makes the portal feel like a database browser; designing around the workflow makes it feel like a tool. The journey maps drove the customer detail page layout and the cross-tab filtering model.\n\n**Tab + widget composition.** Six primary tabs (Customers, Buy/Sell, Trades, Send/Receive, Spreads, Swap) and a customer detail page composed of widgets: Verification, Limits, Feature Enablement, Audit Trail, Wallet Address, Payment Methods, Geolocation. **The widget model came directly from the consumer wallet's home screen** — same architectural primitive, different content. One composition system serving two products, and operators get the same mental model as customers: a person made of widgets, each widget owns a slice of state, each widget has consistent actions.",
      order: 30,
    },
    {
      section_type: "image+text",
      heading: "Audit trail as a designed subsystem, not a log file",
      content_md:
        "Every operator action that mutates customer state — enable/disable Buy ACH, Buy Card, Sell, Swap, limit changes, payment validation, liveness toggles, geolocation overrides — fires an audit event with **reason, actor, timestamp, and pre/post values.** I designed the audit drawer as a reverse-chronological card list with the reason *inline, not buried* — partly because Compliance needs that for regulatory defence, partly because operators learn from each other's reasoning.\n\n**Feature Enablement Widget as the operator's escape valve.** When something goes wrong with a customer — a chargeback, a fraud flag, a region mismatch — the first thing an operator needs is the ability to disable specific transaction types surgically, *not* nuclear-option freeze the whole account. Per-feature toggles (Buy ACH, Buy Card, Sell, Swap, Send, Receive) wired to the same rules engine the consumer app reads from. Geo-restrictions display *\"Location Restricted\"* instead of toggles when the user's region drives the block — prevents operators from accidentally overriding a regulatory rule.",
      order: 40,
    },
    {
      section_type: "text",
      heading: "Key decisions",
      content_md:
        "- **Widget composition shared with the consumer app's home screen.** Same architectural primitive. Trade-off: more upfront design-system work; payoff: one composition system serving two products.\n- **Audit trail as a designed subsystem, not a log.** Every mutating action emits an event; every event has a reason; every reason is visible to the next operator. Compliance defensibility plus operator-to-operator knowledge transfer.\n- **Per-feature disable, not per-account.** Granularity > nuclear option. More state to manage; dramatically better customer outcomes during investigations.\n- **Geo-restrictions display as \"Location Restricted\" rather than togglable.** Operators can't accidentally override a regulatory rule. Less flexibility; zero Compliance incidents from accidental overrides.\n- **Vendor data as first-class widgets.** SumSub risk in Verification, Sardine risk in trade rows, Spreedly token + gateway transaction IDs as searchable columns. The Gateway Transaction ID column alone closed a real reconciliation gap operators had been working around manually.\n- **Keep the IA broadly similar to 1.0.** Reduces retraining cost. Doesn't fix every 1.0 IA wart; gives the operator team a soft landing.\n- **MVP ships without SSO, Liveness, ACH Linking, Geolocation Override.** Hard call. Documented exactly what's *not* in MVP so operators wouldn't assume parity. Each on the roadmap.",
      order: 50,
    },
    {
      section_type: "metrics",
      heading: "Operator Portal MVP, in numbers",
      content_md: null,
      order: 60,
    },
    {
      section_type: "gallery",
      heading: "Surfaces operators actually use",
      content_md: null,
      order: 70,
    },
    {
      section_type: "text",
      heading: "Reflection — a sprint of copy would have saved a quarter of bugs",
      content_md:
        "What I'd do differently: invest a sprint on copy quality before launch. The post-launch bug list is dominated by Title Case → sentence-case fixes, *\"Trade Id\" → \"Trade ID\"*, label disagreements between tabs. None of those are individually catastrophic; collectively they signal a hurried final week. A dedicated copy pass with the operator team would have eliminated 80% of those tickets pre-launch.\n\nWhat I underestimated: how much the *absence* of features matters to operator UX. The *\"will not be able to\"* list at launch — Liveness, ACH Linking, Geolocation Override, Customer Payment Method management, SSO — is where operators feel the MVP-ness most acutely. Designing the *\"this is coming, here's the workaround\"* surface inside the portal would have been a smaller investment than the support load those gaps produce. That's a pattern I'd reapply on the next MVP I ship.\n\nWhat I wouldn't change: treating the Operator Portal as a first-class product, not as a backstage tool. The widget composition, the audit-trail design, the vendor-data integration as widgets — these are not where most companies invest design time on internal tools, and the leverage is real. **Every minute saved per operator investigation is a minute of customer trust preserved.**",
      order: 80,
    },
  ],
  assets: [
    {
      type: "hero",
      file: "hero.png",
      alt_text:
        "Operator Portal customer detail page — Verification, Limits, Feature Enablement, and Audit Trail widgets composed on a single screen, the same widget primitive as the consumer wallet's home",
      caption:
        "A customer is a person made of widgets — same architectural primitive as the consumer wallet, different content. One system, two products.",
      order: 10,
    },
    {
      type: "screenshot",
      file: "process-01.png",
      alt_text:
        "Operator journey map — investigate a flagged transaction → resolve a KYC escalation → adjust customer limits or feature enablement — each crossing multiple tabs and driving the cross-tab filtering model",
      caption:
        "Designed around the workflow, not the tabs. The journey map came first; the IA followed.",
      order: 30,
    },
    {
      type: "screenshot",
      file: "process-02.png",
      alt_text:
        "Audit Trail drawer — reverse-chronological card list with actor, reason, timestamp, and pre/post values inline on every mutating action across Buy ACH, Buy Card, Sell, Swap, limits, payment validation, liveness, geolocation",
      caption:
        "Reasons inline, not buried — Compliance defensibility plus operator-to-operator knowledge transfer.",
      order: 40,
    },
    {
      type: "screenshot",
      file: "gallery-01.png",
      alt_text:
        "Feature Enablement Widget — per-feature toggles (Buy ACH, Buy Card, Sell, Swap, Send, Receive) wired to the same rules engine the consumer app reads, with geo-restricted features showing \"Location Restricted\" instead of togglable controls",
      caption:
        "The operator's escape valve — surgical per-feature disable, with regulatory rules deliberately not overridable.",
      order: 70,
    },
  ],
};

export default project;
