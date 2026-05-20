import { NextResponse } from "next/server";

import { createBrowserClient } from "@/lib/db/client";
import { leadSchema } from "@/lib/db/leads";
import {
  leadsLimiter,
  logRateLimitHit,
  rateLimitResponse,
} from "@/lib/api/rate-limit";
import { botBlockedResponse, logBotBlock, verifyBotId } from "@/lib/api/bot-id";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const limit = await leadsLimiter.limit(req);
  if (!limit.success) {
    logRateLimitHit("leads", req, limit);
    return rateLimitResponse(limit);
  }

  const bot = await verifyBotId();
  if (bot.isBot) {
    logBotBlock("leads", req);
    return botBlockedResponse();
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation_error", details: parsed.error.format() },
      { status: 400 },
    );
  }

  const supabase = createBrowserClient();
  // No `.select()` chain — anon has no SELECT policy on `leads` (by design;
  // submissions should not be readable), so RETURNING would fail with a
  // misleading 42501 even though the INSERT's WITH CHECK passes.
  const { error } = await supabase.from("leads").insert({
    email: parsed.data.email,
    name: parsed.data.name ?? null,
    message: parsed.data.message ?? null,
    source: "contact-form",
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
