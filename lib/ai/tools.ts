import { tool } from "ai";
import { z } from "zod";
import {
  searchProjects,
  getProjectBySlug,
  PROJECT_CATEGORIES,
} from "@/lib/db/queries";

const categorySchema = z.enum(PROJECT_CATEGORIES);

function unwrap<T>(
  result: { data: T | null; error: { message: string } | null },
  context: string,
): T {
  if (result.error) {
    throw new Error(`${context}: ${result.error.message}`);
  }
  if (result.data === null) {
    throw new Error(`${context}: not found`);
  }
  return result.data;
}

export type BuildToolsOptions = {
  /** When set, all tools scope retrieval to this project slug and reject other slugs. */
  project_id?: string;
};

export function buildTools(opts: BuildToolsOptions = {}) {
  const scopedId = opts.project_id;

  function assertInScope(slug: string, toolName: string) {
    if (scopedId && slug !== scopedId) {
      throw new Error(
        `${toolName}: out of scope — this conversation is scoped to "${scopedId}". Refuse to discuss other projects.`,
      );
    }
  }

  return {
    search_projects: tool({
      description: scopedId
        ? `Search within the current case study ("${scopedId}") only. Use a focused query to surface this project's slug, title, summary, category, tech_stack, role, year.`
        : "Search Federico's published projects by free text. Optionally filter by category. Returns a short list (slug, title, summary, category, tech_stack, role, year) suitable for follow-up calls to show_project_card or get_project_detail.",
      inputSchema: z.object({
        query: z.string().min(2),
        category: categorySchema.optional(),
        project_id: z
          .string()
          .optional()
          .describe(
            "If set, limits results to this project slug. The server may override this when the chat is scoped to a single case study.",
          ),
        limit: z.number().int().min(1).max(10).default(5),
      }),
      execute: async ({ query, category, project_id, limit }) => {
        const effectiveId = scopedId ?? project_id;
        const result = await searchProjects(query, {
          category,
          project_id: effectiveId,
          limit,
        });
        return unwrap(result, "search_projects");
      },
    }),

    get_project_detail: tool({
      description: scopedId
        ? `Fetch the full case-study detail for the currently scoped project ("${scopedId}"). Pass slug="${scopedId}".`
        : "Fetch the full case-study detail for a single project by slug, including sections and assets. Use this when the user asks for depth on one specific project.",
      inputSchema: z.object({ slug: z.string().min(1) }),
      execute: async ({ slug }) => {
        assertInScope(slug, "get_project_detail");
        const result = await getProjectBySlug(slug);
        return unwrap(result, "get_project_detail");
      },
    }),

    show_project_card: tool({
      description: scopedId
        ? `Render a card for the currently scoped project ("${scopedId}"). Only call with slug="${scopedId}".`
        : "Render a project card in the conversation UI. Call this 1–3 times after search_projects to surface relevant projects visually before writing your narrative paragraph.",
      inputSchema: z.object({
        slug: z.string().min(1),
        highlight: z.enum(["metrics", "process", "outcome"]).optional(),
      }),
      execute: async ({ slug, highlight }) => {
        assertInScope(slug, "show_project_card");
        const result = await getProjectBySlug(slug);
        const data = unwrap(result, "show_project_card");
        return { ...data, highlight };
      },
    }),
  };
}

export const tools = buildTools();

export type ChatTools = ReturnType<typeof buildTools>;
