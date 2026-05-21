import type { SeedProject } from "@/lib/case-study/seed";

const project: SeedProject = {
  slug: "mnee-pay-platform",
  title: "MNEE Pay: Stablecoin Payments Platform",
  client: "RockWallet",
  role: "Head of Product Design",
  year: 2024,
  category: "mobile",
  published: true,
  summary:
    "RockWallet's stablecoin payments platform — merchant portal, consumer QR flows, and the payment-session contract that every surface compiles to.",
  description:
    "Head of Product Design on MNEE Pay — RockWallet's merchant stablecoin payments platform. Designed the Merchant Portal IA (Get paid · Move money · Manage · Understand), consumer QR flows (Phase 1 static → Phase 2 dynamic), refunds as a first-class surface, and the cross-product receipt pattern. Built on Fireblocks, 2-of-3 SSS custody, WebAuthn passkeys, Stripe gateway, ERC-20 + 1Sat Ordinals, 0.99% merchant fee.",
  tech_stack: [
    "Figma",
    "Fireblocks",
    "2-of-3 Shamir's Secret Sharing",
    "WebAuthn / Passkeys",
    "Stripe",
    "ERC-20",
    "1Sat Ordinals",
    "Cross River Bank",
    "Borderless",
  ],
  metrics: {
    "Merchant fee": "0.99% · no chargebacks · no PCI",
    "Payment-session states designed": "8 (awaiting → completed + failed/expired/refunded)",
    "Merchant Portal IA jobs": "4 (Get paid · Move money · Manage · Understand)",
    "MNEE in circulation (late 2025)": "~$100M",
  },
  og_image_file: "cover.png",
  sections: [
    {
      section_type: "text",
      heading: "A new settlement rail, not a crypto payment processor",
      content_md:
        "MNEE Pay is RockWallet's stablecoin payments platform — a merchant-facing product that lets businesses accept any major stablecoin on any major chain and settle in a single normalized asset: **MNEE**, our own USD-backed stablecoin. The thesis is simple to state and hard to build: legacy card networks (Visa, Mastercard, the interchange tax, the chargeback regime, the PCI overhead) are an aging settlement rail, and stablecoins are the next one.\n\nMNEE Pay positions us not as a *\"crypto payment processor\"* sitting on the side of the real payments stack, but as a new settlement rail that intends to coexist with — and over time replace — that stack. The MNEE token itself has been live since July 2024 (ERC-20 + 1Sat Ordinals, 1:1 backed by US Treasuries and cash, Delaware money-transmitter licensed, GENIUS Act compliant, attested monthly by Wolfe & Co., ~$100M in circulation by late 2025). I joined this work when the question changed from *\"is the stablecoin real?\"* to *\"what does the merchant actually see, click, and trust?\"*",
      order: 10,
    },
    {
      section_type: "text",
      heading: "Three users, three interfaces, one contract",
      content_md:
        "A stablecoin payments platform has three completely different users and three completely different interfaces:\n\n1. **The merchant** — needs to integrate MNEE Pay into an existing tech stack (Stripe gateway, Clover POS, online checkout, retail QR) with as little engineering work as possible. The High-Level Requirements doc says it plainly: *\"for MNEE Pay to be successful, it needs to be easy for merchants to integrate MNEE Pay into their existing technology stack with no coding required.\"*\n2. **The consumer** — needs to pay with any stablecoin (USDC, USDT, PYUSD, DAI…) on any chain (Solana, Optimism, Tron, Base, Arbitrum, 1Sat Ordinals…) and not have to think about any of that.\n3. **The operator** — needs to monitor a payment-session state machine across thousands of merchants and millions of sessions, with refunds, partial refunds, settlement webhooks, OFAC screening, and an attribution ledger that survives a primary-DB outage.\n\nLayered on top: the Merchant Portal had to be a real product surface (not a developer dashboard), and the consumer surface had to live across QR codes, POS terminals, gateway redirects, and the RockWallet retail app itself.",
      order: 20,
    },
    {
      section_type: "image+text",
      heading: "Payment Session as the design contract",
      content_md:
        "I started from the *payment session* as the canonical object — same as the architecture team. Every design decision had to be representable as a state of that object, from an agreed set: `awaiting payment → on-chain pending → confirmed → settled → completed`, plus `failed`, `expired`, and `refunded`. **If a screen couldn't be mapped to a session state, it didn't ship.**\n\nThat contract is what lets the merchant portal, the consumer QR flow, the RockWallet retail app, and the operator's session list all show the same truth without any of them owning it. The session is the source; the surfaces are projections.\n\nRefunds (full and partial, up to 3 per transaction, always to the original wallet/token/network, refund fee covers our gas) became their own first-class flow rather than a button buried in transaction detail. That's the contract paying off: a refund is just *one more state of the session*, not a parallel system.",
      order: 30,
    },
    {
      section_type: "image+text",
      heading: "Merchant Portal IA — four jobs, not a dev dashboard",
      content_md:
        "For the Merchant Portal I structured the IA around four jobs:\n\n- **Get paid** — modules (checkout configurations) + the payment session list\n- **Move money** — settlement, withdraw to MNEE wallet, optional off-ramp to Cross River Bank (US) or Borderless (international)\n- **Manage** — refunds, disputes, receipts, API keys, webhooks\n- **Understand** — analytics, reporting, exports\n\nThat framing replaced what was originally a much more developer-y *\"API docs and a transactions list\"* layout. The result reads as a product a CFO can navigate, not a console an engineer logs into.\n\nFor the consumer side I leaned into the simplest possible surface: a QR code or a checkout button that resolves to a payment session, and a wallet-side confirmation step. **Phase 1 of QR Payments is static** (one address per merchant module) — pilotable without any real-time backend round-trip. **Phase 2 is dynamic** (a unique session per scan) — hardened only after the session infra was proven.\n\nFor the cross-product handoff I designed the *merchant receipt* surface as a doubling: a record of purchase for the consumer who paid with a non-RockWallet wallet, and a gentle marketing surface that points them toward the RockWallet app. Receipts as a growth driver, not just a record.",
      order: 40,
    },
    {
      section_type: "text",
      heading: "Key decisions",
      content_md:
        "- **Payment Session as the design contract.** If it isn't a state, it isn't a screen.\n- **Static QR before dynamic QR.** Ship a pilotable surface first; harden the session-per-scan model second.\n- **Refunds are first-class.** Up to 3 partials per transaction, always to the original wallet/token/network, refund fee covers gas. Don't bury them.\n- **Settlement asset is always MNEE.** Merchants accept many stablecoins, receive one. Don't make merchants think about chains.\n- **Receipts as a growth surface.** Cross-product, not just a record of purchase.\n- **Passkeys for outbound, not inbound.** Receiving doesn't need biometrics; sending/refunding/withdrawing does. Every outbound payout = a passkey prompt.\n- **Merchant Portal IA = four jobs.** Get paid / Move money / Manage / Understand. Replaces dev-dashboard mental model.\n- **Merchant Account Level Gamification reuses the retail Levels framework.** Same Octalysis frame, different milestones (volume, refund rate, KYB completion). One pattern across two products.",
      order: 50,
    },
    {
      section_type: "metrics",
      heading: "Platform shape at MVP",
      content_md: null,
      order: 60,
    },
    {
      section_type: "gallery",
      heading: "Surfaces across the platform",
      content_md: null,
      order: 70,
    },
    {
      section_type: "text",
      heading: "Reflection — the receipt took more design than the homepage",
      content_md:
        "The biggest tension across this work has been resisting feature-creep into *\"let's also be a card network.\"* We're not. The discipline of saying *\"MNEE Pay is settlement infrastructure plus a thin merchant surface, not a vertically integrated payments company\"* has shaped almost every design call I've made — especially around what *not* to put in the Merchant Portal at MVP (no advanced analytics dashboards, no marketing campaign tooling, no POS device management). Every one of those is a real future product; none of them is MVP.\n\nThe thing I underestimated: how much design work the *receipt* would take. A receipt is the only surface that touches every payment, every consumer, every merchant — RockWallet user or not. Treating it as a marketing/growth/compliance/UX object simultaneously meant it ended up with more careful thinking than the Merchant Portal homepage.\n\nThe thing I'm proud of: a merchant integrating MNEE Pay through Stripe doesn't need to know that any of this stablecoin infrastructure exists. They get a 0.99% fee, no chargebacks, money in their MNEE wallet, optional off-ramp to USD. That's the whole pitch, and the UX honors it.",
      order: 80,
    },
  ],
  assets: [
    {
      type: "hero",
      file: "hero.png",
      alt_text:
        "MNEE Pay platform overview — Merchant Portal dashboard alongside the consumer QR payment flow, both rendering the same payment-session state",
      caption:
        "One contract, many surfaces — the Merchant Portal and the consumer QR flow both project from the same payment session.",
      order: 10,
    },
    {
      type: "screenshot",
      file: "process-01.png",
      alt_text:
        "Payment-session state machine — awaiting payment → on-chain pending → confirmed → settled → completed, plus failed / expired / refunded — annotated with which surface owns each transition",
      caption:
        "If a screen couldn't be mapped to a session state, it didn't ship. The session is the source; the surfaces are projections.",
      order: 30,
    },
    {
      type: "screenshot",
      file: "process-02.png",
      alt_text:
        "Merchant Portal IA — Get paid, Move money, Manage, Understand — replacing the original developer-dashboard layout of API docs and a transactions list",
      caption:
        "Four jobs, not a dev dashboard — a product a CFO can navigate, not a console an engineer logs into.",
      order: 40,
    },
    {
      type: "screenshot",
      file: "gallery-01.png",
      alt_text:
        "Consumer QR payment flow — Phase 1 static QR scan → wallet selection → session confirmation → completed receipt — across multiple wallet brands",
      caption:
        "Static QR before dynamic — pilotable on day one, no real-time backend round-trip required.",
      order: 70,
    },
  ],
};

export default project;
