import type { SeedProject } from "@/lib/case-study/seed";

const project: SeedProject = {
  slug: "analysis-widget",
  title: "Analysis Widget",
  client: "RockWallet",
  role: "Head of Product Design",
  year: 2026,
  category: "mobile",
  published: true,
  summary:
    "Holdings-personalized portfolio widgets for a US-licensed crypto wallet — designed to add context without nudging risk-takers.",
  description:
    "Two portfolio-analysis widgets — Top Movers and Trending Swaps — for RockWallet, a US-licensed self-custody crypto wallet. Designed under FinCEN and state-level compliance constraints to give the Crypto Curious persona context without FOMO loops, global discovery surfaces, or 'Swap now' shortcuts.",
  tech_stack: ["Figma", "iOS", "Android", "CoinMarketCap"],
  metrics: {
    "Widgets in V1": "2",
    "Asset minimum": "3",
    "FOMO loops added": "0",
  },
  og_image_file: "cover.png",
  sections: [
    {
      section_type: "text",
      heading: "The brief",
      content_md:
        "Crypto platforms have a tired playbook for portfolio-analysis widgets: trending pairs, top movers, biggest gainers — surfaces that look helpful and behave like casinos. **RockWallet** is a US-licensed, FinCEN-registered self-custody wallet. Its primary user — internally *Rebecca, the Crypto Curious* — is new, often unsure, often timid. The exact person we should *not* nudge toward speculative behavior. But she's also the user who needs the most context to feel confident.\n\nThe Analysis Widget started as a competitive review: how do Coinbase, Robinhood, Crypto.com, and Cash App tell users about the state of their portfolio — *without* giving investment advice? Out of that came a roadmap with a clear thesis: holdings-personalized, persona-gated, no global discovery surface.",
      order: 10,
    },
    {
      section_type: "text",
      heading: "Three constraints in tension",
      content_md:
        "The widget surface had to navigate three constraints simultaneously.\n\n**Regulatory.** Anything that reads as *tip* or *trending stock* is a problem. *Sell signal* copy is a problem. Streaks, gamified discovery, and FOMO loops are problems — the same constraint that, on a parallel project, drove us to drop streaks from the gamification system.\n\n**Persona-fit.** Rebecca needs context. The Crypto Convert — the more advanced persona — wants signal. The same widget cannot safely serve both.\n\n**Editorial integrity.** *Trending* needs a definition. *Most bought* needs a definition. If a user taps and asks *why is this trending?* the answer cannot be a black box.\n\nThe default version of this widget — the one every competitor ships — fails all three.",
      order: 20,
    },
    {
      section_type: "image+text",
      heading: "Move 1 — Holdings-personalized, not global",
      content_md:
        "The single most important call: Top Movers V1 shows the fastest price action *among assets the user already holds* — not the global crypto market. Trending Swaps V1 surfaces pairs relevant to the user's holdings, not global volume leaders.\n\nThis eliminates the *Bitcoin is up 12% today — buy now* failure mode by construction. If the user doesn't hold a thing, we don't surface it. The widget exists to help users understand what they already own, not to discover new assets to gamble on.",
      order: 30,
    },
    {
      section_type: "image+text",
      heading: "Move 2 — Persona gating, not feature flags",
      content_md:
        "Trending Swaps V1 is gated to the *Crypto Convert* persona only. Rebecca never sees V1 — she sees Top Movers, with conditional rendering: at least 3 assets held before it appears, which acts as a natural gate without an engineering rule.\n\nGating by persona creates two product surfaces, which is real cost. But the alternative — making one widget safe for Rebecca *and* useful for the Convert simultaneously — produces a widget that's bad at both jobs.",
      order: 40,
    },
    {
      section_type: "text",
      heading: "Move 3 — Editorial discipline as design",
      content_md:
        "Three editorial commitments landed in V1 design:\n\n- **Definitions live on the card, not in a help doc.** *Trending = highest swap volume in the last 24h.*\n- **Friction tooltips on \"most sold.\"** *Selling activity across RockWallet users in the last 24h. This is not investment advice.*\n- **The V2 editorial layer is committed *before* V1 ships.** Reasons-for-trending plus news-feed integration — on the roadmap, not on a wishlist.\n\nAnd a small but load-bearing call on CTAs: Trending Swaps V1 has a *View pair* CTA only — **not** *Swap now*. *View pair* routes to Asset Details where the user gets context, market stats, and trade actions in the proper frame. *Swap now* routes directly into a Swap flow with the pair pre-selected. That's the casino move.",
      order: 50,
    },
    {
      section_type: "metrics",
      heading: "Restraint, by the numbers",
      content_md: null,
      order: 60,
    },
    {
      section_type: "gallery",
      heading: "From research to V1",
      content_md: null,
      order: 70,
    },
    {
      section_type: "text",
      heading: "What I'd do differently",
      content_md:
        "The thing this project taught me: the most valuable design work on a regulated product is often the work of *removing* features that look harmless. Trending swaps looks like a feature. With the wrong default — global pairs, *Swap now* CTA, no definition on the card — it becomes a regulatory and ethical liability. Every decision above is a removal of a default, and every removal had to be argued.\n\nIf I were running this again, I'd have brought compliance into the design conversation in week 1, not at the regulatory-review checkpoint. The constraints would have shaped the first sketches instead of getting bolted on.\n\nWhat I'm proud of: this widget will ship without a single FOMO loop, no investment-advice framing, holdings-personalized only — and Rebecca will see a version that's actively safer than what she'd find on any competing platform. That's the bar.",
      order: 80,
    },
  ],
  assets: [
    {
      type: "hero",
      file: "hero.png",
      alt_text: "Top Movers widget rendered in the RockWallet mobile app",
      caption: "Top Movers V1 — holdings-personalized, persona-aware.",
      order: 10,
    },
    {
      type: "screenshot",
      file: "process-01.png",
      alt_text:
        "Top Movers V1 showing a holdings-only list with a friction tooltip on 'most sold'",
      caption:
        "Top Movers V1 — holdings-only sort, with on-card definitions and friction tooltips.",
      order: 30,
    },
    {
      type: "screenshot",
      file: "process-02.png",
      alt_text:
        "Trending Swaps V1 in the Crypto Convert gated experience, with View pair CTA",
      caption:
        "Trending Swaps V1 — Crypto Convert only, *View pair* CTA, definition on the card.",
      order: 40,
    },
    {
      type: "screenshot",
      file: "gallery-01.png",
      alt_text: "Persona gating decision matrix — Crypto Curious vs Crypto Convert",
      caption: "Persona gating logic — what each persona sees, and why.",
      order: 70,
    },
    {
      type: "screenshot",
      file: "gallery-02.png",
      alt_text:
        "Competitive research grid — Coinbase, Robinhood, Crypto.com, Cash App",
      caption:
        "Competitive landscape: what every other crypto platform ships, and where each one fails the regulatory or editorial test.",
      order: 75,
    },
    {
      type: "screenshot",
      file: "gallery-03.png",
      alt_text: "V2 editorial layer — reasons-for-trending and news-feed integration",
      caption:
        "V2 editorial layer — committed before V1 ships, not deferred to a wishlist.",
      order: 80,
    },
  ],
};

export default project;
