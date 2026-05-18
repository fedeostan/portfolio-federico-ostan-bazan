import { config as loadEnv } from "dotenv";
import { resolve } from "node:path";

loadEnv({ path: resolve(process.cwd(), ".env.local") });

import { createServerClient } from "@/lib/db/client";
import type { Database } from "@/lib/db/types";

type ProjectInsert = Database["public"]["Tables"]["projects"]["Insert"];
type SectionInsert =
  Database["public"]["Tables"]["project_sections"]["Insert"];
type AssetInsert = Database["public"]["Tables"]["project_assets"]["Insert"];

type SeedProject = ProjectInsert & {
  sections: Omit<SectionInsert, "project_id">[];
  assets: Omit<AssetInsert, "project_id">[];
};

const PROJECTS: SeedProject[] = [
  {
    slug: "seed-ai-project",
    title: "Aurora — AI Writing Companion",
    role: "Lead Product Designer",
    client: "Placeholder Labs",
    year: 2025,
    summary:
      "An AI-native writing tool that turns rough thoughts into structured drafts.",
    description:
      "Aurora is a placeholder AI project used to exercise the case-study template. It demonstrates end-to-end retrieval with sections, assets, and tech stack metadata.",
    tech_stack: ["Next.js", "AI SDK", "Vercel AI Gateway", "Supabase"],
    metrics: { adoption: "12k waitlist", retention: "44% D30" },
    category: "ai",
    og_image: "https://placehold.co/1200x630/png?text=Aurora",
    published: true,
    sections: [
      {
        section_type: "problem",
        heading: "The blank page is the enemy",
        content_md:
          "Writers stall at the first sentence. Aurora bridges intent and structure so first drafts arrive in minutes, not hours.",
        order: 1,
      },
      {
        section_type: "solution",
        heading: "Outline-first AI",
        content_md:
          "Instead of generating prose first, Aurora generates a navigable outline you can edit before any paragraph is written.",
        order: 2,
      },
      {
        section_type: "outcome",
        heading: "Outcomes",
        content_md:
          "Beta users shipped 3.4× more drafts per week without sacrificing voice consistency.",
        order: 3,
      },
    ],
    assets: [
      {
        type: "hero",
        url: "https://placehold.co/1600x900/png?text=Aurora+Hero",
        alt_text: "Aurora hero placeholder",
        caption: "Hero shot — placeholder",
        order: 1,
      },
      {
        type: "screenshot",
        url: "https://placehold.co/1200x800/png?text=Aurora+Outline",
        alt_text: "Outline editor screen",
        caption: "Outline-first editor",
        order: 2,
      },
    ],
  },
  {
    slug: "seed-mobile-project",
    title: "Tide — Mobile Meditation",
    role: "Senior Product Designer",
    client: "Placeholder Wellness",
    year: 2024,
    summary:
      "A mobile-first meditation app with adaptive session length based on heart-rate variability.",
    description:
      "Tide is a placeholder mobile project used to exercise retrieval and the mobile category filter.",
    tech_stack: ["React Native", "Expo", "HealthKit", "TypeScript"],
    metrics: { rating: "4.8 App Store", sessions: "2.1M monthly" },
    category: "mobile",
    og_image: "https://placehold.co/1200x630/png?text=Tide",
    published: true,
    sections: [
      {
        section_type: "problem",
        heading: "Sessions that don't fit your day",
        content_md:
          "Most meditation apps assume a fixed 10-minute window. Tide adapts to the time and energy you actually have.",
        order: 1,
      },
      {
        section_type: "solution",
        heading: "Adaptive sessions",
        content_md:
          "We use HRV signals and a quick mood check to pick a 2–20 minute session that suits the moment.",
        order: 2,
      },
    ],
    assets: [
      {
        type: "hero",
        url: "https://placehold.co/1600x900/png?text=Tide+Hero",
        alt_text: "Tide hero placeholder",
        caption: "Hero shot — placeholder",
        order: 1,
      },
    ],
  },
  {
    slug: "seed-desktop-project",
    title: "Quartz — Desktop Code Map",
    role: "Design Engineer",
    client: "Placeholder Devtools",
    year: 2023,
    summary:
      "A native desktop app that visualises large codebases as zoomable maps.",
    description:
      "Quartz is a placeholder desktop project used to exercise the desktop category and the case-study layout for dense technical content.",
    tech_stack: ["Tauri", "Rust", "WebGL", "TypeScript"],
    metrics: { repos_indexed: "8k", users: "1.2k weekly active" },
    category: "desktop",
    og_image: "https://placehold.co/1200x630/png?text=Quartz",
    published: true,
    sections: [
      {
        section_type: "problem",
        heading: "Codebases as terra incognita",
        content_md:
          "New engineers spend weeks orienting in a large repo. Quartz makes structure visible at a glance.",
        order: 1,
      },
      {
        section_type: "solution",
        heading: "Zoomable architecture maps",
        content_md:
          "We render a force-directed graph in WebGL, with semantic zoom from system → module → file.",
        order: 2,
      },
    ],
    assets: [
      {
        type: "hero",
        url: "https://placehold.co/1600x900/png?text=Quartz+Hero",
        alt_text: "Quartz hero placeholder",
        caption: "Hero shot — placeholder",
        order: 1,
      },
    ],
  },
];

async function main() {
  const supabase = createServerClient();

  for (const { sections, assets, ...project } of PROJECTS) {
    const { data: inserted, error: projectError } = await supabase
      .from("projects")
      .insert(project)
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
        .insert(sections.map((s) => ({ ...s, project_id: projectId })));
      if (sectionsError) {
        throw new Error(
          `Failed to insert sections for ${project.slug}: ${sectionsError.message}`,
        );
      }
    }

    if (assets.length > 0) {
      const { error: assetsError } = await supabase
        .from("project_assets")
        .insert(assets.map((a) => ({ ...a, project_id: projectId })));
      if (assetsError) {
        throw new Error(
          `Failed to insert assets for ${project.slug}: ${assetsError.message}`,
        );
      }
    }

    console.log(`  ✓ ${project.slug}`);
  }

  console.log(`Seeded ${PROJECTS.length} projects`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
