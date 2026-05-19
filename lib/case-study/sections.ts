import type {
  ProjectAssetRow,
  ProjectSectionRow,
} from "@/lib/db/queries";

export const SECTION_TYPES = ["text", "image+text", "metrics", "gallery"] as const;
export type SectionType = (typeof SECTION_TYPES)[number];

/**
 * Normalises a raw section_type string from the DB into a known layout type.
 * Unknown / null values fall through to "text" so the page never crashes on
 * legacy seed data.
 */
export function normalizeSectionType(raw: string | null | undefined): SectionType {
  if (raw && (SECTION_TYPES as readonly string[]).includes(raw)) {
    return raw as SectionType;
  }
  return "text";
}

/**
 * Sort sections by their `order` field, treating null as Infinity so legacy
 * rows without an order land at the end deterministically.
 */
export function sortSections(sections: ProjectSectionRow[]): ProjectSectionRow[] {
  return [...sections].sort(
    (a, b) => (a.order ?? Number.POSITIVE_INFINITY) - (b.order ?? Number.POSITIVE_INFINITY),
  );
}

/**
 * Returns the first asset where `type = 'hero'`, ordered by `order`.
 * `null` if none — hero card is then skipped.
 */
export function getHeroAsset(assets: ProjectAssetRow[]): ProjectAssetRow | null {
  const heroes = assets
    .filter((a) => a.type === "hero")
    .sort((a, b) => (a.order ?? Number.POSITIVE_INFINITY) - (b.order ?? Number.POSITIVE_INFINITY));
  return heroes[0] ?? null;
}

/**
 * All non-hero assets, ordered by `order`. Used by Gallery and as the asset
 * pool for image+text splits.
 */
export function getGalleryAssets(assets: ProjectAssetRow[]): ProjectAssetRow[] {
  return assets
    .filter((a) => a.type !== "hero")
    .sort((a, b) => (a.order ?? Number.POSITIVE_INFINITY) - (b.order ?? Number.POSITIVE_INFINITY));
}

/**
 * For a given `image+text` section, returns the side the image should sit on.
 * Counts how many `image+text` sections precede this one (by sorted order)
 * and alternates: even index → 'left', odd index → 'right'. Matches the
 * Figma rhythm without requiring editor input.
 */
export function splitSideFor(
  section: ProjectSectionRow,
  allSections: ProjectSectionRow[],
): "left" | "right" {
  const sorted = sortSections(allSections).filter(
    (s) => normalizeSectionType(s.section_type) === "image+text",
  );
  const index = sorted.findIndex((s) => s.id === section.id);
  return index % 2 === 0 ? "left" : "right";
}

/**
 * Pairs an `image+text` section with one of the gallery assets, by matching
 * `order`. If no exact match, returns the asset at the same positional index
 * among image+text sections. If still none, returns null and TextImageSplit
 * renders text-only.
 */
export function assetForImageTextSection(
  section: ProjectSectionRow,
  allSections: ProjectSectionRow[],
  galleryAssets: ProjectAssetRow[],
): ProjectAssetRow | null {
  const exact = galleryAssets.find((a) => a.order === section.order);
  if (exact) return exact;
  const splits = sortSections(allSections).filter(
    (s) => normalizeSectionType(s.section_type) === "image+text",
  );
  const idx = splits.findIndex((s) => s.id === section.id);
  return galleryAssets[idx] ?? null;
}
