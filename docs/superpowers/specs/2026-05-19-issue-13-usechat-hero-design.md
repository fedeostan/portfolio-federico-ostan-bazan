# Issue #13 — `useChat` integration in hero

**Status:** design approved, ready for implementation plan
**Date:** 2026-05-19
**Issue:** https://github.com/fedeostan/portfolio-federico-ostan-bazan/issues/13
**Dependencies:** #9 (chat input UI, completed), #12 (`/api/chat`, completed), #14 (ProjectCard, completed)
**Branch:** `worktree-issue-13-usechat-hero` (to be renamed `feature/issue-13-usechat-hero` before PR)

---

## 1. Goal

Connect the AI Chat Input UI to the streaming `/api/chat` brain so the portfolio's hero becomes interactive: a visitor types a question, watches reasoning + project cards + narrative stream in, and can reset to ask a new one. This is the moment the portfolio "becomes alive."

### Success criteria (from the issue's QA checklist)

- Submitting a real prompt streams a real answer in the UI.
- At least one `<ProjectCard>` renders for a project-relevant prompt.
- Reasoning accordion expands to show the thinking summary.
- Streaming text blurs in word-by-word smoothly.
- Network error → friendly error message (not a console stack trace).
- Scroll position locks once chat is active; "New question" restores hero.
- Mobile (360px): cards stack vertically, no overflow.

---

## 2. Architecture

A new coordinating parent owns the hero ↔ chat mode flip. `HeroSequence` and `ChatExperience` each stay single-purpose.

```
app/page.tsx
└─ <HeroChat />                          ← NEW: owns mode flip + scroll lock
   ├─ mode === "idle"   → <HeroSequence onSend={enter} />
   └─ mode === "active" → <ChatExperience
                            initialPrompt={prompt}
                            onReset={leave}
                          />
                          (body scroll locked while active)
```

**State owned by `HeroChat`:**
- `mode: "idle" | "active"` — initialised to `"idle"`
- `initialPrompt: string` — captured on submit; cleared on reset

**Transitions:**
- `enter(prompt)` → set `initialPrompt`, set `mode = "active"`, lock `document.body.style.overflow`.
- `leave()` → unlock scroll, clear prompt, set `mode = "idle"`. HeroSequence remounts in its `ready` state via the existing `hero-played` sessionStorage flag.

**Cross-fade:** `motion`'s `AnimatePresence` with `mode="wait"` so the leaving component finishes its exit before the entering one starts. Re-uses `transitions.blurReveal` from `lib/motion-config.ts`.

**Reduced motion:** if `useReducedMotion()` returns true, transitions become instant fades (no blur).

### Why this shape

