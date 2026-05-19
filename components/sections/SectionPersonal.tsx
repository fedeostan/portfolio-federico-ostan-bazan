import { ProjectGallery } from "@/components/project/ProjectGallery";
import { SectionEmptyState } from "@/components/sections/SectionEmptyState";
import { SectionShellWithHeader } from "@/components/sections/SectionShellWithHeader";
import {
  listProjectsByCategory,
  type ProjectListItem,
} from "@/lib/db/queries";
import type { ProjectCardProps, ProjectCategory } from "@/types/project";

const TITLE = "Personal Projects";
const DESCRIPTION =
  "Half freelance half hobby, this is a collection of what I try to do on my free time. Lately occupying as much time as I can.";

function toCardProps(row: ProjectListItem): ProjectCardProps {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary ?? "",
    category: (row.category ?? "personal") as ProjectCategory,
    og_image: row.og_image,
    tech_stack: row.tech_stack ?? undefined,
    role: row.role,
    year: row.year,
  };
}

interface SectionPersonalProps {
  id?: string;
}

export async function SectionPersonal({
  id = "section-personal",
}: SectionPersonalProps) {
  const { data, error } = await listProjectsByCategory("personal");

  if (error) {
    console.error("[SectionPersonal] listProjectsByCategory failed", error);
  }

  const items = (data ?? []).map(toCardProps);

  return (
    <SectionShellWithHeader id={id} title={TITLE} description={DESCRIPTION}>
      {items.length === 0 ? (
        <SectionEmptyState categoryLabel="Personal" />
      ) : (
        <ProjectGallery items={items} />
      )}
    </SectionShellWithHeader>
  );
}
