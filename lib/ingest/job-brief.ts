import { generateObject } from 'ai'
import { z } from 'zod'

import { gateway } from '@/lib/ai/gateway'

import { IngestError } from './firecrawl'

export const BRIEF_MODEL = 'anthropic/claude-haiku-4.5' as const

export const jobBriefSchema = z.object({
  role: z.string().min(1).describe('The job title, e.g. "Senior Product Designer".'),
  company: z.string().min(1).describe('The hiring company. Use "Unknown" if not stated.'),
  seniority: z
    .string()
    .optional()
    .describe('Seniority level if stated (e.g. "Senior", "Staff", "Lead").'),
  problems: z
    .array(z.string().min(1))
    .max(6)
    .describe('Up to 6 core problems / responsibilities the role is meant to solve.'),
  outcomes: z
    .array(z.string().min(1))
    .max(6)
    .describe('Up to 6 outcomes or success signals the company expects.'),
})

export type JobBrief = z.infer<typeof jobBriefSchema>

const SYSTEM = `You normalize raw job-description markdown into a compact structured brief.
- Be faithful to the source. Do not invent companies, seniority, or outcomes that are not present.
- If a field is genuinely missing, use "Unknown" for required strings and an empty array for lists.
- Keep each problem/outcome to a single short sentence.`

export async function extractJobBrief(markdown: string): Promise<JobBrief> {
  const trimmed = markdown.trim()
  if (!trimmed) {
    throw new IngestError('Cannot extract a brief from empty content.', 'empty-result', 422)
  }

  try {
    const { object } = await generateObject({
      model: gateway(BRIEF_MODEL),
      schema: jobBriefSchema,
      system: SYSTEM,
      prompt: `Normalize this job description into the schema:\n\n${trimmed.slice(0, 20_000)}`,
      maxRetries: 1,
    })
    return object
  } catch (err) {
    throw new IngestError(
      err instanceof Error ? err.message : 'Failed to normalize job brief.',
      'parse-failed',
    )
  }
}

export function briefAsSystemContext(brief: JobBrief): string {
  const lines = [
    'Attached job brief (treat as the visitor\'s hiring context, weigh it when surfacing projects):',
    `- Role: ${brief.role}`,
    `- Company: ${brief.company}`,
  ]
  if (brief.seniority) lines.push(`- Seniority: ${brief.seniority}`)
  if (brief.problems.length) {
    lines.push('- Problems to solve:')
    brief.problems.forEach((p) => lines.push(`  • ${p}`))
  }
  if (brief.outcomes.length) {
    lines.push('- Outcomes wanted:')
    brief.outcomes.forEach((o) => lines.push(`  • ${o}`))
  }
  return lines.join('\n')
}
