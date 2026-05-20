import type { SeedProject } from "@/lib/case-study/seed";

const project: SeedProject = {
  slug: "gamification-levels",
  title: "Building a Gamified Loyalty System / Levels",
  client: "RockWallet",
  role: "Head of Product Design",
  year: 2025,
  category: "mobile",
  published: true,
  summary:
    "Reframed compliance as gameplay for RockWallet's crypto wallet — five-level Octalysis system where KYC reads as progress, not a gate.",
  description:
    "In-flight gamified loyalty system for RockWallet's mobile crypto wallet (iOS + Android). Five levels documented, two shipping at MVP — Level 1 unlocks store/send/receive, Level 2 unlocks fiat after SumSub KYC. Anchored in two of Yu-Kai Chou's eight Octalysis drives — Development & Accomplishment and Ownership & Possession — with eight KYC widget states across three geo categories, a Profile-section home, an All Levels page, and a dignified Pending Review state for the most emotionally fragile moment in onboarding.",
  tech_stack: ["Figma", "SumSub", "Sardine", "Octalysis framework"],
  metrics: {
    "Levels documented (shipping at MVP)": "5 (2)",
    "KYC widget states designed": "8",
    "Geo categories handled": "3 (Cat 1, 2, 5)",
    "Octalysis drives chosen (vs. rejected)": "2 of 8",
  },
  og_image_file: "cover.png",
  sections: [
    {
      section_type: "text",
      heading: "Why would a timid user invest in their profile?",
      content_md:
        "Most crypto wallets target degens — users who don't want an account, don't want KYC, and don't want a relationship with the issuer. RockWallet is the opposite: identity-verified, compliance-first, regulated. That positioning is the moat, but it's also a UX tax. A new user can store, send, and receive crypto without ever verifying who they are — so why would they bother? And without verification they can't buy with a card, ACH, or sell back to fiat, which is where the revenue lives.\n\nThe RockWallet 2.0 brief named the problem directly: how do we get a timid, crypto-curious user to *want* to invest in their profile? Not just tolerate KYC, but treat it as progress. The team had circulated a Coinbase-style \"tiering system\" — but those models reward whales. Our user isn't a whale. They downloaded a wallet because a friend told them to.",
      order: 10,
    },
    {
      section_type: "text",
      heading: "Tiers are for the company. Levels are for the user.",
      content_md:
        "I joined as Head of Product Design and made the case that the levels system shouldn't be an afterthought bolted onto KYC — it should be the *frame* for onboarding, identity, and feature access. The spine that ties together SumSub verification, source-of-funds collection, fee unlocks, and every \"you can't do that yet\" moment in the app.\n\nThree things had to be true at once:\n\n1. **Compliance** — every level had to map cleanly to a regulatory state (Level 1 = no KYC, Level 2 = full SumSub KYC + sanctions screening, Level 3+ = behavioral trust).\n2. **Motivation** — a Level 1 user with a $0 balance had to feel like progressing was *for them*, not for us.\n3. **Geo-aware** — we operate across jurisdictional categories (Cat 1, 2, 5), and a user in a restricted geo can't unlock Level 2 at all. The system had to gracefully say \"you can't progress yet\" without shaming them.",
      order: 20,
    },
    {
      section_type: "image+text",
      heading: "Two Octalysis drives, not eight",
      content_md:
        "I anchored the design in Yu-Kai Chou's Octalysis framework and picked two of the eight core drives intentionally: **Development & Accomplishment** (the user wants to feel they're gaining competence) and **Ownership & Possession** (the user wants to feel that this account, this progress, is *theirs*).\n\nI deliberately did not use Social Influence or Scarcity — both common in fintech gamification, both wrong for a timid user who already feels behind. Compliance also flagged streaks (\"log in 3 days in a row to earn a tip\") as legally grey at MVP — it can be read as encouraging investment behavior. The rejection criteria are documented in the PRD so future PMs don't reintroduce them.\n\nThe full five-level table — Level 1 through Level 5 (VIP) — is documented even though only Levels 1 and 2 ship at MVP. Shipping five tiers with only two backend-supported states would have been theatre. We chose to ship the spine and grow into it.",
      order: 30,
    },
    {
      section_type: "image+text",
      heading: "The Profile screen is the home, not Settings",
      content_md:
        "From there I worked backward into the surface. Profile became the home of the levels system — because Profile is the user's relationship with their account; Settings is where you change a password.\n\nEach user state — fresh signup, mid-KYC dropoff, pending compliance review, full Level 2, geo-restricted — got its own KYC widget specification. Eight states in total. The \"All Levels\" page is a single scrollable view where the user can see every tier, what they unlock, what they need to do, and where they are now. Progress is communicated three ways simultaneously: a banner card at the top of Profile, a progress bar (30% → 53% → 76% → 90% pending → 100%), and a \"Steps to Progress\" list.\n\nUser testing validated the frame. One participant called Levels *\"more interesting, more challenging\"* and said they *\"saw Levels as a motivating feature.\"* That was the unlock — the levels weren't reading as a compliance gate, they were reading as a game worth playing.",
      order: 40,
    },
    {
      section_type: "text",
      heading: "Key decisions",
      content_md:
        "- **Two Octalysis drives, not eight.** Development & Accomplishment + Ownership & Possession. Explicitly *not* Social Influence, *not* Scarcity, *not* Unpredictability. Rejection criteria documented.\n- **No streaks at MVP.** Compliance flagged \"log in N days in a row\" as legally grey — it can be read as encouraging investment behavior. Exploring heat-map and learning-module variants post-MVP.\n- **Levels = compliance state, not loyalty state, at MVP.** Level 2 = SumSub-verified. Don't let marketing dilute the meaning by adding promotional levels in between.\n- **The Profile screen is the home, not Settings.** Levels live where the user's relationship with their account lives.\n- **Geo-restricted users get a dignified state.** Cat-2 users get a \"Notify me when available\" CTA, not an error. The widget for \"you can't progress\" looks intentional, not broken.\n- **Pending Review is its own state.** A user who has submitted KYC and is waiting on compliance is *not* a Level 1 user and *not* a Level 2 user. 90% progress bar that doesn't advance, clear messaging.\n- **Five levels documented even if we ship two.** Putting Level 5 (VIP) on paper — lowest fees, free trades, lower swap minimums, six wallets, airdrop eligibility — prevents the system from drifting.\n- **Operator Portal can remove advanced levels in fraud cases.** Pushed for this early so the system doesn't paint compliance into a corner.",
      order: 50,
    },
    {
      section_type: "metrics",
      heading: "What's shipping with RW 2.0 MVP",
      content_md: null,
      order: 60,
    },
    {
      section_type: "gallery",
      heading: "States across the journey",
      content_md: null,
      order: 70,
    },
    {
      section_type: "text",
      heading: "Reflection — the in-between states matter more than the destinations",
      content_md:
        "What I'd do differently: push earlier for the \"Fully Realized\" five-level table to live on a public marketing page, not just in a PRD. The system motivates more when users can see where they're going, even if it's months away.\n\nI also underestimated how much energy the Pending Review state would take. It's the most emotionally fragile moment in the entire onboarding — the user has handed over their ID and is waiting on a stranger to judge them — and we ended up specifying it as carefully as Level 2 itself. The lesson: the in-between states matter more than the destinations.\n\nThe part I'm proud of: we built a compliance system that reads as a game without ever pretending KYC is fun. We didn't paper over the work; we made the work feel like progress. The MNEE Pay side of the business is now reusing the framework for merchant gamification — same Octalysis frame, different milestones (volume, refund rate, KYB completion).",
      order: 80,
    },
  ],
  assets: [
    {
      type: "hero",
      file: "hero.png",
      alt_text:
        "RockWallet Profile screen with the levels strip — Level 1 unlocked, Level 2 in progress, the full five-level journey visible above the KYC widget",
      caption:
        "Profile as the home of the levels system — the spine that ties KYC, fiat access, and progression into one frame.",
      order: 10,
    },
    {
      type: "screenshot",
      file: "process-01.png",
      alt_text:
        "All Levels page on mobile — five tiers (Level 1 through Level 5 VIP) with what each unlocks, what to do, and where the user is now",
      caption:
        "Five levels documented, two shipping at MVP — Octalysis-anchored, compliance-mapped, post-MVP path made legible.",
      order: 30,
    },
    {
      type: "screenshot",
      file: "process-02.png",
      alt_text:
        "KYC widget in the Pending Review state — 90% progress bar that doesn't advance, dignified \"we'll let you know\" messaging",
      caption:
        "Pending Review — the most emotionally fragile moment in onboarding, specified as carefully as Level 2 itself.",
      order: 40,
    },
    {
      type: "screenshot",
      file: "gallery-01.png",
      alt_text:
        "KYC widget states across the journey — Level 1 fresh, Level 1 in-progress, Pending Review, Cat-2 geo-restricted, Level 2 verified",
      caption:
        "The widget state matrix — every \"where am I in this game\" answered with its own surface.",
      order: 70,
    },
  ],
};

export default project;
