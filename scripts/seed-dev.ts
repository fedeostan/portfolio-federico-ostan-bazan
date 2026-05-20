import { config as loadEnv } from "dotenv";
import { readdir, readFile, stat } from "node:fs/promises";
import { resolve, join } from "node:path";
import { pathToFileURL } from "node:url";

loadEnv({ path: resolve(process.cwd(), ".env.local") });

import { createServerClient } from "@/lib/db/client";
import type {
  ResolvedAssetMap,
  SeedAsset,
  SeedProject,
  SeedSection,
} from "@/lib/case-study/seed";
import type { Database } from "@/lib/db/types";

type AssetInsert = Database["public"]["Tables"]["project_assets"]["Insert"];

const CONTENT_DIR = resolve(process.cwd(), "content/case-studies");

/**
 * Slugs that used to live as inline placeholders in this file. Kept here so
 * `pnpm db:seed` cleans up any leftover rows in environments that were
 * seeded before the content/ pipeline existed. Safe to delete once the
 * production DB has been re-seeded.
 */
const LEGACY_SLUGS_TO_WIPE = [
  "seed-ai-project",
  "seed-mobile-project",
  "seed-desktop-project",
] as const;

type LoadedProject = {
  slug: string;
  project: SeedProject;
  assetMap: ResolvedAssetMap;
};

async function fileExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function listCaseStudySlugs(): Promise<string[]> {
  if (!(await fileExists(CONTENT_DIR))) return [];
  const entries = await readdir(CONTENT_DIR, { withFileTypes: true });
  return entries
    .filter(
      (e) =>
        e.isDirectory() && !e.name.startsWith("_") && !e.name.startsWith("."),
    )
    .map((e) => e.name)
    .sort();
}

async function loadProject(slug: string): Promise<LoadedProject | null> {
  const modulePath = join(CONTENT_DIR, slug, "case-study.ts");
  if (!(await fileExists(modulePath))) {
    console.warn(`  ⚠ ${slug}: no case-study.ts — skipping`);
    return null;
  }

  const sidecarPath = join(CONTENT_DIR, slug, "assets.json");
  if (!(await fileExists(sidecarPath))) {
    console.warn(
      `  ⚠ ${slug}: no assets.json — run \`pnpm assets:upload ${slug}\` first. Skipping.`,
    );
    return null;
  }

  const mod = (await import(pathToFileURL(modulePath).href)) as {
    default?: SeedProject;
  };
  const project = mod.default;
  if (!project) {
    console.warn(`  ⚠ ${slug}: case-study.ts has no default export — skipping`);
    return null;
  }

  const assetMap = JSON.parse(
    await readFile(sidecarPath, "utf8"),
  ) as ResolvedAssetMap;

  return { slug, project, assetMap };
}

function resolveAssetUrl(
  slug: string,
  file: string,
  map: ResolvedAssetMap,
): string {
  const url = map[file];
  if (!url) {
    throw new Error(
      `${slug}: case-study.ts references "${file}" but assets.json has no entry for it. ` +
        `Run \`pnpm assets:upload ${slug}\` (or add the file to images/) and retry.`,
    );
  }
  return url;
}

function buildAssetInserts(
  slug: string,
  assets: SeedAsset[],
  map: ResolvedAssetMap,
): Omit<AssetInsert, "project_id">[] {
  return assets.map(({ file, ...rest }) => ({
    ...rest,
    url: resolveAssetUrl(slug, file, map),
  }));
}

async function main() {
  const supabase = createServerClient();
  const slugs = await listCaseStudySlugs();

  const loaded: LoadedProject[] = [];
  for (const slug of slugs) {
    const p = await loadProject(slug);
    if (p) loaded.push(p);
  }

  const activeSlugs = loaded.map((l) => l.project.slug);
  const slugsToWipe = Array.from(
    new Set([...activeSlugs, ...LEGACY_SLUGS_TO_WIPE]),
  );

  // FK from project_sections / project_assets cascades on project delete.
  const { error: wipeError } = await supabase
    .from("projects")
    .delete()
    .in("slug", slugsToWipe);
  if (wipeError) {
    throw new Error(`Failed to wipe seed projects: ${wipeError.message}`);
  }

  if (loaded.length === 0) {
    console.log(
      "No case studies in content/case-studies/ — wiped legacy seeds and exited.",
    );
    return;
  }

  for (const { slug, project, assetMap } of loaded) {
    const { sections, assets, og_image_file, ...rest } = project;

    const og_image = og_image_file
      ? resolveAssetUrl(slug, og_image_file, assetMap)
      : null;

    const { data: inserted, error: projectError } = await supabase
      .from("projects")
      .insert({ ...rest, og_image })
      .select("id, slug")
      .single();

    if (projectError || !inserted) {
      throw new Error(
        `Failed to insert project ${project.slug}: ${projectError?.message ?? "no row returned"}`,
      );
    }

    const projectId = inserted.id;

    if (sections.length > 0) {
      const { error: sectionsError } = await supabase
        .from("project_sections")
        .insert(
          sections.map((s: SeedSection) => ({ ...s, project_id: projectId })),
        );
      if (sectionsError) {
        throw new Error(
          `Failed to insert sections for ${project.slug}: ${sectionsError.message}`,
        );
      }
    }

    const assetInserts = buildAssetInserts(slug, assets, assetMap);
    if (assetInserts.length > 0) {
      const { error: assetsError } = await supabase
        .from("project_assets")
        .insert(assetInserts.map((a) => ({ ...a, project_id: projectId })));
      if (assetsError) {
        throw new Error(
          `Failed to insert assets for ${project.slug}: ${assetsError.message}`,
        );
      }
    }

    console.log(`  ✓ ${project.slug}`);
  }

  console.log(`Seeded ${loaded.length} project(s)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
