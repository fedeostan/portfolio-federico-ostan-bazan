import {
  streamText,
  convertToModelMessages,
  stepCountIs,
  type UIMessage,
} from "ai";
import { z } from "zod";
import { gateway, PRIMARY_MODEL } from "@/lib/ai/gateway";
import { tools } from "@/lib/ai/tools";
import { systemPrompt } from "@/lib/ai/prompts";

export const runtime = "nodejs";
export const maxDuration = 60;

const bodySchema = z.object({
  messages: z.array(z.any()) as z.ZodType<UIMessage[]>,
  project_id: z.string().optional(),
});

export async function POST(req: Request) {
  let parsed: z.infer<typeof bodySchema>;
  try {
    parsed = bodySchema.parse(await req.json());
  } catch (error) {
    return Response.json(
      { error: "Invalid request body", details: String(error) },
      { status: 400 },
    );
  }

  const { messages, project_id } = parsed;
  const startedAt = Date.now();

  const result = streamText({
    model: gateway(PRIMARY_MODEL),
    system: systemPrompt({ project_id }),
    messages: await convertToModelMessages(messages),
    tools,
    stopWhen: stepCountIs(6),
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
        latencyMs: Date.now() - startedAt,
        steps: steps.length,
        toolCalls: counts,
        usage,
      });
    },
  });

  return result.toUIMessageStreamResponse({ sendReasoning: true });
}
