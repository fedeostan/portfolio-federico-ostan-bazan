import { ProjectGallery } from "@/components/project/ProjectGallery";
import { SectionEmptyState } from "@/components/sections/SectionEmptyState";
import { SectionShellWithHeader } from "@/components/sections/SectionShellWithHeader";
import {
  listProjectsByCategory,
  type ProjectListItem,
} from "@/lib/db/queries";
import type { ProjectCardProps, ProjectCategory } from "@/types/project";

const TITLE = "Artificial Intelligence";
const DESCRIPTION =
  "Here is my collection of A.I. related projects. I'm half obsessed with the potential of this technology and I feel the need to explore on my own in every free moment I have. Please enjoy exploring some of them as much as I enjoyed working on them.";

function toCardProps(row: ProjectListItem): ProjectCardProps {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary ?? "",
    category: (row.category ?? "ai") as ProjectCategory,
    og_image: row.og_image,
    tech_stack: row.tech_stack ?? undefined,
    role: row.role,
    year: row.year,
  };
}

interface SectionAIProps {
  id?: string;
}

export async function SectionAI({ id = "section-ai" }: SectionAIProps) {
  const { data, error } = await listProjectsByCategory("ai");

  if (error) {
    console.error("[SectionAI] listProjectsByCategory failed", error);
  }

  const items = (data ?? []).map(toCardProps);

  return (
    <SectionShellWithHeader id={id} title={TITLE} description={DESCRIPTION}>
      {items.length === 0 ? (
        <SectionEmptyState categoryLabel="AI" />
      ) : (
        <ProjectGallery items={items} />
      )}
    </SectionShellWithHeader>
  );
}
