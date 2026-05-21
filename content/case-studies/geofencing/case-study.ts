import type { SeedProject } from "@/lib/case-study/seed";

const project: SeedProject = {
  slug: "geofencing",
  title: "Geofencing & Regional Feature Restriction",
  client: "RockWallet",
  role: "Head of Product Design",
  year: 2026,
  category: "mobile",
  published: true,
  summary:
    "Hardened RockWallet 2.0's geo-restriction engine for Sierra Leone — tiered UX that blocks regulated features without locking users out of their own crypto.",
  description:
    "Sierra Leone implementation of RockWallet 2.0's geo-restriction architecture across iOS, Android, and backend. Designed the Category 1–6 jurisdiction model, the verification eligibility flow, and a tiered UX (entry block + confirmation fallback + periodic re-check). Restricted-region users still see their assets — the call I'm most proud of.",
  tech_stack: [
    "Figma",
    "Prometheus design system",
    "Flutter",
    "Native location APIs",
    "IP geolocation",
    "SumSub geo-attestation",
  ],
  metrics: {
    "Jurisdiction categories defined": "6 (Cat 1 → Cat 6)",
    "Blocking surfaces unified": "5 entry points, 1 component",
    "Tier B (confirmation) fire-rate gate": "<1% of restricted attempts",
    "Comparative analysis grounding": "3,000 words · NN/G, Baymard, Nielsen",
  },
  og_image_file: "cover.png",
  sections: [
    {
      section_type: "text",
      heading: "Geo-restriction looks trivial. It isn't.",
      content_md:
        "RockWallet operates in a regulatory environment where the cost of getting geographic compliance wrong is existential. US money-transmitter licenses on a state-by-state basis, Cross River Bank as banking partner, and a user base spanning jurisdictions whose crypto rules range from permissive to *\"you may not even hold an account here.\"* The Sierra Leone restriction was the moment we hardened RW 2.0's geolocation engine from a configurable list into a defensible product surface.\n\nThe constraint was uncomfortable: Sierra Leone landed on the restricted list as a compliance directive in early February with a tight window. We had to ship a working restriction inside an app already in active UAT for the 2.0 launch, without regressing the rest of the geo system, and without producing the kind of locked-out-of-my-own-money experience that destroys trust in a wallet.",
      order: 10,
    },
    {
      section_type: "text",
      heading: "Signal disagreement is the actual problem",
      content_md:
        "A user's IP, their GPS, their self-attested country at onboarding, and their SumSub-verified country can all disagree. Before drawing a single screen I built a 2D matrix: signal source on one axis, jurisdiction category on the other. Each cell asked *\"what does the user see, and what features do they get, when these two signals say X and Y?\"*\n\nThat matrix exposed the cases nobody had thought through — a user who onboarded in a Category 1 country but whose IP currently resolves to Category 5; a traveller who crosses a border mid-trade; a user attempting re-onboarding after a category change. We landed on a precedence rule (any restricted signal restricts) and designed the messaging that explains the asymmetry without invoking the word \"blocked\" twice.\n\nThe second problem is the human user. Someone who lives in New York and travels to Hawaii for a weekend is not a fraud signal. Locking them out of their portfolio because of GPS drift is a custody-grade trust violation. The model had to be tight on regulation but generous on travel and edge cases.",
      order: 20,
    },
    {
      section_type: "image+text",
      heading: "Category 1–6 — the lingua franca",
      content_md:
        "Categories 1 through 6 emerged as the right granularity: Category 1 fully supported, Categories 2–5 partial (KYC required, coming soon, restricted features), Category 6 sanctions/prohibited. Sierra Leone landed in Category 5 — restricted from trade features, but users could still hold and view.\n\nThat mapping is now the canonical reference in Product, Engineering, and Compliance conversations. \"Cat 5\" replaced six paragraphs of meeting prose. The first deliverable on the SL project was *Verification Eligibility Determination* — a single backend call that, given a user's signals, returns their category and the resulting feature mask. I designed the UI surface for it: a single banner pattern on the portfolio screen, a single shared blocking component used by every transaction entry point, and a category-specific *\"coming soon\"* or *\"location restricted\"* screen. One component, one tone, one taxonomy.",
      order: 30,
    },
    {
      section_type: "image+text",
      heading: "Tiered UX, not full-app block",
      content_md:
        "Mid-project I wrote a 3,000-word comparative analysis arguing that the team's three competing approaches — full-app block, entry-point block, and confirmation-time block — were not alternatives but layers. Recommendation: **Approach 2 (entry block) as the default; Approach 3 (confirmation block) as a silent fallback for in-flight location changes; Approach 1 (full block) only for jurisdictions where holding an account is illegal.**\n\nThe analysis grounded the recommendation in Nielsen's heuristics (consistency and standards, helping users recognize and recover from errors), Baymard's checkout research on late-stage error patterns, and NN/G's writing on hostile error messaging. It was the document that ended a circular debate that had been running for two sprints.\n\nThe earlier in the flow we can warn the user, the more humane the experience. The later check is the one that's regulatorily safe. Both checks have to exist — and the UX has to make the late block feel like a system event (*\"your location appears to have changed since you started this transaction\"*), not a betrayal.",
      order: 40,
    },
    {
      section_type: "text",
      heading: "Key decisions",
      content_md:
        "- **Tiered UX (entry block + confirmation fallback), not full app block.** Locking a user out of their own portfolio is a trust violation we don't take unless legal explicitly requires it. Sierra Leone is Category 5, not 6 — read-only access stays.\n- **One shared blocking component across Buy / Sell / Swap / Send / Withdraw.** No per-feature variation. Inconsistency breaks Nielsen Heuristic #4 and turns a coherent policy into a perceived bug.\n- **Self-attested onboarding country as the floor, IP + GPS as overlays.** The most permissive signal alone never grants access; the most restrictive signal alone never blocks read access. The compromise that satisfied Compliance and preserved traveller UX.\n- **Operator override is widget-only, not user-facing.** Geolocation overrides go through L2 tickets and the Operator Portal Geolocation Widget rather than self-service — the failure mode of self-service override is unbounded.\n- **Instrument the Tier B fire rate.** If more than ~1% of restricted-region attempts reach confirmation before being blocked, the entry-level Tier A coverage has gaps. Analytics gate, not a one-time QA pass.\n- **Periodic geolocation detection, not just onboarding-time.** Geo isn't a one-shot signal; users move. Periodic re-checks ship across iOS, Android, and backend.",
      order: 50,
    },
    {
      section_type: "metrics",
      heading: "What shipped with the Sierra Leone restriction",
      content_md: null,
      order: 60,
    },
    {
      section_type: "gallery",
      heading: "Signal states across the journey",
      content_md: null,
      order: 70,
    },
    {
      section_type: "text",
      heading: "Reflection — the comparative analysis should have been Day 1",
      content_md:
        "What I'd do differently: write the comparative analysis at the *start* of the project, not in the middle. Two sprints of circular debate could have been one. When the problem space includes regulators, lawyers, designers, and engineers all arguing in slightly different vocabularies, written analysis grounded in shared external sources (NN/G, Baymard, Nielsen) is the cheapest way to converge.\n\nWhat I underestimated: the operator UX. The Geolocation Widget in the Operator Portal loads but doesn't yet support override — overrides have to be done via L2 ticket. That gap is on my roadmap to close.\n\nWhat I wouldn't change: the refusal to ship full-app block as the default. Every other crypto product I benchmarked defaults to locking users out of the app when the geofence fires. We don't. Wallet users in restricted regions can still see their assets, and that single decision — defended in the comparative analysis — is the one I'm most proud of.",
      order: 80,
    },
  ],
  assets: [
    {
      type: "hero",
      file: "hero.png",
      alt_text:
        "RockWallet 2.0 portfolio screen with the restricted-region banner — assets visible, trade actions blocked with a clear, non-punitive explanation",
      caption:
        "The view that proves the policy: a Cat-5 user still sees their portfolio. The block is on the action, not the account.",
      order: 10,
    },
    {
      type: "screenshot",
      file: "process-01.png",
      alt_text:
        "Category 1–6 jurisdiction model — table mapping each category to feature access (hold, view, KYC, buy, sell, swap, send, withdraw) with Sierra Leone highlighted in Cat 5",
      caption:
        "Cat 1–6 became the lingua franca across Product, Engineering, and Compliance — \"Cat 5\" replaced six paragraphs of meeting prose.",
      order: 30,
    },
    {
      type: "screenshot",
      file: "process-02.png",
      alt_text:
        "Tiered UX diagram — Tier A entry block on transaction CTAs, Tier B confirmation fallback for in-flight location changes, Tier C reserved for sanctioned jurisdictions only",
      caption:
        "Three approaches the team thought were alternatives are layers — entry block as default, confirmation as silent fallback, full block only when legally required.",
      order: 40,
    },
    {
      type: "screenshot",
      file: "gallery-01.png",
      alt_text:
        "Blocking component states across surfaces — Buy, Sell, Swap, Send, Withdraw — one component, one tone, one taxonomy",
      caption:
        "Five entry points, one shared component — consistency as a Nielsen heuristic, not just a design preference.",
      order: 70,
    },
    {
      type: "screenshot",
      file: "gallery-02.png",
      alt_text:
        "Signal-disagreement matrix — onboarding country, IP, GPS, and SumSub-verified country across the six jurisdiction categories, with precedence rules annotated",
      caption:
        "The matrix that came before any screen — every cell asked \"what does the user see when these two signals disagree?\"",
      order: 80,
    },
  ],
};

export default project;
