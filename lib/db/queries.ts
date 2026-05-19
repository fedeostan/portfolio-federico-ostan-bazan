import { createServerClient } from "./client";
import type { Database } from "./types";

export const PROJECT_CATEGORIES = [
  "ai",
  "mobile",
  "desktop",
  "personal",
] as const;
export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];

const PROJECT_LIST_COLUMNS =
  "id, slug, title, summary, category, og_image, tech_stack, role, year" as const;

export type ProjectListItem = Pick<
  Database["public"]["Tables"]["projects"]["Row"],
  | "id"
  | "slug"
  | "title"
  | "summary"
  | "category"
  | "og_image"
  | "tech_stack"
  | "role"
  | "year"
>;

export type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];
export type ProjectSectionRow =
  Database["public"]["Tables"]["project_sections"]["Row"];
export type ProjectAssetRow =
  Database["public"]["Tables"]["project_assets"]["Row"];

export type ProjectWithRelations = ProjectRow & {
  project_sections: ProjectSectionRow[];
  project_assets: ProjectAssetRow[];
};

export type SearchProjectsOptions = {
  category?: ProjectCategory;
  project_id?: string;
  limit?: number;
};

export async function searchProjects(
  q: string,
  opts: SearchProjectsOptions = {},
) {
  const supabase = createServerClient();
  let query = supabase
    .from("projects")
    .select(PROJECT_LIST_COLUMNS)
    .eq("published", true)
    .textSearch("search_tsv", q, { type: "websearch", config: "simple" });

  if (opts.category) {
    query = query.eq("category", opts.category);
  }

  if (opts.project_id) {
    query = query.eq("slug", opts.project_id);
  }

  return query.limit(opts.limit ?? 5);
}

export async function getProjectBySlug(slug: string) {
  const supabase = createServerClient();
  return supabase
    .from("projects")
    .select("*, project_sections(*), project_assets(*)")
    .eq("slug", slug)
    .eq("published", true)
    .single<ProjectWithRelations>();
}

export async function listProjectsByCategory(
  category: ProjectCategory,
  opts: { limit?: number } = {},
) {
  const supabase = createServerClient();
  return supabase
    .from("projects")
    .select(PROJECT_LIST_COLUMNS)
    .eq("published", true)
    .eq("category", category)
    .order("year", { ascending: false, nullsFirst: false })
    .limit(opts.limit ?? 20);
}

export async function listProjectsForRedirect(excludeSlug: string) {
  const supabase = createServerClient();
  return supabase
    .from("projects")
    .select("slug, title, category, summary")
    .eq("published", true)
    .neq("slug", excludeSlug)
    .order("year", { ascending: false, nullsFirst: false });
}
