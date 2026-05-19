import { MetricCallout } from "@/components/project/MetricCallout";
import { cn } from "@/lib/utils";

type MetricsRowProps = {
  metrics: Record<string, string | number> | null | undefined;
  className?: string;
};

function isPlainRecord(
  value: unknown,
): value is Record<string, string | number> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

export function MetricsRow({ metrics, className }: MetricsRowProps) {
  if (!isPlainRecord(metrics)) return null;
  const entries = Object.entries(metrics).filter(
    ([, value]) => value !== null && value !== undefined && value !== "",
  );
  if (entries.length === 0) return null;

  return (
    <div
      className={cn(
        "grid w-full grid-cols-1 gap-12 md:grid-cols-3",
        className,
      )}
    >
      {entries.map(([label, value]) => (
        <MetricCallout key={label} n={value} label={label.replace(/_/g, " ")} />
      ))}
    </div>
  );
}
