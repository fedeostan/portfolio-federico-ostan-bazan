import { ProjectGallery } from "@/components/project/ProjectGallery";
import { SectionEmptyState } from "@/components/sections/SectionEmptyState";
import { SectionShellWithHeader } from "@/components/sections/SectionShellWithHeader";
import {
  listProjectsByCategory,
  type ProjectListItem,
} from "@/lib/db/queries";
import type { ProjectCardProps, ProjectCategory } from "@/types/project";

const TITLE = "Desktop";
const DESCRIPTION =
  "I started recognizing the power and flexibility of the big screen in my recent years. I have managed to push the limits of AI within this space and I'm very proud to show some of those projects here.";

function toCardProps(row: ProjectListItem): ProjectCardProps {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary ?? "",
    category: (row.category ?? "desktop") as ProjectCategory,
    og_image: row.og_image,
    tech_stack: row.tech_stack ?? undefined,
    role: row.role,
    year: row.year,
  };
}

interface SectionDesktopProps {
  id?: string;
}

export async function SectionDesktop({ id = "section-desktop" }: SectionDesktopProps) {
  const { data, error } = await listProjectsByCategory("desktop");

  if (error) {
    console.error("[SectionDesktop] listProjectsByCategory failed", error);
  }

  const items = (data ?? []).map(toCardProps);

  return (
    <SectionShellWithHeader id={id} title={TITLE} description={DESCRIPTION}>
      {items.length === 0 ? (
        <SectionEmptyState categoryLabel="Desktop" />
      ) : (
        <ProjectGallery items={items} />
      )}
    </SectionShellWithHeader>
  );
}
