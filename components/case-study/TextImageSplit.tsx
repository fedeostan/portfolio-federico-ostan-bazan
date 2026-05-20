import Image from "next/image";

import { Markdown } from "@/lib/case-study/markdown";
import { cn } from "@/lib/utils";
import type { ProjectAssetRow } from "@/lib/db/queries";

type TextImageSplitProps = {
  side: "left" | "right";
  contentMd?: string | null;
  asset: ProjectAssetRow | null;
  className?: string;
};

export function TextImageSplit({
  side,
  contentMd,
  asset,
  className,
}: TextImageSplitProps) {
  const imageBlock = asset ? (
    <div className="relative h-[430px] w-full max-w-[340px] overflow-hidden rounded-4xl md:shrink-0">
      <Image
        src={asset.url}
        alt={asset.alt_text ?? ""}
        fill
        sizes="340px"
        className="object-cover"
      />
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
