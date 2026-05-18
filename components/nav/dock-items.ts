import { Home, Sparkles, Smartphone, Monitor, Folder, Mail } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type DockItemKey =
  | 'home'
  | 'ai'
  | 'mobile'
  | 'desktop'
  | 'personal'
  | 'contact'

export type DockItem = {
  key: DockItemKey
  label: string
  icon: LucideIcon
  anchor: string
}

export const dockItems: readonly DockItem[] = [
  { key: 'home', label: 'Home', icon: Home, anchor: '#hero' },
  { key: 'ai', label: 'AI', icon: Sparkles, anchor: '#section-ai' },
  { key: 'mobile', label: 'Mobile', icon: Smartphone, anchor: '#section-mobile' },
  { key: 'desktop', label: 'Desktop', icon: Monitor, anchor: '#section-desktop' },
  { key: 'personal', label: 'Personal', icon: Folder, anchor: '#section-personal' },
  { key: 'contact', label: 'Contact', icon: Mail, anchor: '#section-contact' },
] as const
