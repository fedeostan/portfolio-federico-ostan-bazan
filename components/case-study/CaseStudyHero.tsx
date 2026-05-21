import Image from "next/image";

import { cn } from "@/lib/utils";
import type { ProjectAssetRow, ProjectWithRelations } from "@/lib/db/queries";

type CaseStudyHeroProps = {
  project: ProjectWithRelations;
  heroAsset: ProjectAssetRow | null;
  className?: string;
};

const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

function formatDate(project: ProjectWithRelations): string | null {
  if (project.year) {
    return String(project.year);
  }
  if (project.created_at) {
    return DATE_FORMATTER.format(new Date(project.created_at));
  }
  return null;
}

export function CaseStudyHero({ project, heroAsset, className }: CaseStudyHeroProps) {
  const date = formatDate(project);
  const tags = [project.category, project.role, project.client].filter(
    (v): v is string => Boolean(v),
  );

  return (
    <header className={cn("flex flex-col items-center gap-8 md:gap-12", className)}>
      <div className="flex w-full max-w-[610px] flex-col items-center gap-6 text-center">
        <div className="text-foreground flex flex-wrap items-center justify-center gap-6 text-base leading-6 font-medium">
          {date ? <span>{date}</span> : null}
          {tags.map((t) => (
            <span key={t} className="text-muted-foreground capitalize">
              {t}
            </span>
          ))}
        </div>
        <h1 className="text-foreground text-3xl leading-9 font-semibold md:text-4xl md:leading-10">
          {project.title}
        </h1>
        {project.summary ? (
          <p className="text-muted-foreground text-base leading-6 font-medium">
            {project.summary}
          </p>
        ) : null}
      </div>

      {heroAsset ? (
        <div className="bg-surface relative aspect-[4/3] w-full overflow-hidden rounded-4xl md:aspect-[1140/457]">
          <Image
            src={heroAsset.url}
            alt={heroAsset.alt_text ?? project.title}
            fill
            priority
            sizes="(min-width: 1280px) 1140px, 100vw"
            className="object-cover"
          />
        </div>
      ) : null}
    </header>
  );
}
