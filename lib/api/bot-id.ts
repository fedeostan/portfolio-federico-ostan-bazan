import { checkBotId } from "botid/server";

export interface BotCheckResult {
  isBot: boolean;
  isVerifiedBot?: boolean;
  verifiedBotName?: string;
}

/**
 * Thin wrapper around `checkBotId()` so route handlers don't import the
 * SDK directly. In local dev the SDK returns `isBot: false` unconditionally
 * (see https://vercel.com/docs/botid/local-development-behavior), so this
 * is a no-op until the deployment is on Vercel.
 *
 * Verified bots (Googlebot, etc.) are allowed through — we don't want to
 * block search indexers.
 */
export async function verifyBotId(): Promise<BotCheckResult> {
  const verification = await checkBotId();
  const result = verification as {
    isBot?: boolean;
    isVerifiedBot?: boolean;
    verifiedBotName?: string;
  };

  return {
    isBot: Boolean(result.isBot) && !result.isVerifiedBot,
    isVerifiedBot: result.isVerifiedBot,
    verifiedBotName: result.verifiedBotName,
  };
}

/**
 * Standard 403 response when BotID flags the caller.
 */
export function botBlockedResponse(): Response {
  return new Response(JSON.stringify({ error: "forbidden" }), {
    status: 403,
    headers: { "Content-Type": "application/json" },
  });
}

export function logBotBlock(route: string, req: Request) {
  console.warn("[botid] blocked", {
    route,
    ua: req.headers.get("user-agent"),
    ip: req.headers.get("x-forwarded-for"),
  });
}
