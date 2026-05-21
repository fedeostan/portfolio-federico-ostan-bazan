import type { ProjectCategory } from "@/types/project";

export const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  ai: "Artificial Intelligence",
  mobile: "Mobile",
  desktop: "Desktop",
  personal: "Personal Projects",
};

export const CATEGORY_ORDER: ProjectCategory[] = [
  "ai",
  "mobile",
  "desktop",
  "personal",
];
