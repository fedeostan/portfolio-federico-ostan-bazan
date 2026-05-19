import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CaseStudyBody } from "@/components/case-study/CaseStudyBody";
import { CaseStudyHero } from "@/components/case-study/CaseStudyHero";
import { createServerClient } from "@/lib/db/client";
import { getProjectBySlug } from "@/lib/db/queries";
import { getHeroAsset } from "@/lib/case-study/sections";

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
  const { data: project } = await getProjectBySlug(slug);
  if (!project) return notFound();

  const heroAsset = getHeroAsset(project.project_assets);

  return (
    <article className="mx-auto flex w-full max-w-[1140px] flex-col gap-12 px-6 py-12 md:px-12 lg:px-[150px] lg:py-20">
      <CaseStudyHero project={project} heroAsset={heroAsset} />
      <CaseStudyBody project={project} />
    </article>
  );
}
