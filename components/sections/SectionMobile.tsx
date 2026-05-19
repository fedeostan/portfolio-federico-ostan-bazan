import { ProjectGallery } from "@/components/project/ProjectGallery";
import { SectionEmptyState } from "@/components/sections/SectionEmptyState";
import { SectionShellWithHeader } from "@/components/sections/SectionShellWithHeader";
import {
  listProjectsByCategory,
  type ProjectListItem,
} from "@/lib/db/queries";
import type { ProjectCardProps, ProjectCategory } from "@/types/project";

const TITLE = "Mobile";
const DESCRIPTION =
  "Crazy enough I started my career and have the majority of my experience working on mobile native environments. Here are some of my most professional experiences within the rectangular aspect ratio that fits in your palm.";

function toCardProps(row: ProjectListItem): ProjectCardProps {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary ?? "",
    category: (row.category ?? "mobile") as ProjectCategory,
    og_image: row.og_image,
    tech_stack: row.tech_stack ?? undefined,
    role: row.role,
    year: row.year,
  };
}

interface SectionMobileProps {
  id?: string;
}

export async function SectionMobile({ id = "section-mobile" }: SectionMobileProps) {
  const { data, error } = await listProjectsByCategory("mobile");

  if (error) {
    console.error("[SectionMobile] listProjectsByCategory failed", error);
  }

  const items = (data ?? []).map(toCardProps);

  return (
    <SectionShellWithHeader id={id} title={TITLE} description={DESCRIPTION}>
      {items.length === 0 ? (
        <SectionEmptyState categoryLabel="Mobile" />
      ) : (
        <ProjectGallery items={items} />
      )}
    </SectionShellWithHeader>
  );
}
