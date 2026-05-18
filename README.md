# Portfolio — Federico Ostan-Bazán

An **AI-native UX portfolio**. The portfolio itself is the proof: a visitor types, pastes a job URL, uploads a job post, or speaks; the system reads their need, retrieves grounded evidence from Federico's case studies, and renders a tailored narrative + rich project cards in a streaming, visible-reasoning conversation.

> Status: 🚧 In active build. Roadmap below.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 App Router (TypeScript) |
| Hosting | Vercel (Pro) |
| UI | shadcn/ui • Tailwind • Lucide • Framer Motion (`motion`) |
| Design spec | Google [`design.md`](https://github.com/google-labs-code/design.md) |
| AI orchestration | Vercel AI SDK v6 — `streamText` + tool calls + `useChat` |
| AI Gateway | Vercel AI Gateway (Anthropic primary, OpenAI fallback) |
| Primary LLM | Claude Sonnet 4.6 with adaptive thinking |
| DB | Supabase Postgres + tsvector full-text search |
| Storage | Supabase Storage |
| Voice | Groq Whisper-large-v3-turbo |
| Doc/URL ingest | Firecrawl |
| Hardening | `@vercel/rate-limit` + BotID + AI Gateway Zero Data Retention |

Architectural decisions and trade-offs are written up in [`docs/research/`](docs/research/) — three independent research docs that converge on this stack.

## Roadmap

The full backlog is in [GitHub Issues](https://github.com/fedeostan/portfolio-federico-ostan-bazan/issues), grouped by milestone:

- **M1 — Foundation** (Issues #1–#7): repo, scaffolding, Supabase, design system, base UI kit
- **M2 — Hero + AI Brain** (Issues #8–#13): hero animation, AI chat input, streaming `/api/chat`
- **M3 — Navigation + Cards** (Issues #14–#17): dock, dynamic island TOC, scroll spy, project cards
- **M4 — Sections** (Issues #18–#21): AI, Mobile, Desktop, Personal projects
- **M5 — Contact + Case Study** (Issues #22–#24): contact box + lead capture, case-study template + scoped chat
- **M6 — Voice + URL + Polish** (Issues #25–#30): Groq Whisper, Firecrawl, end-of-scroll, hardening, launch

## Working on this repo

**Read [CONTRIBUTING.md](CONTRIBUTING.md) first.** This repo uses an issue-driven workflow where multiple Claude Code instances can work in parallel. Issues are picked up via a labelling lock; dependencies are explicit; QA is gated on human review.

```bash
# Pick up an issue (after reading CONTRIBUTING.md)
gh issue view <N>
gh issue edit <N> --add-label "status:in-progress" --remove-label "status:available"
git checkout -b feature/issue-<N>-<slug> main
```

## License

Personal portfolio — all rights reserved. Architecture and patterns documented in `docs/research/` are shareable.