`HeroChat` is the only file that knows about both worlds. `HeroSequence` and `ChatExperience` remain testable in isolation. Alternative approaches (folding chat-mode into `HeroSequence`'s stage machine, or lifting state to the page) were rejected because they conflate intro choreography with active chat, or push integration responsibility into the page component.

---

## 3. Components & files

### New files

| Path | Purpose | Approx. lines |
|---|---|---|
| `components/hero/HeroChat.tsx` | Owns `mode` + `initialPrompt`; renders one child; manages scroll lock. | ~50 |
| `components/hero/ChatExperience.tsx` | Hosts `useChat`; sends `initialPrompt` once on mount; renders the single assistant message. | ~120 |
| `components/hero/StreamingText.tsx` | Takes a streaming text string; reveals newly-completed words with a blur-in. | ~80 |
| `components/hero/ReasoningAccordion.tsx` | Accumulates `reasoning` parts; auto-opens while streaming, auto-collapses on ready; user toggle wins. | ~60 |
| `components/hero/ToolStatusPill.tsx` | Maps active silent tool name → friendly label; auto-hides when no silent tool is active. | ~40 |
| `components/hero/NewQuestionButton.tsx` | Reset button (top-right of chat panel). | ~30 |
| `components/hero/ChatErrorCard.tsx` | Inline error with "Try again" button; branches copy on HTTP status. | ~70 |
| `components/project/ProjectCardSkeleton.tsx` | Shimmer placeholder matching `ProjectCard` dimensions. | ~40 |

### Modified files

- `components/hero/HeroSequence.tsx` — confirm `onSend` prop wiring (no behavioural changes; remove the `noop` placeholder once `HeroChat` is the parent).
- `app/page.tsx` (or wherever `HeroSequence` is rendered) — swap `<HeroSequence />` for `<HeroChat />`.

### New dependency

- `pnpm add @ai-sdk/react` (the `ai` package itself is already at `^6.0.184` for the server route).

### Key contracts

- **`ChatExperience` ↔ `/api/chat`**: relies on `useChat`'s default transport. Handled message part types: `text`, `reasoning`, `tool-show_project_card`, `tool-search_projects`, `tool-get_project_detail`. Unknown part types are ignored without crashing.
- **`ChatExperience` ↔ `ProjectCard`**: `tool-show_project_card`'s output is `ProjectWithRelations & { highlight? }` — a superset of `ProjectCardProps`. ChatExperience maps it to the `ProjectCardProps` subset (slug, title, summary, og_image, role, etc.). TypeScript enforces correctness at the call site.
- **`HeroChat` ↔ scroll lock**: imperative toggle of `document.body.style.overflow` inside a `useEffect` keyed on `mode`, with cleanup on unmount.

---

## 4. Data flow

```
1. Visitor types in HeroSequence's AIChatInput, presses Enter
2. onSend(prompt) → HeroChat.enter(prompt)
3. AnimatePresence cross-fade → ChatExperience mounts with initialPrompt
4. ref-guarded effect → useChat.sendMessage({ text: initialPrompt })
5. POST /api/chat → streamText → toUIMessageStreamResponse({ sendReasoning: true })
6. parts stream back, useChat appends to messages[]
   status: 'submitted' → 'streaming' → 'ready' | 'error'
7. ChatExperience renders the assistant message:
   ├── reasoning parts → ReasoningAccordion.text (concatenated)
   ├── text parts      → StreamingText (per-word blur-in)
   ├── tool-show_project_card:
   │     state === 'input-available'  → <ProjectCardSkeleton />
   │     state === 'output-available' → <ProjectCard {...mapped} />
   └── tool-search_projects / tool-get_project_detail:
         activeTool name → <ToolStatusPill activeTool="search_projects" />
         cleared when state === 'output-available'
8. On "New question" → HeroChat.leave() → ChatExperience unmounts → HeroSequence remounts in 'ready'
```

### Part accumulation

ChatExperience reduces the assistant message's parts into a `RenderModel` (memoised on `message.parts`):

```ts
type RenderModel = {
  reasoningText: string          // concat of all `reasoning` parts joined with \n\n
  activeTool: string | null      // most recent silent tool currently `input-*`
  inOrderParts: RenderablePart[] // text + tool-show_project_card, in source order
}
```

This is the "reasoning consolidated at top, rest in source order" layout rule turned into a derivation. Component renders:

```
<ReasoningAccordion text={reasoningText} isStreaming={status === 'streaming'} />
<ToolStatusPill activeTool={activeTool} />
{inOrderParts.map(...)}
```

The reducer is extracted to a pure function `reduceMessageParts(parts)` so it can be unit tested without React.

### Streaming text mechanics

`StreamingText` receives the *current full text* of a `text` part every render. To animate only *newly completed* words:

1. Split current text: `current.split(/(\s+)/)` (keep whitespace tokens for spacing fidelity).
2. Track previous render's word count in a `useRef`.
3. Words at indices `[prevCount, currentCount)` are "new" → wrap each in a `motion.span` with `initial={{ filter: 'blur(8px)', opacity: 0 }}` `animate={{ filter: 'blur(0)', opacity: 1 }}`, 250ms, ease matches `transitions.blurReveal`.
4. The *trailing partial word* (no whitespace yet) renders un-animated as plain text — it animates once whitespace lands.
5. On `isStreaming === false`, freeze: any remaining trailing partial gets a final blur-in.
6. `prefers-reduced-motion` → no blur, plain text.
7. **Perf bound**: only the most recent 8 words remain as `motion.span`. Older settled words are flattened into a single static span; React's diff cost stays bounded for long answers.

### Initial-prompt resend guard

The naive `useEffect(() => sendMessage(...), [])` fires twice under React strict mode. Pattern used:

```ts
const sentRef = useRef(false)
useEffect(() => {
  if (sentRef.current || !initialPrompt) return
  sentRef.current = true
  sendMessage({ text: initialPrompt })
}, [initialPrompt, sendMessage])
```

Exactly-once per ChatExperience mount. Reset remounts → fresh ref.

### Scroll lock contract

```ts
useEffect(() => {
  if (mode !== "active") return
  const prev = document.body.style.overflow
  document.body.style.overflow = "hidden"
  return () => { document.body.style.overflow = prev }
}, [mode])
```

No `aria-hidden` on sibling sections initially — keyboard focus is naturally bounded inside the chat panel because the rest of the page is unscrollable. If focus is observed escaping during QA, add a focus trap then.

---

## 5. Error handling

### What counts as an error

`useChat` surfaces `error: Error | undefined` when:
- POST to `/api/chat` returns non-2xx (SDK throws with response status attached).
- The fetch itself rejects (network down, abort).
- The stream is interrupted mid-flight.
- Server-side zod validation rejects the body (shouldn't happen from our own client, covered for safety).

### Classifier

```ts
function classify(error: Error): "rate-limit" | "server" | "network" {
  const msg = error.message.toLowerCase()
  if (msg.includes("429") || msg.includes("rate")) return "rate-limit"
  if (msg.includes("fetch") || msg.includes("network")) return "network"
  return "server"
}
```

### Copy

| Variant | Headline | Sub | Button |
|---|---|---|---|
| `rate-limit` | "Lots of people are chatting with me right now." | "Give it a few seconds and try again." | "Try again" |
| `network` | "Looks like your connection blinked." | "Check your network and retry." | "Try again" |
| `server` | "Something glitched on my end." | "Retry, or hit 'New question' to start fresh." | "Try again" |

All variants share the same visual shell: soft `bg-muted/40`, rounded card matching `ProjectCard`'s `rounded-4xl`.

### Retry behaviour

"Try again" calls `useChat.regenerate()` — re-runs against the last user message. No auto-retry: it feels hostile to upstream and obscures real failures. Visitor chooses.

### Partial output policy

If a stream is interrupted mid-response, the partial text **stays on screen**; the `ChatErrorCard` renders below it. Visitor sees what got through plus the retry option.

### "New question" availability

`NewQuestionButton` is always available regardless of `status` or `error`. Mid-stream click calls `useChat.stop()` then `onReset()`.

---

## 6. Motion behavior

### Re-used tokens (from `lib/motion-config.ts`)

- `blurReveal: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }`

### New local constant (defined inside `ChatExperience.tsx`, not a global token)

- `wordBlurReveal: { duration: 0.25, ease: [0.16, 1, 0.3, 1] }` — faster than the global `blurReveal` because many words animate in succession.

### Per-surface specs

| Surface | Initial | Animate | Transition | Reduced motion |
|---|---|---|---|---|
| Hero → Chat (in `HeroChat`) | `{ opacity: 0, filter: 'blur(12px)' }` | `{ opacity: 1, filter: 'blur(0)' }` | `transitions.blurReveal` via `AnimatePresence mode="wait"` | Instant opacity swap |
| Chat → Hero (reset) | `{ opacity: 1 }` | `{ opacity: 0, filter: 'blur(8px)' }` | `transitions.blurReveal` exit | Instant |
| StreamingText per-word | `{ opacity: 0, filter: 'blur(8px)' }` | `{ opacity: 1, filter: 'blur(0)' }` | `wordBlurReveal` (250ms) | Plain text, no motion span |
| Skeleton → Card | Skeleton fade-out + card fade-in | Layered crossfade in `AnimatePresence` | `{ duration: 0.2 }` | Instant swap |
| Skeleton shimmer | n/a — looping | `background-position 0→200%`, 1.5s linear infinite | CSS animation | Disabled via media query |
| Reasoning accordion expand/collapse | `{ height: 0, opacity: 0 }` | `{ height: 'auto', opacity: 1 }` | `transitions.blurReveal` shortened to 0.35 | Instant |
| ToolStatusPill enter/exit | `{ opacity: 0, y: -4 }` | `{ opacity: 1, y: 0 }` | `{ duration: 0.2, ease: 'easeOut' }` | Instant |
| ChatErrorCard enter | `{ opacity: 0, y: 8 }` | `{ opacity: 1, y: 0 }` | `transitions.blurReveal` shortened to 0.35 | Instant |
| NewQuestionButton icon hover | base | `{ x: 2 }` on icon | existing `--duration-base` token | Hover transform disabled |

### Reasoning accordion auto-toggle

`open` is derived, not stored authoritatively. User toggle wins:

```ts
const [userToggled, setUserToggled] = useState(false)
const [open, setOpen] = useState(false)

useEffect(() => {
  if (userToggled) return
  if (isStreaming && text.length > 0) setOpen(true)
  else if (!isStreaming) setOpen(false)
}, [isStreaming, text, userToggled])
```

### Stagger rules

- Hero ↔ Chat uses `AnimatePresence mode="wait"` — total ~1.2s, deliberate.
- During streaming, words do **not** stagger beyond their natural arrival cadence. The model's pace is the pace.
- Skeleton → real card waits one `requestAnimationFrame` after the `output-available` part appears, so the cross-fade reads cleanly even if state batches.

### Performance

- `StreamingText` keeps only the last 8 words as `motion.span`; older words flatten into static spans.
- Tool-card `AnimatePresence` is keyed by the part's *position index*, not the tool-call ID — skeleton → card is reconciled in place.

---

## 7. Testing & QA

### Unit tests (Vitest + RTL)

| File | Coverage |
|---|---|
| `StreamingText.test.tsx` | Word splitting; only new words get motion spans; trailing-partial commit on `!isStreaming`; reduced-motion path; ≤ 8 active motion spans invariant |
| `ReasoningAccordion.test.tsx` | Auto-open on streaming-with-text; auto-collapse on ready; user toggle wins; empty text → renders nothing |
| `ChatErrorCard.test.tsx` | Classifier branches (429 / network / other); retry button fires `onRetry` |
| `chat-experience.parts.test.ts` | `reduceMessageParts` joins reasoning with `\n\n`; `activeTool` reflects most recent silent tool in `input-*`, clears on `output-available`; `inOrderParts` preserves source order |
| `ProjectCardSkeleton.test.tsx` | Aspect ratio class matches `ProjectCard`; has `aria-busy="true"` |

### Component tests with mocked `useChat`

`ChatExperience.test.tsx` — uses a fake `useChat` fed scripted parts:

- **Happy path**: reasoning → search_projects → show_project_card (input → output) → text. Verify: pill appears then clears, skeleton → card, accordion auto-opens then auto-collapses, narrative blurs in word-by-word.
- **Error mid-stream**: text starts, then `status='error'` with `message='429 Too Many Requests'`. Partial text remains; ChatErrorCard with rate-limit copy renders below.
- **Retry**: "Try again" → `regenerate()` called once.
- **Reset mid-stream**: "New question" → `stop()` called → `onReset()` invoked.
- **Strict-mode single-send**: `sendMessage` called exactly once even when the effect double-mounts.

### Manual QA (issue checklist mapped)

| Checklist item | How verified |
|---|---|
| Submitting a real prompt streams a real answer | `pnpm dev`, ask "Tell me about your AI projects" |
| `<ProjectCard>` renders for a project-relevant prompt | Same prompt — brain is instructed to call `show_project_card` 1–3× |
| Reasoning accordion expands to show thinking | Visible during stream; click to re-expand after auto-collapse |
| Streaming text blurs in word-by-word | Visual inspection desktop + mobile |
| Network error → friendly error | DevTools Network → Offline → submit; expect ChatErrorCard `network` variant |
| Scroll lock + restoration | Attempt scroll during chat; click "New question" |
| Mobile (360px): cards stack, no overflow | Chrome DevTools 360px viewport |

### Two extra scenarios worth verifying

- **Strict-mode double-mount in dev**: confirm `sendMessage` fires exactly once.
- **Rapid reset → new question**: open chat, immediately reset, immediately submit a new prompt. No zombie fetch overlap.

### Test prompts for manual QA

- `"What's a project you're proud of?"` — exercises `search_projects` → `show_project_card` × 1–2 → text.
- `"Tell me about the Hexta one in detail"` — exercises `get_project_detail` → text.
- `"Hi"` — exercises text-only path (reasoning + text, no tools).

### Out of scope for #13's tests

- `/api/chat`'s streaming behaviour itself — covered by #12.
- `ProjectCard` internals — covered by #14.
- `AIChatInput` — covered by #9.

---

## 8. Open questions & follow-ups

None blocking. Items deliberately deferred:

- **Focus trap** — not added initially. Adopted only if QA observes focus escaping the chat panel.
- **Retry-After header parsing for rate limits** — upstream doesn't reliably emit one; honest "give it a few seconds" copy is better than a guessed countdown.
- **Multi-turn conversation** — the issue scopes a single round trip ("Federico types a real prompt … and clicks 'New question' to reset"). Subsequent turns within the same chat session are out of scope for this issue.
