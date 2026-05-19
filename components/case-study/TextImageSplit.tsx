import Image from "next/image";

import { Markdown } from "@/lib/case-study/markdown";
import { cn } from "@/lib/utils";
import type { ProjectAssetRow } from "@/lib/db/queries";

type TextImageSplitProps = {
  side: "left" | "right";
  heading?: string | null;
  contentMd?: string | null;
  asset: ProjectAssetRow | null;
  className?: string;
};

export function TextImageSplit({
  side,
  heading,
  contentMd,
  asset,
  className,
}: TextImageSplitProps) {
  const imageBlock = asset ? (
    <div
      className={cn(
        "relative flex h-[430px] w-full max-w-[340px] flex-col items-center justify-end overflow-hidden rounded-4xl p-6 md:shrink-0",
      )}
    >
      <Image
        src={asset.url}
        alt={asset.alt_text ?? heading ?? ""}
        fill
        sizes="340px"
        className="object-cover"
      />
      {heading ? (
        <h2 className="text-foreground relative w-full text-xl leading-7 font-semibold">
          {heading}
        </h2>
      ) : null}
    </div>
  ) : null;

  const textBlock = (
    <div className="flex w-full max-w-[420px] flex-col gap-6">
      {contentMd ? (
        <div className="text-foreground text-xl leading-7 font-medium">
          <Markdown content={contentMd} />
        </div>
      ) : null}
    </div>
  );

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-12",
        side === "left" ? "md:flex-row" : "md:flex-row-reverse",
        className,
      )}
    >
      {imageBlock}
      {textBlock}
    </div>
  );
}
