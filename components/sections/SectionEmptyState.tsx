interface SectionEmptyStateProps {
  categoryLabel: string;
}

export function SectionEmptyState({ categoryLabel }: SectionEmptyStateProps) {
  return (
    <div
      className="border-border bg-card text-muted-foreground flex h-[430px] w-full items-center justify-center rounded-[26px] border border-dashed px-6 text-center text-sm"
      role="status"
    >
      <p>
        No {categoryLabel} projects published yet — check back soon, or get in
        touch.
      </p>
    </div>
  );
}
