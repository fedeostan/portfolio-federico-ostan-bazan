import type { SeedProject } from "@/lib/case-study/seed";

const project: SeedProject = {
  slug: "everything-is-a-trade",
  title: "Everything Is a Trade — One Architecture for Every Value Transfer",
  client: "RockWallet",
  role: "Head of Product Design",
  year: 2025,
  category: "mobile",
  published: true,
  summary:
    "Reframed Buy / Sell / Swap as one act — Trade — under a single component, a single confirmation surface, and a from/to abstraction the future ships into.",
  description:
    "Architectural reframe of RockWallet 2.0's transactional surface — Buy, Sell, Swap, and future P2P / portfolio / bank transfers all share one flow, one confirmation surface, and one from/to abstraction. UI and Trade Orchestration backend align to the same contract. Cost-to-add a new trade type drops from a new flow to a configuration. \"Is this a Trade?\" is now the framing question across the company.",
  tech_stack: [
    "Figma",
    "Prometheus design system",
    "iOS",
    "Android",
    "Trade Orchestration backend",
  ],
  metrics: {
    "Trade types shipped in V1": "3 (Buy · Sell · Swap)",
    "Trade types unblocked": "4+ (P2P · portfolio-to-portfolio · bank on/off-ramp · scheduled)",
    "Confirmation surfaces collapsed": "5 → 1 (parameterized)",
    "Cost-to-add a new trade type": "Configuration, not new flow",
  },
  og_image_file: "cover.png",
  sections: [
    {
      section_type: "text",
      heading: "Five flows, one act",
      content_md:
        "Every wallet on the market does the same thing differently. *Buy* lives in one flow with one set of screens, one confirmation pattern. *Sell* lives in another. *Swap* in a third. Send-to-an-address is a fourth. Receive is a fifth. Inside the product, each is owned by a different feature team with a different mental model. **To the user, they're all conceptually the same act**: *I am moving value from one place to another, and I'd like to know what I'm getting on the other side.* The product was forcing the user to learn five different versions of one idea.\n\nDuring the RW2.0 rebuild I introduced a unifying concept across the entire wallet: **Everything Is a Trade.** Buy, sell, swap, future portfolio-to-portfolio transfers, future bank-to-wallet movements, future person-to-person transfers — all share one flow, one set of components, one confirmation pattern, one error vocabulary. They look the same. They behave the same. **The only thing that changes is the two values on the ends of the trade.**",
      order: 10,
    },
    {
      section_type: "text",
      heading: "Three taxes — user, team, company",
      content_md:
        "Three things were broken about the old model.\n\n**The user was paying a tax.** Crossing from one type of transaction to another — say from buying with a credit card to swapping between two crypto assets — meant relearning the flow. Different confirmation screens, different spread disclosure, different error states, different button labels, different placement of the primary action. The cognitive load showed up in the funnel: drop-off on the *second* transaction was higher than on the first, because the second was usually a different type and the muscle memory didn't transfer.\n\n**The product team was paying a worse tax.** Five flows meant five Figma files, five sets of edge cases, five copy reviews, five rounds of error-state design, five QA matrices. Every change to spread display, or compliance disclosure, or confirmation pattern had to be made five times — and inevitably wasn't, so the flows drifted further apart. We were spending design and engineering cycles maintaining inconsistency.\n\n**The company was capped by it.** The roadmap had ambitions the old architecture couldn't support without writing each one as a brand-new flow: portfolio-to-portfolio transfers, P2P sends, bank on/off-ramps, MNEE Pay-to-wallet movements, scheduled trades. Every one would have shipped as a new feature with new screens. Untenable.",
      order: 20,
    },
    {
      section_type: "image+text",
      heading: "From · Rail · To — the mental model",
      content_md:
        "The mental model I started from: **every action in this product is the movement of value from a `from` to a `to`.** Buy is a trade from fiat (via a vendor) to crypto. Sell is a trade from crypto to fiat. Swap is a trade between two cryptos. A future portfolio transfer is a trade from one of your accounts to another. A future P2P send is a trade from your account to someone else's. A future bank transfer is a trade from your wallet to your bank.\n\nThe only meaningful variables in any of these are: **what is on the left, what is on the right, what does the rail in the middle cost, and what does the user see when it lands.**\n\nOnce I framed the model that way, the design followed quickly. The flow is a single screen with three regions: a **from selector**, a **to selector**, and an **amount + rate disclosure** strip between them. The user picks two ends and an amount; the system calculates and shows the trade preview; one tap commits. The confirmation surface — glassmorphic, full-bleed, the moment of clarity before the user signs — is the same regardless of whether they're buying with Sardine, swapping inside the wallet, or selling out to a vendor.",
      order: 30,
    },
    {
      section_type: "image+text",
      heading: "Parameterization + naming — why the architecture stuck",
      content_md:
        "The detail work was in the parameterization. Different trade types have different disclosures (spread vs. fee vs. exchange rate), different rate-refresh cadences, different verification gates (Passkeys may or may not be required), different vendor brands to surface in fine print. I designed a **slot system** inside the unified component so each trade type plugs its specific disclosures into the same physical shape. The user sees one pattern. The system serves five. The product team designs one component and configures it five ways.\n\n**The naming work mattered.** Calling it *\"Everything Is a Trade\"* gave the concept teeth. Engineers, PMs, compliance reviewers, and marketers all use the phrase now. When a new feature is proposed, the first design question is *\"is this a Trade?\"* — and if it is, it inherits the architecture instead of inventing a new one. **Naming the idea made it transferable across the company, and that's what makes it durable.**\n\nThe **from / to selector** is the load-bearing abstraction. It doesn't care whether the slot is a fiat balance, a crypto holding, a portfolio, another user (future), or a bank account (future). It surfaces whichever value-bearing endpoints the current user is authorized to use. This is the wedge that lets future transfer types ship as **configuration, not as new flows.**",
      order: 40,
    },
    {
      section_type: "text",
      heading: "Key decisions",
      content_md:
        "- **Frame every value movement as a Trade.** Not as *\"Buy,\" \"Sell,\"* or *\"Swap\"* first. The verbs become surfaces *of* a Trade, not separate flows.\n- **One confirmation surface, parameterized.** The glassmorphic confirm screen is the same physical component for every trade type. Disclosures, vendor brands, and verification gates slot in.\n- **From / To as an abstraction over endpoints.** The selector treats *\"your USD balance,\" \"your MNEE balance,\" \"a credit card via Sardine,\" \"your bank account,\" \"another user,\"* and *\"another of your portfolios\"* as the same kind of thing — endpoints. Today three exist. Tomorrow the rest plug in without new screens.\n- **One vocabulary across compliance, copy, and motion.** Spread, rate refresh, error states, success states, and the disclosure footer share a single language. Compliance reviews one model, not five.\n- **Name the concept.** *\"Everything Is a Trade\"* travels through the company. It's now the framing question at the start of every new transactional feature.\n- **Don't ship the future types prematurely.** P2P, portfolio-to-portfolio, and bank-to-wallet do not ship in V1 — but the architecture they need does. The harder thing is preserving optionality without paying for unused complexity. I designed in the *shape* of these future endpoints without exposing them.",
      order: 50,
    },
    {
      section_type: "metrics",
      heading: "Architectural leverage",
      content_md: null,
      order: 60,
    },
    {
      section_type: "gallery",
      heading: "One surface, many trades",
      content_md: null,
      order: 70,
    },
    {
      section_type: "text",
      heading: "Reflection — the politics, not the design",
      content_md:
        "The hardest part of this project wasn't the design — it was the politics. Different teams owned Buy, Sell, and Swap before unification, and merging conceptually-similar flows under one banner meant rearranging some org-chart edges. **The work that made the architecture stick was less *\"drawing components\"* and more *\"running enough alignment conversations that everyone agreed the wallet is making one promise, not five.\"***\n\nWhat I'd do differently: publish the architectural concept *earlier*. I introduced it well into the RW2.0 rebuild, after we'd already designed Buy and Sell separately. If I'd led with the concept and worked outward into the verbs, the convergence would have cost less and the V1 surface area would have been cleaner. **Lesson: when an architectural reframe is available, name it first and design second.**",
      order: 80,
    },
  ],
  assets: [
    {
      type: "hero",
      file: "hero.png",
      alt_text:
        "RockWallet 2.0 trade flow — single screen with a from selector, an amount + rate disclosure strip, and a to selector, with the glassmorphic confirmation surface beneath — the same physical component shown configured as Buy, Sell, and Swap",
      caption:
        "One surface, three configurations. Same flow, same confirmation, same vocabulary — the only thing that changes is the endpoints.",
      order: 10,
    },
    {
      type: "screenshot",
      file: "process-01.png",
      alt_text:
        "From · Rail · To mental model diagram — every transactional action expressed as two endpoints (fiat balance, crypto holding, portfolio, bank, another user) with a rail in between (vendor, on-chain, internal ledger) and a single trade contract on top",
      caption:
        "Every action is the movement of value from a `from` to a `to`. Buy, Sell, Swap, P2P, bank — same shape, different endpoints.",
      order: 30,
    },
    {
      type: "screenshot",
      file: "process-02.png",
      alt_text:
        "Slot system inside the unified confirmation component — disclosures (spread / fee / exchange rate), rate-refresh cadence, verification gate (Passkeys optional), and vendor brand fine print all plug into the same physical shape",
      caption:
        "The user sees one pattern. The system serves five. The product team designs one component and configures it five ways.",
      order: 40,
    },
    {
      type: "screenshot",
      file: "gallery-01.png",
      alt_text:
        "Buy, Sell, and Swap configurations of the same unified Trade component side by side — identical layout and motion, different endpoints and disclosures, identical confirmation moment",
      caption:
        "Three trade types, one component. The future trade types (P2P, portfolio, bank) plug into the same slots without new flows.",
      order: 70,
    },
  ],
};

export default project;
