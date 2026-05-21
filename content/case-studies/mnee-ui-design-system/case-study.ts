import type { SeedProject } from "@/lib/case-study/seed";

const project: SeedProject = {
  slug: "mnee-ui-design-system",
  title: "MNEE UI — A Product-Led Design System",
  client: "RockWallet",
  role: "Head of Product Design",
  year: 2026,
  category: "personal",
  published: true,
  summary:
    "Shipped `@mnee-ui/ui` v0.1.1 — Figma library, npm package, docs site, and a Tailwind v4 dogfooding fork of the consumer, all owned by Product Design.",
  description:
    "End-to-end design system for MNEE merchant surfaces: Figma library as source of truth, 12 React components published to npm as @mnee-ui/ui, live docs at mnee-ui.vercel.app, and a Tailwind v4 fork of merchant-portal-frontend that dogfoods every release before it ships. Built on Tailwind v4, React 19, Next.js 15 — even though the consumer is still on v3 — and the migration is the next milestone.",
  tech_stack: [
    "Figma",
    "Tailwind CSS v4",
    "React 19",
    "Next.js 15",
    "npm",
    "lucide-react",
    "Vercel",
  ],
  metrics: {
    "Published package": "@mnee-ui/ui v0.1.1 (live on npm)",
    "Components shipped": "12 (Button → CodeBlock)",
    "Docs site": "mnee-ui.vercel.app (canonical examples = release gate)",
    "Adoption harness": "Tailwind v4 fork of merchant-portal-frontend",
  },
  og_image_file: "cover.png",
  sections: [
    {
      section_type: "text",
      heading: "A design system as a product, not a Figma library",
      content_md:
        "MNEE is a stablecoin product that ships its own merchant surfaces — a merchant portal, a Pay checkout, several embedded experiences. By early 2026 the surface area had grown faster than the supporting visual language. Different frontends were diverging on button styles, modal behaviors, table densities, and even the meaning of *\"primary.\"* Engineering was making perfectly reasonable choices in isolation, but the result felt like three different products under one name.\n\nThe MNEE merchant portal — younger, web-only, smaller team — was the right place to prove out an end-to-end model: **design library, code library, docs, and a real consumer, all owned by Product Design.** This case study is about MNEE UI: the npm package `@mnee-ui/ui`, the Figma library that drives it, and the still-in-flight adoption story in the merchant portal.",
      order: 10,
    },
    {
      section_type: "text",
      heading: "Three needs, one invisible blocker",
      content_md:
        "The merchant portal had a working design language only in Figma. Engineering reimplemented patterns per feature branch, and inconsistencies compounded with every shipped surface. We needed three things at once:\n\n1. A **published code library** so engineers stop rebuilding primitives.\n2. A **Figma library** that is genuinely the source of truth — not a stale mirror.\n3. A **tight enough feedback loop** that design changes propagate without political overhead.\n\nThe harder, less visible problem: the merchant portal was on Tailwind v3.4.18 and the engineering team didn't have bandwidth for a v4 migration. **If I built the system on v4 it wouldn't drop in. If I built it on v3 it would be obsolete on arrival.** I chose v4 anyway, and then I had to solve the adoption blocker myself.",
      order: 20,
    },
    {
      section_type: "image+text",
      heading: "Design-first, not engineer-first",
      content_md:
        "The Figma library is the source of design truth; the npm package is the code implementation of that truth. When I change a token or component, the Figma file moves first, then the code, then a new patch release goes out. This is the reverse of what most engineer-led systems do — and it works because I sit in both halves of the loop.\n\n**Hard scope line.** MNEE UI ships primitives and reusable composites — Button, Badge, Card, Input, Toast, Icons, Banner, Table, Drawer, Modal, Alert, CodeBlock. It does *not* ship anything Redux-bound or business-specific — no auth screens, no `BalanceCard`, no `TransactionRow`. Those live in product repos and consume the primitives. This rule alone has saved me a dozen judgment calls.\n\n**Deliberate tech bets the eng team hadn't ratified.** Tailwind v4. Design tokens in `app/globals.css` under the v4 `@theme {}` block. `cn()` for class merging. Variants as `Record<Variant, string>` objects, never switch statements. lucide-react for icons. No CSS-in-JS, no styled-system, no runtime theming layer. The package's only peer dep is `tailwindcss: ^4`.",
      order: 30,
    },
    {
      section_type: "image+text",
      heading: "Solving adoption without asking eng to drop work",
      content_md:
        "The part I'm proudest of: I solved the adoption blocker without asking engineering to drop anything. I cloned `merchant-portal-frontend` locally, branched off `feat/refund`, and migrated that branch to Tailwind v4.2.3 in a single commit (`2cf8f93`). That fork is now my dogfooding harness — **every component I publish gets dropped into a real screen of the real portal before I cut a release.** When engineering does eventually run the v3→v4 migration upstream, they'll have a working reference.\n\nThe docs site lives at the same URL surface as the system itself — `mnee-ui.vercel.app`. The docs aren't a separate Storybook bolted on later; they're the same Next.js 15 app that hosts the canonical examples. **New component → new docs page → new release, in the same PR.** `components/ui/` is the published package; `app/docs/` is the docs site. One repo, one source of truth, one release, no drift.",
      order: 40,
    },
    {
      section_type: "text",
      heading: "Key decisions",
      content_md:
        "- **Tailwind v4, even though the consumer is on v3.** Building backward would have meant rebuilding the system in twelve months. I absorbed the adoption cost into a product-side dogfooding fork instead.\n- **Federico publishes, not CI.** v0.1.1 is a manual `npm publish` from my machine. Deliberate at current scale — release surface tight, cadence honest. CI comes when the consumer is live upstream.\n- **Vanilla Tailwind v4, not ShadCN runtime.** The Figma file is called *\"ShadCN\"* because the primitives borrow the aesthetic, but the code has no ShadCN dependency. Less abstraction, fewer breaking changes, simpler diffs.\n- **Hard exclusion list.** Anything Redux-bound stays out: `auth/*`, `merchant/*`, `Payment/*`, `BalanceCard`, `ActionButtons`, `TransactionRow`, `TransactionDetailsModal`. These belong to the product repo, not the design system.\n- **Dual-purpose repo.** `components/ui/` is the published package; `app/docs/` is the docs site. One repo, one release, no drift.\n- **Code Connect on the roadmap, not the critical path.** I want the Figma file mapped to the npm components, but I'm not blocking shipping on it. `.figma.tsx` stubs exist; coverage is incomplete and acknowledged.",
      order: 50,
    },
    {
      section_type: "metrics",
      heading: "What shipped",
      content_md: null,
      order: 60,
    },
    {
      section_type: "gallery",
      heading: "The system in use",
      content_md: null,
      order: 70,
    },
    {
      section_type: "text",
      heading: "Reflection — refusing to wait for capacity",
      content_md:
        "The most useful thing I did was refuse to wait for engineering capacity. If I had built MNEE UI on Tailwind v3 to *\"match\"* the consumer, the system would already be on a deprecation path. Maintaining a product-side fork felt awkward at first — designers don't usually run migration branches — but it turned the adoption story from a political negotiation into a technical demo. When the eng team does pick up v4, the work is already proven.\n\nThe honest weakness: I'm the single point of failure for releases. v0.1.1 is fine; v0.5.x will need a real publish pipeline and at least one other person able to cut a release. The fix is mostly mechanical — a release-please workflow, a 2-of-N npm token policy — but I'd rather acknowledge the gap than pretend the bus factor is solved.",
      order: 80,
    },
  ],
  assets: [
    {
      type: "hero",
      file: "hero.png",
      alt_text:
        "MNEE UI system overview — Figma library on the left, the same components rendered live in the docs site on the right, and a merchant-portal screen using them in production on the far right",
      caption:
        "Figma → npm → docs → consumer. One loop, four surfaces, one owner.",
      order: 10,
    },
    {
      type: "screenshot",
      file: "process-01.png",
      alt_text:
        "Design-first workflow diagram — Figma file moves first, then the React component, then the docs page, then a patch release on npm — with the dogfooding fork sitting as the final verification step",
      caption:
        "Most engineer-led systems run this loop in reverse. Sitting in both halves of the loop is why this works.",
      order: 30,
    },
    {
      type: "screenshot",
      file: "process-02.png",
      alt_text:
        "Dogfooding harness — local fork of merchant-portal-frontend on Tailwind v4.2.3, with a freshly published @mnee-ui/ui component swapped into the refund flow before release",
      caption:
        "The adoption blocker, solved as a technical demo instead of a political negotiation.",
      order: 40,
    },
    {
      type: "screenshot",
      file: "gallery-01.png",
      alt_text:
        "Live docs site at mnee-ui.vercel.app — Button, Badge, Card, Input, Toast, Icons, Banner, Table, Drawer, Modal, Alert, CodeBlock — canonical examples in the same Next.js 15 app that ships the components",
      caption:
        "Docs are not bolted on — they're the same app that hosts the canonical examples. New component → new docs page → new release, same PR.",
      order: 70,
    },
    {
      type: "screenshot",
      file: "gallery-02.png",
      alt_text:
        "Figma library at qzjrgEgx4q7MAU9ypgwp48 — the \"ShadCN\" file that drives the npm package, with component variants, tokens, and a publish-then-code workflow",
      caption:
        "The Figma file is the source of design truth — every release starts here, not in the IDE.",
      order: 80,
    },
    {
      type: "screenshot",
      file: "gallery-03.png",
      alt_text:
        "@mnee-ui/ui v0.1.1 on npm — package listing showing peer dep tailwindcss ^4, 12 components, manual publish from Federico's machine",
      caption:
        "v0.1.1 live on npm — manual publish, deliberate at this scale. CI comes when the consumer goes upstream.",
      order: 90,
    },
  ],
};

export default project;
