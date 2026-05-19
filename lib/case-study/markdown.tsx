import Link from "next/link";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

import { ImageWithCaption } from "@/components/case-study/ImageWithCaption";
import { cn } from "@/lib/utils";

type MarkdownProps = {
  content: string;
  className?: string;
};

const components: Components = {
  p({ children }) {
    return (
      <p className="text-muted-foreground text-base leading-6 font-medium">
        {children}
      </p>
    );
  },
  h1({ children }) {
    return (
      <h1 className="text-foreground text-2xl leading-8 font-semibold">
        {children}
      </h1>
    );
  },
  h2({ children }) {
    return (
      <h2 className="text-foreground text-2xl leading-8 font-semibold">
        {children}
      </h2>
    );
  },
  h3({ children }) {
    return (
      <h3 className="text-foreground text-xl leading-7 font-semibold">
        {children}
      </h3>
    );
  },
  ul({ children }) {
    return (
      <ul className="text-muted-foreground list-disc space-y-2 pl-6 text-base leading-6 font-medium">
        {children}
      </ul>
    );
  },
  ol({ children }) {
    return (
      <ol className="text-muted-foreground list-decimal space-y-2 pl-6 text-base leading-6 font-medium">
        {children}
      </ol>
    );
  },
  strong({ children }) {
    return <strong className="text-foreground font-semibold">{children}</strong>;
  },
  a({ href, children }) {
    if (!href) return <span>{children}</span>;
    const isExternal = /^https?:\/\//.test(href);
    if (isExternal) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="text-foreground underline underline-offset-4 hover:no-underline"
        >
          {children}
        </a>
      );
    }
    return (
      <Link
        href={href}
        className="text-foreground underline underline-offset-4 hover:no-underline"
      >
        {children}
      </Link>
    );
  },
  img({ src, alt, title }) {
    if (typeof src !== "string") return null;
    return <ImageWithCaption src={src} alt={alt ?? ""} caption={title} />;
  },
  code({ children }) {
    return (
      <code className="bg-accent text-foreground rounded-sm px-1.5 py-0.5 font-mono text-sm">
        {children}
      </code>
    );
  },
};

export function Markdown({ content, className }: MarkdownProps) {
  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
