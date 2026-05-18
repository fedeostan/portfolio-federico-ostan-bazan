/**
 * Typed mirrors of the tokens in `design.md`.
 *
 * Source of truth is `design.md` at the repo root. CSS variables in
 * `app/globals.css` are the runtime mirror; the exports here are for code
 * that needs the raw values — e.g. Framer Motion configs which take numbers
 * and easing tuples rather than CSS strings.
 *
 * When updating: change `design.md` first, then mirror to both
 * `app/globals.css` and this file.
 */

export const colors = {
  ink: '#0a0a0a',
  inkMuted: '#737373',
  surface: '#ffffff',
  page: '#fafafa',
  border: '#e5e5e5',
  accent: '#f5f5f5',
} as const

export const typography = {
  family: { sans: 'Inter' },
  weight: { regular: 400, medium: 500, semibold: 600 },
  size: { xs: 12, base: 16, xl: 20, '2xl': 24 },
  lineHeight: { tight: 16, base: 24, snug: 28, relaxed: 32 },
  letterSpacing: { normal: '0em' },
} as const

export const spacing = {
  0: 0,
  3: 12,
  6: 24,
  12: 48,
} as const

export const radius = {
  lg: 10,
  '4xl': 26,
  full: 9999,
} as const

/**
 * Motion tokens consumed by Framer Motion / `motion` library.
 * Durations expressed in seconds (Framer's preferred unit); CSS variables
 * in `globals.css` use the same values in milliseconds.
 */
export const duration = {
  fast: 0.12,
  base: 0.22,
  slow: 0.42,
} as const

export const ease = {
  standard: [0.2, 0, 0, 1],
  emphasized: [0.3, 0, 0, 1],
  exit: [0.4, 0, 1, 1],
} as const satisfies Record<string, [number, number, number, number]>

export type DurationToken = keyof typeof duration
export type EaseToken = keyof typeof ease
export type RadiusToken = keyof typeof radius
export type SpacingToken = keyof typeof spacing
