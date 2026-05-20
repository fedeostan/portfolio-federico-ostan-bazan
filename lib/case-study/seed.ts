import type { Database } from "@/lib/db/types";

type ProjectInsert = Database["public"]["Tables"]["projects"]["Insert"];
type SectionInsert =
  Database["public"]["Tables"]["project_sections"]["Insert"];
type AssetInsert = Database["public"]["Tables"]["project_assets"]["Insert"];

export type SeedSection = Omit<SectionInsert, "project_id">;

/**
 * Asset as declared in a case-study.ts module. `file` is the filename inside
 * `content/case-studies/<slug>/images/`. The seeder resolves it to a public
 * Supabase Storage URL via the sidecar `assets.json` produced by
 * `pnpm assets:upload <slug>`.
 */
export type SeedAsset = Omit<AssetInsert, "project_id" | "url"> & {
  file: string;
};

/**
 * Shape every `content/case-studies/<slug>/case-study.ts` default-exports.
 * `og_image_file` references a filename in `images/`; the seeder resolves it.
 */
export type SeedProject = Omit<ProjectInsert, "og_image"> & {
  og_image_file?: string;
  sections: SeedSection[];
  assets: SeedAsset[];
};

export type ResolvedAssetMap = Record<string, string>;
