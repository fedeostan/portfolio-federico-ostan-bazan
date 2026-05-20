import type { SeedProject } from "@/lib/case-study/seed";

const project: SeedProject = {
  slug: "asset-categories",
  title: "Reorganizing the Asset & Transaction Categories",
  client: "RockWallet",
  role: "Head of Product Design",
  year: 2025,
  category: "mobile",
  published: true,
  summary:
    "Cross-cutting asset and transaction taxonomy for a multi-network crypto wallet — Token Kits, Asset Details, and customer/ops labels aligned.",
  description:
    "Rebuilt the asset and transaction taxonomy underneath RockWallet's iOS + Android 2.0 release: Token Kits as the source-of-truth artifact, a Held/Not-Held Asset Details Page on one shell, multi-network balance breakdown for MNEE, and transaction labels aligned between customer app, Recent Transactions widget, full Activity screen, and Operator Portal.",
  tech_stack: ["Figma", "iOS", "Android", "CoinMarketCap", "Fireblocks"],
  metrics: {
    "Tokens onboarded to the Token Kit template": "6",
    "Transaction types unified across app + ops": "7",
    "Surfaces reading from the Token Kit": "4",
    "Designers needed to understand a new token": "1",
  },
  og_image_file: "cover.png",
  sections: [
    {
      section_type: "text",
      heading: "When taxonomy stops being a list",
      content_md:
        "RockWallet's 1.0 wallet UI treated assets as a flat list and transactions as a chronological feed. That works when you have six tokens and three actions. By mid-2025, three forces were pulling on it at once — a growing token list (BTC, BSV, LTC, XRP, ETH, USDC, and now MNEE plus a roadmap of additional ERC-20s), multi-network ownership that wasn't optional anymore (MNEE on ETH and BSV, USDC across multiple chains), and a transaction model that had diverged from *Send / Receive* into Buy (Card), Buy (ACH), Swap, Sell (ACH), internal transfers, and Tap-to-Pay.\n\nThe taxonomy wasn't a list anymore. It was the spine of how a user understands what they own, what they did, and what they can do next.",
      order: 10,
    },
    {
      section_type: "text",
      heading: "Four places the legacy model broke",
      content_md:
        "- A user owned MNEE on both Ethereum and BSV and saw **a single \"MNEE\" balance that didn't reconcile against either chain**.\n- A user wanted to send BSV but the **Send** tile was disabled because their geo restricted ACH — and they couldn't tell whether the problem was the asset or the action.\n- A Token Kit (the per-asset content unit — name, ticker, category, utility, brand, about copy, social links) existed for some tokens and not others, so the Asset Details Page felt **half-built**.\n- A user reading their history couldn't distinguish a **Buy (Card)** from a **Buy (ACH)** — both said *Buy* but had wildly different settlement times, custody states, and support paths.\n\nThe compounding issue: every team was solving its own slice. The trade team treated Buy/Sell/Swap as flows. The portfolio team treated assets as rows. The token-onboarding team produced Token Kits in isolation. Nothing was load-bearing across all three.",
      order: 20,
    },
    {
      section_type: "image+text",
      heading: "Token Kit as the upstream artifact",
      content_md:
        "I started with the **Token Kit template** because it's the upstream artifact — if every supported token has a structured kit with the same fields (Name, Ticker, Blockchain(s), Contract Address(es), Decimals, Token Standard, Launch Date, Status on RockWallet, **Category**, Utility, About, Brand, Logo), then every downstream surface (Asset Details, Buy list, Swap-to drawer, Receive screen) can be generated from the same data.\n\nWe populated this for BTC (\"Layer 1 / UTXO / Digital Gold\"), BSV, XRP, LTC, MNEE, and the ERC-20 tokens — and made it a **required artifact for any new token going forward**. No surface invents its own copy.",
      order: 30,
    },
    {
      section_type: "image+text",
      heading: "Multi-network without lying about it",
      content_md:
        "I rejected the first pass, which had MNEE-on-ETH and MNEE-on-BSV as separate rows in the portfolio. That makes them look like different assets.\n\nInstead, on Asset Details for MNEE, the **Balance widget expands** to break down the *same* total balance across networks. The user sees *MNEE: $X total → Ethereum: $Y, BSV: $Z.* One asset, one identity, sub-network breakdown when relevant.\n\nFor the Buy flow, we kept the simpler flat list at MVP and added a *which network?* confirm step after selection — a deliberate compromise that lets us ship without over-designing the buy list. We'll revisit when more multi-network tokens land.",
      order: 40,
    },
    {
      section_type: "text",
      heading: "Key decisions",
      content_md:
        "- **Token Kit as the source-of-truth artifact.** Every supported token has one. Every downstream surface reads from it.\n- **Asset Details = Held / Not-Held on one page, not two.** Continuity of mental model from *thinking about buying* to *owning it*.\n- **Multi-network shown by expanding the balance widget, not by adding rows.** One asset, one identity.\n- **Buy list keeps the flat pattern at MVP; confirm network *after* selection.** Trade complexity vs. shippability.\n- **Customer-app transaction types = Operator Portal transaction types.** Same labels, same filters, same definitions across the app, the Recent Transactions home widget, the full Activity screen, and support tooling.\n- **Quick-Action buttons (Buy/Swap/Sell) sticky and asset-scoped.** The action travels with the asset context.\n- **Search in the token-selection drawer descoped for MVP.** The list is short enough today. Revisit at ~15 tokens.\n- **MNEE merchandising lives in the flow, not the taxonomy.** When a user selects USDC, we surface MNEE as an alternative (lower fees, faster settlement) — but both stay listed as stablecoins. Don't pollute the category structure with marketing logic.\n- **Asset categories are descriptive (BTC = \"Layer 1 / UTXO / Digital Gold\"), not navigational.** No filter-portfolio-by-category at MVP.",
      order: 50,
    },
    {
      section_type: "metrics",
      heading: "What shipped with RW 2.0",
      content_md: null,
      order: 60,
    },
    {
      section_type: "gallery",
      heading: "Surfaces that read from the taxonomy",
      content_md: null,
      order: 70,
    },
    {
      section_type: "text",
      heading: "Reflection — what I'd do sooner",
      content_md:
        "Taxonomy work is invisible when it goes well and disastrous when it doesn't. The biggest risk I ran was over-engineering the multi-network case before we had enough multi-network tokens to learn from. I had to keep dialing back the design to *the simplest thing that survives the next two tokens we add* rather than *the most elegant thing that survives ten*.\n\nWhat I wish I'd done sooner: written the cross-team taxonomy doc (Token Kit fields, transaction types, category vocabulary) **before** the first Asset Details PRD, not in parallel with it. We re-litigated the same naming questions in three different PRDs because the upstream artifact didn't exist yet.\n\nWhat I'm proud of: a designer joining six months from now can read a Token Kit, read the Asset Details PRD, and know what every screen for a new token should look like — without asking anyone.",
      order: 80,
    },
  ],
  assets: [
    {
      type: "hero",
      file: "hero.png",
      alt_text:
        "Asset Details page for MNEE on RockWallet — Held state, balance widget expanded across Ethereum and BSV",
      caption:
        "Asset Details — Held state for MNEE, with the balance widget broken down by network.",
      order: 10,
    },
    {
      type: "screenshot",
      file: "process-01.png",
      alt_text:
        "Token Kit template populated for BTC — Name, Ticker, Category (Layer 1 / UTXO / Digital Gold), Utility, About, Brand fields",
      caption:
        "Token Kit template — the upstream artifact every downstream surface reads from.",
      order: 30,
    },
    {
      type: "screenshot",
      file: "process-02.png",
      alt_text:
        "Balance widget on Asset Details for MNEE — single total expanded into Ethereum and BSV sub-balances",
      caption:
        "Multi-network breakdown — one asset, one identity, sub-network detail on demand.",
      order: 40,
    },
    {
      type: "screenshot",
      file: "gallery-01.png",
      alt_text:
        "Held vs. Not-Held states of the Asset Details page sharing the same shell",
      caption:
        "Held / Not-Held — two states, one shell. Sticky Buy/Swap/Sell across both.",
      order: 70,
    },
    {
      type: "screenshot",
      file: "gallery-02.png",
      alt_text:
        "Transaction Activity screen with filters aligned to the Operator Portal taxonomy",
      caption:
        "Aligned transaction taxonomy — same labels in the app, the Recent Transactions widget, and the Operator Portal.",
      order: 75,
    },
    {
      type: "screenshot",
      file: "gallery-03.png",
      alt_text:
        "MNEE merchandising drawer surfacing when a user selects USDC in the Buy flow",
      caption:
        "MNEE merchandising lives in the flow, not the taxonomy — both remain stablecoins in the category.",
      order: 80,
    },
  ],
};

export default project;
