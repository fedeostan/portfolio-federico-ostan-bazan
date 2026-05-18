export type ProjectCategory = 'ai' | 'mobile' | 'desktop' | 'personal'

export type ProjectHighlight = 'metrics' | 'process' | 'outcome'

export type ProjectCardProps = {
  id: string
  slug: string
  title: string
  summary: string
  category: ProjectCategory
  og_image: string | null
  tech_stack?: string[]
  role?: string | null
  year?: number | null
  highlight?: ProjectHighlight
}
