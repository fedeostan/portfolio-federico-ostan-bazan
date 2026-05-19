import { Gallery } from "@/components/case-study/Gallery";
import { MetricsRow } from "@/components/case-study/MetricsRow";
import { TextImageSplit } from "@/components/case-study/TextImageSplit";
import { Markdown } from "@/lib/case-study/markdown";
import {
  assetForImageTextSection,
  getGalleryAssets,
  normalizeSectionType,
  sortSections,
  splitSideFor,
} from "@/lib/case-study/sections";
import { cn } from "@/lib/utils";
import type {
  ProjectAssetRow,
  ProjectSectionRow,
  ProjectWithRelations,
} from "@/lib/db/queries";

type CaseStudyBodyProps = {
  project: ProjectWithRelations;
  className?: string;
};

function SectionHeading({ heading }: { heading: string | null | undefined }) {
  if (!heading) return null;
  return (
    <h2 className="text-foreground text-2xl leading-8 font-semibold">
      {heading}
    </h2>
  );
}

function TextSection({ section }: { section: ProjectSectionRow }) {
  return (
    <section className="mx-auto flex w-full max-w-[687px] flex-col gap-6">
      <SectionHeading heading={section.heading} />
      {section.content_md ? <Markdown content={section.content_md} /> : null}
    </section>
  );
}

function ImageTextSection({
  section,
  side,
  asset,
}: {
  section: ProjectSectionRow;
  side: "left" | "right";
  asset: ProjectAssetRow | null;
}) {
  return (
    <section className="w-full">
      <TextImageSplit
        side={side}
        heading={section.heading}
        contentMd={section.content_md}
        asset={asset}
      />
    </section>
  );
}

function MetricsSection({
  section,
  metrics,
}: {
  section: ProjectSectionRow;
  metrics: ProjectWithRelations["metrics"];
}) {
  return (
    <section className="mx-auto flex w-full max-w-[1140px] flex-col gap-6">
      <SectionHeading heading={section.heading} />
      <MetricsRow metrics={metrics as Record<string, string | number> | null} />
    </section>
  );
}

function GallerySection({
  section,
  assets,
}: {
  section: ProjectSectionRow;
  assets: ProjectAssetRow[];
}) {
  return (
    <section className="mx-auto flex w-full max-w-[1140px] flex-col gap-6">
      <SectionHeading heading={section.heading} />
      <Gallery assets={assets} />
    </section>
  );
}

export function CaseStudyBody({ project, className }: CaseStudyBodyProps) {
  const sections = sortSections(project.project_sections);
  const galleryAssets = getGalleryAssets(project.project_assets);

  return (
    <div className={cn("flex flex-col gap-12", className)}>
      {sections.map((section) => {
        const type = normalizeSectionType(section.section_type);
        switch (type) {
          case "image+text":
            return (
              <ImageTextSection
                key={section.id}
                section={section}
                side={splitSideFor(section, sections)}
                asset={assetForImageTextSection(section, sections, galleryAssets)}
              />
            );
          case "metrics":
            return (
              <MetricsSection
                key={section.id}
                section={section}
                metrics={project.metrics}
              />
            );
          case "gallery":
            return (
              <GallerySection
                key={section.id}
                section={section}
                assets={galleryAssets}
              />
            );
          case "text":
          default:
            return <TextSection key={section.id} section={section} />;
        }
      })}
    </div>
  );
}
