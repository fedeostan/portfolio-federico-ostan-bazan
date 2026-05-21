import type { SeedProject } from "@/lib/case-study/seed";

const project: SeedProject = {
  slug: "the-redesign",
  title: "The Redesign — Modernizing RockWallet Without Losing the Brand",
  client: "RockWallet",
  role: "Head of Product Design",
  year: 2025,
  category: "mobile",
  published: true,
  summary:
    "Rebuilt every surface of RW2.0 against a new visual thesis — dark-by-default, glassmorphism as depth, high contrast as language — without touching the brand customers already trusted.",
  description:
    "Top-to-bottom visual redesign of RockWallet 2.0 — dark-by-default canvas, glassmorphism applied as a depth language (not decoration), high-contrast tabular type, one saturated brand accent. Brand untouched, system rebuilt underneath. Used as cover for five major flow rebuilds (onboarding, unified Trade, asset model, Levels, geofencing) that would have been hard to fund individually.",
  tech_stack: [
    "Figma",
    "Prometheus design system",
    "iOS",
    "Android",
  ],
  metrics: {
    "Visual thesis pillars": "3 (dark-by-default · glass-as-depth · high-contrast type)",
    "Flow rebuilds shipped under the umbrella": "5 (onboarding · Trade · assets · Levels · geofencing)",
    "Brand identity touched": "0 (logo · palette · name · voice — untouched)",
    "Rollout": "Cohorted, framed as refresh — no measurable brand confusion",
  },
  og_image_file: "cover.png",
  sections: [
    {
      section_type: "text",
      heading: "RW 1.0 worked. It just looked like 2022.",
      content_md:
        "RockWallet 1.0 was a competent wallet. It worked, it was secure, it had a roadmap. **What it didn't do was look like itself in 2026.** The crypto category had matured around it. The competitors that mattered — Coinbase, Robinhood Crypto, the next wave of stablecoin-first wallets — all carried a visual confidence that signalled scale, trust, and money-grade seriousness. RockWallet, by comparison, read as a 2022 fintech app that had aged in place. Same product, same brand, but a UI that quietly undersold what the company had become.\n\nI led a top-to-bottom redesign of the entire product as part of the RW2.0 rebuild. Every surface, every screen, every component. The constraint I set from day one: ***we don't relaunch the brand, we re-render it.*** Customers needed to recognize the product. Regulators, partners, and the board needed to feel a step change. That tension — continuity for the existing user, transformation for everyone else — was the design problem.",
      order: 10,
    },
    {
      section_type: "text",
      heading: "Three things were capping growth",
      content_md:
        "1. **Perceived value was below actual value.** RockWallet had matured into a multi-product platform — wallet, trading, MNEE Pay, custody, regional regulatory work — but the UI still presented like a simple consumer wallet. Sophisticated users were undersold; institutional partners were unimpressed. The aesthetic was capping growth.\n2. **The visual language was inconsistent surface-to-surface.** Different generations of features had been added by different teams against drifting Figma references. Spacing, type hierarchy, button treatment, surface elevation — none of it was systematized. The product looked like it had been built in pieces, because it had been.\n3. **The category had moved.** Glassmorphism, soft surfaces with deliberate light handling, restrained color, high-contrast type, and confident negative space had become the visual vocabulary of premium fintech and crypto. **Standing still meant looking dated.**",
      order: 20,
    },
    {
      section_type: "image+text",
      heading: "Three pillars — dark · glass · contrast",
      content_md:
        "The strategic frame was simple: **keep the brand, raise the floor.** Logo, primary palette, name, voice — untouched. Everything below the brand line — type system, surfaces, components, motion, density, contrast posture — rebuilt from zero against three pillars.\n\n**One: darker, by design.** The 1.0 product defaulted to a mid-tone background that felt neither light nor dark — characteristic of fintech apps optimized for the screenshot store. I moved the default to a deep, near-black background with carefully tuned warm undertones. Dark mode wasn't a setting; it became the canonical experience. The rationale was perceptual and commercial in equal measure: **darker backgrounds read more expensive, more serious, more *\"money on the table.\"***\n\n**Two: glassmorphism, applied with restraint.** Translucent cards, blurred backdrops, subtle inner highlights — but reserved for elements that should feel suspended: action sheets, modals, the Trade confirmation surface, the balance card. Inline components stayed solid. **Done well, glassmorphism is a depth language, not a style.**\n\n**Three: high contrast, against the dark.** High-contrast white for primary text, deliberate grayscale steps for hierarchy, a single saturated brand accent for action. No softened greens, no muted CTAs. Numbers — balances, prices, deltas — typeset in a tabular variant of the system face so columns align at a glance. **Money should look like money.**",
      order: 30,
    },
    {
      section_type: "image+text",
      heading: "Use the redesign as cover to fix the flows",
      content_md:
        "The fourth, less visible pillar was that I used the redesign as cover to improve every flow underneath it. **When you're already rebuilding the surface, fixing the funnel costs almost nothing extra.** So I shipped, in parallel:\n\n- A routed KYC onboarding\n- A unified Trade architecture (*Everything Is a Trade*)\n- A reworked asset/category model\n- A gamified Levels system\n- The geofencing model for regional restriction\n\nThe redesign isn't only *\"RW1 looks different now.\"* It's *\"every flow you do every day now works the way it should have worked from the start.\"*\n\nThe rollout was deliberately conservative. Existing users moved over in cohorts. Push notifications and in-app prompts framed it as a refresh, not a relaunch. Marketing landed the visual story in App Store screenshots, press placements, and the affiliate program around the public launch. **Nobody woke up to a new product they didn't recognize.** The strategic message was continuity; the actual delivery was transformation.",
      order: 40,
    },
    {
      section_type: "text",
      heading: "Key decisions",
      content_md:
        "- **Brand untouched, system rebuilt.** Logo and primary palette stayed. The visual rebuild happened *underneath* the brand line, not on top of it. This is what let the redesign feel like the same RockWallet that customers already trusted, while everything else about the experience changed.\n- **Dark-by-default, not dark-as-mode.** Light mode is now the alternate, not the canonical view. A perception bet: dark UI reads more premium in crypto and gives glassmorphism the canvas it needs.\n- **Glassmorphism as a depth language, not decoration.** Frosted surfaces reserved for elements that should feel elevated. Inline components stay solid. The rule keeps the system from descending into Y2K nostalgia.\n- **One saturated accent, used sparingly.** A single brand accent does all the heavy lifting for action. Explicitly does *not* multi-color CTAs by feature — that pattern erodes brand and confuses hierarchy.\n- **Tabular numerics everywhere money is shown.** Balances, prices, deltas, percentages use a tabular variant so columns align without manual adjustment.\n- **Ship the redesign and the flow improvements together.** The redesign was political cover to fix what the old flows couldn't easily get budget for. Onboarding, Trade, asset categories, Levels, geofencing — all rebuilt in parallel.\n- **Cohort rollout, not big-bang.** Existing users moved in waves. Marketing framed it as a refresh. Strategic message: continuity. Actual delivery: transformation.",
      order: 50,
    },
    {
      section_type: "metrics",
      heading: "Redesign in numbers",
      content_md: null,
      order: 60,
    },
    {
      section_type: "gallery",
      heading: "Surfaces, before and after",
      content_md: null,
      order: 70,
    },
    {
      section_type: "text",
      heading: "Reflection — the harder version was the right version",
      content_md:
        "The strongest move in this project was *refusing* to relaunch the brand. The redesign would have been **less ambitious to defend** — a clean break, a new logo, a press cycle — but it would have cost the company the trust it had spent years building. **The harder version, where everything below the brand line changes and the brand stays, is the version that actually lifts the product without breaking the customer relationship.**\n\nWhat I'd do differently: invest earlier in the motion language. The static system is strong; the motion grammar around it (how surfaces enter, how glass reveals, how the Trade confirmation animates) lagged the rest of the work and got finalized later than it should have. **Motion is where premium products feel premium.** Next iteration starts there.",
      order: 80,
    },
  ],
  assets: [
    {
      type: "hero",
      file: "hero.png",
      alt_text:
        "RockWallet 2.0 redesign — dark-by-default home dashboard with the glassmorphic balance card suspended above the deep near-black background, high-contrast tabular numerics, single saturated brand accent on the primary action",
      caption:
        "Dark · glass · contrast. Three pillars of a visual thesis that raises the floor without touching the brand.",
      order: 10,
    },
    {
      type: "screenshot",
      file: "process-01.png",
      alt_text:
        "Three-pillar visual system diagram — dark canvas as the substrate, glassmorphism layers reserved for elevated surfaces (modals, action sheets, Trade confirmation, balance card), high-contrast type with tabular numerics for money",
      caption:
        "Dark as canvas · glass as depth · contrast as language. Pillars composed, not stacked.",
      order: 30,
    },
    {
      type: "screenshot",
      file: "process-02.png",
      alt_text:
        "The redesign as cover — five flow rebuilds shipped under the visual umbrella (KYC onboarding routing, Everything Is a Trade architecture, asset/category model, Levels gamification, geofencing) each annotated with where the redesign created the political space to do the deeper work",
      caption:
        "Rebuild the surface, fix the funnel underneath. Five flow rebuilds that would have been hard to fund individually.",
      order: 40,
    },
    {
      type: "screenshot",
      file: "gallery-01.png",
      alt_text:
        "Before-and-after — RW1.0 mid-tone background, multi-color CTAs, inconsistent type hierarchy on the left; RW2.0 deep near-black, single saturated accent, tabular numerics, glass-elevated balance card on the right",
      caption:
        "Continuity for the existing user. Transformation for everyone else. The same RockWallet, finally looking like itself.",
      order: 70,
    },
    {
      type: "screenshot",
      file: "gallery-02.png",
      alt_text:
        "Trade confirmation surface — glassmorphic, full-bleed, the moment of clarity before the user signs — applied uniformly across Buy, Sell, and Swap",
      caption:
        "Glass reserved for the moments that should feel suspended — the Trade confirmation is the canonical example.",
      order: 80,
    },
    {
      type: "screenshot",
      file: "gallery-03.png",
      alt_text:
        "Asset detail and transaction history rendered against the dark canvas — tabular numerics aligning column-to-column, single saturated brand accent on the primary action, deliberate grayscale steps for hierarchy",
      caption:
        "Money should look like money. Tabular numerics so columns align without manual adjustment.",
      order: 90,
    },
    {
      type: "screenshot",
      file: "gallery-04.png",
      alt_text:
        "Onboarding sequence in the new visual system — KYC routing inherits the dark canvas, glass-elevated progress moments, and the single saturated accent for the primary CTA throughout the flow",
      caption:
        "Onboarding rebuilt under the redesign umbrella — same system, same accent, same money-grade posture as the rest of the product.",
      order: 100,
    },
  ],
};

export default project;
