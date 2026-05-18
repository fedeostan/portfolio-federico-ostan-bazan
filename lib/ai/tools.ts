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

export const tools = {
  search_projects: tool({
    description:
      "Search Federico's published projects by free text. Optionally filter by category. Returns a short list (slug, title, summary, category, tech_stack, role, year) suitable for follow-up calls to show_project_card or get_project_detail.",
    inputSchema: z.object({
      query: z.string().min(2),
      category: categorySchema.optional(),
      limit: z.number().int().min(1).max(10).default(5),
    }),
    execute: async ({ query, category, limit }) => {
      const result = await searchProjects(query, { category, limit });
      return unwrap(result, "search_projects");
    },
  }),

  get_project_detail: tool({
    description:
      "Fetch the full case-study detail for a single project by slug, including sections and assets. Use this when the user asks for depth on one specific project.",
    inputSchema: z.object({ slug: z.string().min(1) }),
    execute: async ({ slug }) => {
      const result = await getProjectBySlug(slug);
      return unwrap(result, "get_project_detail");
    },
  }),

  show_project_card: tool({
    description:
      "Render a project card in the conversation UI. Call this 1–3 times after search_projects to surface relevant projects visually before writing your narrative paragraph.",
    inputSchema: z.object({
      slug: z.string().min(1),
      highlight: z.enum(["metrics", "process", "outcome"]).optional(),
    }),
    execute: async ({ slug, highlight }) => {
      const result = await getProjectBySlug(slug);
      const data = unwrap(result, "show_project_card");
      return { ...data, highlight };
    },
  }),
};

export type ChatTools = typeof tools;
