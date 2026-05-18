import { createGateway, type GatewayProvider } from "@ai-sdk/gateway";

export const PRIMARY_MODEL = "anthropic/claude-sonnet-4.6" as const;
export const FALLBACK_MODEL = "openai/gpt-5.4-mini" as const;

export const gateway: GatewayProvider = createGateway({
  apiKey: process.env.AI_GATEWAY_API_KEY ?? "",
});
