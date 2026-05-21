import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CaseStudyBody } from "@/components/case-study/CaseStudyBody";
import {
  CaseStudyDock,
  type CaseStudyDockGroup,
} from "@/components/case-study/CaseStudyDock";
import { CaseStudyHero } from "@/components/case-study/CaseStudyHero";
import { ProjectChat } from "@/components/case-study/ProjectChat";
import { createServerClient } from "@/lib/db/client";
import { getProjectBySlug, listPublishedProjects } from "@/lib/db/queries";
import { getHeroAsset } from "@/lib/case-study/sections";
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
} from "@/lib/constants/categories";
import type { ProjectCategory } from "@/types/project";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("projects")
    .select("slug")
    .eq("published", true);
  return (data ?? []).map((row) => ({ slug: row.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { data: project } = await getProjectBySlug(slug);
  if (!project) return {};

  const title = `${project.title} — Federico Ostan-Bazán`;
  const description = project.summary ?? undefined;
  const ogImage = project.og_image ?? undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function CaseStudyPage({ params }: PageProps) {
  const { slug } = await params;
  const [{ data: project }, { data: allProjects }] = await Promise.all([
    getProjectBySlug(slug),
    listPublishedProjects({ limit: 100 }),
  ]);
  if (!project) return notFound();

  const heroAsset = getHeroAsset(project.project_assets);

  const dockGroups: CaseStudyDockGroup[] = CATEGORY_ORDER.flatMap(
    (category) => {
      const items = (allProjects ?? [])
        .filter((p) => p.category === category)
        .map((p) => ({ slug: p.slug, title: p.title }));
      if (items.length === 0) return [];
      return [
        {
          category: category as ProjectCategory,
          label: CATEGORY_LABELS[category],
          items,
        },
      ];
    },
  );

  return (
    <>
      <article className="mx-auto flex w-full max-w-[1140px] flex-col gap-12 px-6 py-12 md:px-12 lg:px-[150px] lg:py-20">
        <CaseStudyHero project={project} heroAsset={heroAsset} />
        <CaseStudyBody project={project} />
      </article>
      <ProjectChat projectId={project.slug} projectTitle={project.title} />
      <CaseStudyDock
        groups={dockGroups}
        currentSlug={project.slug}
        currentTitle={project.title}
      />
    </>
  );
}
