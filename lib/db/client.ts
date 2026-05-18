import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "./types";

export type DbClient = SupabaseClient<Database>;

type ClientCache = {
  __portfolioServerClient?: DbClient;
  __portfolioBrowserClient?: DbClient;
};

const globalCache = globalThis as unknown as ClientCache;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

/**
 * Server-only client using the service role key. Bypasses RLS — never import
 * from a Client Component or expose to the browser.
 */
export function createServerClient(): DbClient {
  if (globalCache.__portfolioServerClient) {
    return globalCache.__portfolioServerClient;
  }

  const url = requireEnv("SUPABASE_URL");
  const key = requireEnv("SUPABASE_SERVICE_ROLE_KEY");

  const client = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  globalCache.__portfolioServerClient = client;
  return client;
}

/**
 * Browser-safe client using the anon key. RLS-bounded; safe to import from
 * Client Components.
 */
export function createBrowserClient(): DbClient {
  if (globalCache.__portfolioBrowserClient) {
    return globalCache.__portfolioBrowserClient;
  }

  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const key = requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  const client = createClient<Database>(url, key);

  globalCache.__portfolioBrowserClient = client;
  return client;
}
