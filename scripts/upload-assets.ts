import { config as loadEnv } from "dotenv";
import { createHash } from "node:crypto";
import { readdir, readFile, writeFile, stat } from "node:fs/promises";
import { resolve, join, extname } from "node:path";

loadEnv({ path: resolve(process.cwd(), ".env.local") });

import { createServerClient } from "@/lib/db/client";

const BUCKET = "project-assets";
const CONTENT_DIR = resolve(process.cwd(), "content/case-studies");

const MIME_BY_EXT: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".avif": "image/avif",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
};

type Args = { slugs: string[]; force: boolean };

function parseArgs(argv: string[]): Args {
  const args = argv.slice(2);
  const force = args.includes("--force");
  const all = args.includes("--all");
  const slugs = args.filter((a) => !a.startsWith("--"));

  if (!all && slugs.length === 0) {
    console.error(
      "Usage: pnpm assets:upload <slug> [--force]\n" +
        "       pnpm assets:upload --all [--force]",
    );
    process.exit(2);
  }

  return { slugs: all ? [] : slugs, force };
}

async function listSlugs(): Promise<string[]> {
  const entries = await readdir(CONTENT_DIR, { withFileTypes: true });
  return entries
    .filter((e) => e.isDirectory() && !e.name.startsWith("_") && !e.name.startsWith("."))
    .map((e) => e.name)
    .sort();
}

async function uploadSlug(slug: string, force: boolean): Promise<boolean> {
  const imagesDir = join(CONTENT_DIR, slug, "images");

  let entries: string[];
  try {
    entries = await readdir(imagesDir);
  } catch {
    console.warn(`  ⚠ ${slug}: no images/ directory, skipping`);
    return true;
  }

  const files = entries
    .filter((f) => !f.startsWith(".") && MIME_BY_EXT[extname(f).toLowerCase()])
    .sort();

  if (files.length === 0) {
    console.warn(`  ⚠ ${slug}: images/ is empty`);
    return true;
  }

  const supabase = createServerClient();
  const map: Record<string, string> = {};
  let anyFailed = false;

  for (const filename of files) {
    const localPath = join(imagesDir, filename);
    const storagePath = `${slug}/${filename}`;
    const ext = extname(filename).toLowerCase();
    const contentType = MIME_BY_EXT[ext];

    const body = await readFile(localPath);
    const versionHash = createHash("sha1").update(body).digest("hex").slice(0, 10);

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, body, {
        contentType,
        upsert: force,
        cacheControl: "31536000, immutable",
      });

    const alreadyExists =
      uploadError &&
      /(exists|duplicate|409)/i.test(uploadError.message ?? "");

    if (uploadError && !alreadyExists) {
      console.error(`  ✗ ${slug}/${filename}: ${uploadError.message}`);
      anyFailed = true;
      continue;
    }

    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
    map[filename] = `${pub.publicUrl}?v=${versionHash}`;

    const tag = uploadError ? "skip" : force ? "force" : "ok";
    console.log(`  ✓ ${slug}/${filename} [${tag}]`);
  }

  const sortedMap = Object.fromEntries(
    Object.keys(map)
      .sort()
      .map((k) => [k, map[k]]),
  );
  const sidecar = join(CONTENT_DIR, slug, "assets.json");
  await writeFile(sidecar, JSON.stringify(sortedMap, null, 2) + "\n", "utf8");
  console.log(`  → wrote ${sidecar.replace(process.cwd() + "/", "")}`);

  return !anyFailed;
}

async function main() {
  const { slugs, force } = parseArgs(process.argv);

  try {
    await stat(CONTENT_DIR);
  } catch {
    console.error(`No ${CONTENT_DIR} directory. Create it first.`);
    process.exit(1);
  }

  const target = slugs.length > 0 ? slugs : await listSlugs();
  if (target.length === 0) {
    console.warn("No case-study slugs found. Nothing to do.");
    return;
  }

  let anyFailed = false;
  for (const slug of target) {
    console.log(`\n→ ${slug}`);
    const ok = await uploadSlug(slug, force);
    if (!ok) anyFailed = true;
  }

  console.log("");
  if (anyFailed) {
    console.error("Some uploads failed. See above.");
    process.exit(1);
  }
  console.log(`Uploaded ${target.length} slug(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
