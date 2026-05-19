import Image from "next/image";

import { cn } from "@/lib/utils";

type ImageWithCaptionProps = {
  src: string;
  alt: string;
  caption?: string | null;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
};

export function ImageWithCaption({
  src,
  alt,
  caption,
  width = 1140,
  height = 720,
  className,
  priority = false,
  sizes = "(min-width: 1280px) 1140px, 100vw",
}: ImageWithCaptionProps) {
  return (
    <figure className={cn("flex flex-col gap-3", className)}>
      <div className="bg-surface relative w-full overflow-hidden rounded-4xl">
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          priority={priority}
          sizes={sizes}
          className="h-auto w-full object-cover"
        />
      </div>
      {caption ? (
        <figcaption className="text-muted-foreground text-center text-xs leading-4 font-normal">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
