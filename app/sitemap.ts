import type { MetadataRoute } from "next";

import { createServerClient } from "@/lib/db/client";
import { getSiteUrl } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [
    {
      url: `${base}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
  ];

  const supabase = createServerClient();
  const { data } = await supabase
    .from("projects")
    .select("slug")
    .eq("published", true);

  for (const row of data ?? []) {
    entries.push({
      url: `${base}/case-studies/${row.slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    });
  }

  return entries;
}
