import { ImageWithCaption } from "@/components/case-study/ImageWithCaption";
import { cn } from "@/lib/utils";
import type { ProjectAssetRow } from "@/lib/db/queries";

type GalleryProps = {
  assets: ProjectAssetRow[];
  className?: string;
};

export function Gallery({ assets, className }: GalleryProps) {
  if (assets.length === 0) return null;

  return (
    <div className={cn("flex w-full flex-col gap-12", className)}>
      {assets.map((asset) => (
        <ImageWithCaption
          key={asset.id}
          src={asset.url}
          alt={asset.alt_text ?? ""}
          caption={asset.caption}
        />
      ))}
    </div>
  );
}
