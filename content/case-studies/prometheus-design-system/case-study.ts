import type { SeedProject } from "@/lib/case-study/seed";

const project: SeedProject = {
  slug: "prometheus-design-system",
  title: "Prometheus — RockWallet's Design System Foundation",
  client: "RockWallet",
  role: "Head of Product Design",
  year: 2025,
  category: "personal",
  published: true,
  summary:
    "RockWallet's cross-platform design-system foundation — Figma as canonical, native code as mirrors, and a Product Whiteboard PWA that keeps every component honest.",
  description:
    "Prometheus — RockWallet's cross-platform design system. Figma Variables as canonical, Jetpack Compose + SwiftUI as native mirrors, a Next.js 16 / Tailwind v4 Product Whiteboard PWA as the on-device incubator. Components graduate to @rockwallet/ui only after 2+ flows. The discipline of *not* shipping the npm package on day one.",
  tech_stack: [
    "Figma Variables",
    "Code Connect",
    "Jetpack Compose",
    "SwiftUI",
    "Tailwind CSS v4",
    "Next.js 16",
    "Vercel",
    "npm",
  ],
  metrics: {
    "Platforms in scope": "4 (Figma · Android · iOS · web)",
    "Phased roadmap": "Canvas → npm seed → Native WebView → Code Connect",
    "Graduation criterion": "Used in 2+ canvas flows",
    "PWB canvas shipped in": "1 day (2026-04-28)",
  },
  og_image_file: "cover.png",
  sections: [
    {
      section_type: "text",
      heading: "A design system is a contract, not a Figma file",
      content_md:
        "RockWallet ships native iOS and Android wallets plus a growing set of web surfaces. For years the visual language lived in designers' heads and a few drift-prone Figma files. As the team scaled and **RockWallet 2.0** came into view, that informal model started costing real money — every cross-platform feature began with rediscovering tokens, redrawing the same button, and arguing about spacing.\n\nPrometheus is the system that ends that. It currently exists as a pair of Figma libraries with first-class token variables, with native code mirrors in the wallet apps and a deliberately staged plan for the web layer. The companion initiative — the **Product Whiteboard (PWB) canvas** — is where future web components are born before they graduate into a published `@rockwallet/ui` npm package. **A design system isn't a Figma file; it's a contract** — and the Prometheus contract has to hold across four platforms and survive product velocity.",
      order: 10,
    },
    {
      section_type: "text",
      heading: "Four problems, four fault lines",
      content_md:
        "Specifically:\n\n1. **No single source of truth.** Tokens lived in code on Android and iOS but were re-keyed by hand into Figma. Drift was constant.\n2. **No web implementation.** Web surfaces were ad-hoc, often borrowing styles from whichever native app the engineer had open last.\n3. **No place to *try* components before committing.** Designers had nowhere to test a new pattern on an actual phone, in actual fingers, before asking native engineering to build it.\n4. **No clear path from Figma to code.** Code Connect existed in theory; no one had wired it.",
      order: 20,
    },
    {
      section_type: "image+text",
      heading: "Tokens first, because tokens compose",
      content_md:
        "I started with the tokens because tokens compose. **Color first, then Space, then Size, then font weight and letter spacing.** I refused composite text styles until the primitives were stable, and I refused components until composite styles were stable. The order matters: every component change you make before tokens are settled costs you twice.\n\nSecond, I drew the cross-platform map honestly. Android and iOS already had token files. Rather than overwrite them, I treated them as code mirrors of the Figma library — **the Figma is canonical, the native files conform.** For web I made the harder call: don't even *try* to mirror until there's a real React surface that can prove the tokens work in CSS. Until that exists, the PWB canvas seeds `styles/tokens.css` from the Android values as a temporary bridge.\n\nThe verified token namespace: `Color/*`, `Size/*`, `Space/*`, `font-weight/*`, `letter-space/*`, plus composite text styles like `Body/Small` — all confirmed via the Figma MCP `get_variable_defs` API.",
      order: 30,
    },
    {
      section_type: "image+text",
      heading: "The Product Whiteboard — incubator, not graveyard",
      content_md:
        "The Product Whiteboard canvas is a frontend-only **Next.js 16 PWA on Tailwind v4** that lives at a public Vercel URL. The whole point is that designers can push a branch, get a preview URL, install it on their phone via Add-to-Home-Screen, and **iterate on a real device**. No real APIs, no auth, no tests, no backend — those would all be distractions. Just an installable canvas with mocked data and empty slots for flows and components.\n\nShipped in a single day on 2026-04-28: dark-only, installable on iOS Safari and Android Chrome, pull-to-refresh and safe-area padding added the same day after the first phone install.\n\n**The graduation criterion is what makes this work.** A component graduates into `@rockwallet/ui` only after it's been used in *two or more flows* inside the canvas. This is the rule that prevents `@rockwallet/ui` from becoming yet another graveyard of speculative components. Every `flow/<name>` or `component/<name>` branch gets its own preview URL and QR code. The PR label `ready-for-ds` is the signal to graduate.",
      order: 40,
    },
    {
      section_type: "text",
      heading: "Key decisions",
      content_md:
        "- **Figma is canonical.** Variables in the Prometheus DS file are the source of truth; native and web token files are mirrors. Enforced by review, not tooling — and that's fine for now.\n- **Build the canvas before the npm package.** I refused to start `@rockwallet/ui` until we had a place to incubate components on real phones. Order: canvas → component used in 2+ flows → graduate to npm → native apps consume via WebView.\n- **Dark-only, English-only, no real APIs in the canvas.** Hard scope rules. Every *\"just a login screen\"* request gets pointed at the rules doc.\n- **Vercel branch previews as the install loop.** Branch push → preview URL → QR code → on-device. The PR label `ready-for-ds` is the graduation signal.\n- **CSS variables, never hardcoded hex.** Enforced in the canvas's CLAUDE.md. Tokens come from `styles/tokens.css`, full stop.\n- **Code Connect deferred to Phase 4.** I want it; I won't gate component delivery on it.\n- **Native WebView is the long-term distribution path.** Phase 3 installs `@rockwallet/ui` inside iOS `WKWebView` and Android `WebView` so the web layer becomes a shared rendering surface for the wallet apps — without a full RN/Compose rewrite.\n- **Prometheus and MNEE UI are separate systems.** They share patterns (Tailwind v4, `cn()`, variant records, Federico publishes) but they are not the same library and not on the same release train. Conflating them would have slowed both.",
      order: 50,
    },
    {
      section_type: "metrics",
      heading: "What exists today",
      content_md: null,
      order: 60,
    },
    {
      section_type: "gallery",
      heading: "The system across surfaces",
      content_md: null,
      order: 70,
    },
    {
      section_type: "text",
      heading: "Reflection — the hardest part was NOT shipping @rockwallet/ui",
      content_md:
        "The hardest part of this project was *not* shipping `@rockwallet/ui` on day one. Every instinct said to start the package, push a Button, and call it a system. I held the line because I've seen what happens to design-system repos that exist before there's anywhere to use them — **they ossify around the first decision, and the first decision is almost always wrong.**\n\nThe PWB canvas is the bet that pays off here. By making it cheap and fast for designers to put components on real phones, the system stays honest. Components graduate because they've earned it, not because someone needed them in a sprint.\n\nWhat I'd do differently: I would have set up the Figma → token JSON pipeline earlier. Mirroring tokens by hand from Android into the canvas was the right call for a week-one bridge, but it's a fragile bridge and I'm carrying it longer than I'd like.",
      order: 80,
    },
  ],
  assets: [
    {
      type: "hero",
      file: "hero.png",
      alt_text:
        "Prometheus design system across four surfaces — Figma library on the left, Jetpack Compose tokens in Android Studio, SwiftUI tokens in Xcode, and the Product Whiteboard PWA installed on a phone — all sharing the same Color/Size/Space token namespace",
      caption:
        "Figma canonical · native mirrors · web incubator. One token namespace, four surfaces, one owner.",
      order: 10,
    },
    {
      type: "screenshot",
      file: "process-01.png",
      alt_text:
        "Token composition hierarchy — Color · Size · Space · font-weight · letter-space as primitives, then composite text styles like Body/Small, then components — each layer refusing to ship until the layer below is stable",
      caption:
        "Tokens first, because tokens compose. Components built on unstable primitives cost you twice.",
      order: 30,
    },
    {
      type: "screenshot",
      file: "process-02.png",
      alt_text:
        "Product Whiteboard PWA installed on an iPhone via Add-to-Home-Screen — dark-only canvas, flow being tested with mocked data, QR code on the right pointing to the preview branch URL",
      caption:
        "Branch → preview URL → QR → on-device. The install loop that turns components from speculative to earned.",
      order: 40,
    },
    {
      type: "screenshot",
      file: "gallery-01.png",
      alt_text:
        "Four-phase roadmap — PWB canvas → seed @rockwallet/ui → native WebView consumption → Code Connect bidirectional mapping across Figma, Android, iOS, and web",
      caption:
        "The roadmap, documented in docs/ROADMAP.md. Each phase has its graduation criterion; @rockwallet/ui doesn't start until the canvas earns it.",
      order: 70,
    },
    {
      type: "screenshot",
      file: "gallery-02.png",
      alt_text:
        "Prometheus Figma library variables panel — the verified token namespace (Color/*, Size/*, Space/*, font-weight/*, letter-space/*) with composite text styles like Body/Small as the source of truth",
      caption:
        "The Figma Variables panel — verified via the Figma MCP get_variable_defs API. This is the canonical layer; everything else mirrors it.",
      order: 80,
    },
    {
      type: "screenshot",
      file: "gallery-03.png",
      alt_text:
        "Native code mirrors — Android wallet-v2-android/theme Jetpack Compose tokens (Color.kt, Spacing.kt, FontSize.kt, AppTheme.kt) next to iOS RockWallet/Foundation/RWSystemDesign SwiftUI tokens, both conforming to the Figma namespace",
      caption:
        "Native files conform to Figma, not the other way around. Enforced by review, not by tooling — fine for now.",
      order: 90,
    },
    {
      type: "screenshot",
      file: "gallery-04.png",
      alt_text:
        "PWB canvas branch preview QR code — a flow/<name> branch deployed to a unique Vercel preview URL, ready to install via Add-to-Home-Screen on iOS Safari or Android Chrome",
      caption:
        "Every branch is one QR code away from a real phone. The install loop is the system's feedback mechanism.",
      order: 100,
    },
  ],
};

export default project;
