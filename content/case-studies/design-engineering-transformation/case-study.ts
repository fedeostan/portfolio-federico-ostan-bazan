import type { SeedProject } from "@/lib/case-study/seed";

const project: SeedProject = {
  slug: "design-engineering-transformation",
  title: "The Design Engineering Transformation",
  client: "RockWallet",
  role: "Head of Product Design",
  year: 2025,
  category: "ai",
  published: true,
  summary:
    "Rebuilt RockWallet's design-to-code pipeline from \"Figma as reference\" to a versioned npm package — 12 components, Code Connect mapped, ~80% less UI rework.",
  description:
    "Design system shipped as a real software product. `@mnee-ui/ui` v0.1.1 on npm with twelve components in Tailwind CSS v4 + React 19, a Next.js docs site on Vercel, and Figma Code Connect mappings so a developer one-clicks from a design node into the exact code usage. A parallel system — Prometheus — covers RockWallet 2.0 with Figma libraries and native code mirrors in the iOS and Android wallet apps. Design owns publishing; the team that designs the contract is the team that ships it.",
  tech_stack: [
    "Figma",
    "Code Connect",
    "Tailwind CSS v4",
    "React 19",
    "Next.js",
    "npm",
    "Vercel",
    "lucide-react",
  ],
  metrics: {
    "Components shipped in @mnee-ui/ui v0.1.1": "12",
    "Reduction in UI rework cycles (vs. 10-month baseline)": "80–85%",
    "Prometheus roadmap phases complete": "1 / 4",
    "Owners of the publishing pipeline": "1 (design)",
  },
  og_image_file: "cover.png",
  sections: [
    {
      section_type: "text",
      heading: "One component. 14 tickets.",
      content_md:
        "For ten months the same pattern repeated inside RockWallet's product builds. A designer would finish a screen in Figma, hand it to engineering, and the screen would come back wrong. Not catastrophically — a few pixels of spacing, the wrong font weight, a color one step off the token. Each miss generated a ticket. The ticket bounced between design, dev, QA, UAT, and back. By the time the screen was \"correct,\" we'd burned weeks of cycle time on work that should have been done once.\n\nThe Jira archaeology was painful — for example, RPB-12707, lifted verbatim: *\"Asset UI in 'Your assets' widget in the homescreen is not matching with the figma.\"* That's not a bug. That's a system failure.",
      order: 10,
    },
    {
      section_type: "text",
      heading: "Why discipline can't fix it",
      content_md:
        "The pipeline assumed engineers could *interpret* Figma. Every screen handed off to a developer triggered hundreds of micro-decisions per render — which spacing token, which exact color value, which font weight, which border-radius variable. Each interpretation was a chance to drift. Multiplied across screens, builds, and platforms, drift compounded into UI inconsistency, QA noise, and an endless backlog of \"doesn't match the figma\" tickets.\n\nThe temptation is to blame execution — to ask engineers to be more careful, or to add a visual QA gate. I rejected both. The shape of the problem said something else: *it's not the team, it's the system.* When the cheapest path through the workflow produces the wrong outcome, no amount of discipline fixes it. You have to change the path.",
      order: 20,
    },
    {
      section_type: "image+text",
      heading: "A design system is a contract, not a style guide",
      content_md:
        "The thesis I kept coming back to: **a design system isn't a style guide; it's a contract.** A style guide says *here is the right spacing*. A contract says *the only spacing you can use is the right one*. If the developer has no choice, the drift can't happen.\n\nThe first move was to make the **component the spec**, not the reference. I built `@mnee-ui/ui` as a real, versioned npm package authored in Tailwind v4, with vanilla utility classes and a small set of conventions (`cn()` for class merging, `Record<Variant, string>` for variants — no switch statements, no abstractions that obscure the markup). The same repo doubles as the publishing source and the [Next.js docs site](https://mnee-ui.vercel.app/), so the artifact a developer installs is the artifact a designer can preview on the web.\n\nTwelve components shipped at v0.1.1 — Button, Badge, Card, Input, Toast, Icons, Banner, Table, Drawer, Modal, Alert, CodeBlock. Each one is QA'd by design *before* it leaves the repo. Engineering doesn't QA visuals on first integration — the component is already correct.",
      order: 30,
    },
    {
      section_type: "image+text",
      heading: "Closing the Figma-to-code loop with Code Connect",
      content_md:
        "The second move was to close the Figma-to-code loop. Code Connect mappings let a developer one-click from a Figma node into the exact code usage — `<Button variant=\"primary\" size=\"large\">Label</Button>`, with the right props pre-filled. No searching, no asking, no interpretation.\n\nThe Figma library file (named \"ShadCN\" for its primitive vocabulary — though the code uses zero ShadCN runtime) is the source of design truth; the npm package is its code mirror. Mappings aren't a \"later\" — they're shipped alongside each component, which is what makes the system non-optional in practice.\n\nWhen engineering didn't have bandwidth to migrate the consuming product (`merchant-portal-frontend`) from Tailwind v3.4.18 to v4, I refused to let adoption block. I stood up a product-owned dogfooding harness: a local clone of the portal on a working branch, upgraded with a single migration commit. The harness proved the system worked in a real consumer codebase before asking engineering to commit upstream.",
      order: 40,
    },
    {
      section_type: "text",
      heading: "Key decisions",
      content_md:
        "- **Design owns publishing.** I publish `@mnee-ui/ui` personally. The team that designs the contract is the team that ships it — there's no handoff where drift can enter.\n- **Vanilla Tailwind v4, no ShadCN runtime.** The Figma file is called \"ShadCN\" because the primitives draw from that vocabulary, but the code has zero ShadCN dependencies. Simpler, lighter, easier to maintain.\n- **Skip app-specific components.** The published package explicitly excludes Redux-bound things (auth, merchant, BalanceCard, TransactionRow). Those belong in the app. The system stays primitive; products compose on top.\n- **Code Connect from day one.** Mappings ship alongside each component, not as a follow-up. The Figma → code link is what makes the contract enforceable.\n- **Product-led dogfooding via a local v4 fork.** Rather than wait for engineering's roadmap, I stood up a private validation harness. It removed the \"but does it actually work in the portal?\" objection from every leadership conversation.\n- **Two design systems, same model.** MNEE UI for MNEE Pay (live, twelve components). Prometheus for RockWallet 2.0 (Figma + native mirrors live, web package gated on Whiteboard graduation). Same playbook, two products.\n- **Pitch the model, not the work.** The 25-slide executive deck doesn't ask leadership to admire components. It asks them to acknowledge a strategic shift in how the company ships UI — and to remove the one remaining unlock (the upstream Tailwind v4 migration).",
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
      heading: "Inside the system",
      content_md: null,
      order: 70,
    },
    {
      section_type: "text",
      heading: "Reflection — the system only works as a product",
      content_md:
        "The non-obvious lesson was that the design system only works as a *product*. The moment we treated it as a sibling deliverable to the apps that consume it — with a version number, a docs site, a publishing cadence, and an owner — most of the political friction dissolved. The technical work was the easy part. The harder part was building the artifact that lets a CEO see why this is strategic, not aesthetic.\n\nThe next phase is operationalizing the deck's ask: getting the Tailwind v4 migration onto an engineering roadmap, formalizing design ownership of the system, and graduating the first Prometheus component out of the Whiteboard into a published `@rockwallet/ui` consumed by the native apps via WebView.",
      order: 80,
    },
  ],
  assets: [
    {
      type: "hero",
      file: "hero.png",
      alt_text:
        "MNEE UI docs site at mnee-ui.vercel.app — twelve components live, Tailwind v4 + React 19",
      caption:
        "MNEE UI v0.1.1 — twelve components, published to npm, docs live on Vercel.",
      order: 10,
    },
    {
      type: "screenshot",
      file: "process-01.png",
      alt_text:
        "MNEE UI npm package — versioned components in Tailwind v4 + React 19, with the docs site as the public preview surface",
      caption:
        "The component as the spec, not the reference — `@mnee-ui/ui` as a real software product.",
      order: 30,
    },
    {
      type: "screenshot",
      file: "process-02.png",
      alt_text:
        "Figma Code Connect mapping — one-click from a Figma node into the exact code usage with props pre-filled",
      caption:
        "Code Connect closes the loop — Figma node → exact code usage, no interpretation in between.",
      order: 40,
    },
    {
      type: "screenshot",
      file: "gallery-01.png",
      alt_text:
        "MNEE UI component preview on the Vercel docs site — a primitive rendered with the same Tailwind v4 source the npm package ships",
      caption:
        "Same artifact, two surfaces — the docs site previews exactly what installs from npm.",
      order: 70,
    },
    {
      type: "screenshot",
      file: "gallery-02.png",
      alt_text:
        "Prometheus token namespace in Figma — Color, Size, Space, font-weight, composite Body styles for RockWallet 2.0",
      caption:
        "Prometheus tokens — the second pillar, with code mirrors in the iOS and Android wallet apps.",
      order: 75,
    },
    {
      type: "screenshot",
      file: "gallery-03.png",
      alt_text:
        "Product Whiteboard PWA running on iPhone via Add-to-Home-Screen — branch-deploy preview URLs with mocked data",
      caption:
        "Product Whiteboard — the staging area where Prometheus components mature before they graduate into @rockwallet/ui.",
      order: 80,
    },
    {
      type: "screenshot",
      file: "gallery-04.png",
      alt_text:
        "Design System Initiative executive deck — the strategic narrative that frames the system as a company-wide shift, not a design deliverable",
      caption:
        "The pitch — 25 slides that turn this from \"design did some work\" into a measurable strategic shift.",
      order: 85,
    },
  ],
};

export default project;
