import {
  streamText,
  convertToModelMessages,
  stepCountIs,
  type UIMessage,
} from "ai";
import { z } from "zod";
import { gateway, PRIMARY_MODEL } from "@/lib/ai/gateway";
import { buildTools } from "@/lib/ai/tools";
import { systemPrompt, type RedirectTarget } from "@/lib/ai/prompts";
import { listProjectsForRedirect } from "@/lib/db/queries";
import { jobBriefSchema } from "@/lib/ingest/job-brief";
import {
  chatLimiter,
  logRateLimitHit,
  rateLimitResponse,
} from "@/lib/api/rate-limit";
import { logBotBlock, verifyBotId } from "@/lib/api/bot-id";

export const runtime = "nodejs";
export const maxDuration = 60;

const bodySchema = z.object({
  messages: z.array(z.any()) as z.ZodType<UIMessage[]>,
  project_id: z.string().optional(),
  project_title: z.string().optional(),
  job_brief: jobBriefSchema.optional(),
});

export async function POST(req: Request) {
  const limit = await chatLimiter.limit(req);
  if (!limit.success) {
    logRateLimitHit("chat", req, limit);
    return rateLimitResponse(limit);
  }

  // BotID is observe-only here: its client handshake false-positives fresh
  // visitors (first load, ad blockers), and blocking real humans costs more
  // than the tokens a bot could burn. The rate limiter above bounds spend.
  const bot = await verifyBotId();
  if (bot.isBot) {
    logBotBlock("chat", req);
  }

  let parsed: z.infer<typeof bodySchema>;
  try {
    parsed = bodySchema.parse(await req.json());
  } catch (error) {
    return Response.json(
      { error: "Invalid request body", details: String(error) },
      { status: 400 },
    );
  }

  const { messages, project_id, project_title, job_brief } = parsed;
  const startedAt = Date.now();
  const scopedTools = buildTools({ project_id });

  let other_projects: RedirectTarget[] = [];
  if (project_id) {
    const { data } = await listProjectsForRedirect(project_id);
    other_projects = (data ?? []).map((row) => ({
      slug: row.slug,
      title: row.title,
      category: row.category,
    }));
  }

  const result = streamText({
    model: gateway(PRIMARY_MODEL),
    system: systemPrompt({ project_id, project_title, other_projects, job_brief }),
    messages: await convertToModelMessages(messages),
    tools: scopedTools,
    stopWhen: stepCountIs(project_id ? 3 : 6),
    providerOptions: {
      anthropic: {
        thinking: { type: "enabled", budgetTokens: 8000 },
      },
    },
    onFinish: ({ usage, steps }) => {
      const toolCalls = steps.flatMap((step) => step.toolCalls ?? []);
      const counts = toolCalls.reduce<Record<string, number>>((acc, call) => {
        acc[call.toolName] = (acc[call.toolName] ?? 0) + 1;
        return acc;
      }, {});
      console.log("[/api/chat]", {
        model: PRIMARY_MODEL,
        scoped: project_id ?? null,
        brief: job_brief ? `${job_brief.role}@${job_brief.company}` : null,
        latencyMs: Date.now() - startedAt,
        steps: steps.length,
        toolCalls: counts,
        usage,
      });
    },
  });

  return result.toUIMessageStreamResponse({ sendReasoning: true });
}
