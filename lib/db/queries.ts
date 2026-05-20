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
  // search_tsv is a STORED generated column built with the 'simple' config
  // (see 0001_initial_schema.sql::projects_search_doc). We intentionally keep
  // 'simple' here: the corpus is dominated by proper nouns / brand / stack
  // names where Porter stemming hurts more than it helps. Recall on abstract
  // JD-derived queries is solved by the retry+list_published_projects
  // fallback chain in the BRIEF-MODE workflow, not by a tsvector config swap.
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

export async function listPublishedProjects(opts: { limit?: number } = {}) {
  const supabase = createServerClient();
  return supabase
    .from("projects")
    .select(PROJECT_LIST_COLUMNS)
    .eq("published", true)
    .order("year", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(opts.limit ?? 6);
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
