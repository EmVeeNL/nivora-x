import { Icon } from '@iconify/react'
import { cn } from '@/lib/utils'

interface Row {
  id: string
  label: string
  depth: number
  hasChildren: boolean
  expanded: boolean
}

const ROWS: Row[] = [
  { id: 'body', label: 'Body', depth: 0, hasChildren: true, expanded: true },
  { id: 'header', label: 'Header Section', depth: 1, hasChildren: true, expanded: true },
  { id: 'nav', label: 'Navigation', depth: 2, hasChildren: true, expanded: false },
  { id: 'logo', label: 'Logo', depth: 3, hasChildren: false, expanded: false },
  { id: 'nav-items', label: 'Nav Menu Items', depth: 3, hasChildren: false, expanded: false },
  { id: 'hero', label: 'Hero Section', depth: 1, hasChildren: true, expanded: true },
  { id: 'hero-img', label: 'Image Wrapper', depth: 2, hasChildren: false, expanded: false },
  { id: 'hero-content', label: 'Content Wrapper', depth: 2, hasChildren: true, expanded: true },
  { id: 'hero-h', label: 'Hero Heading', depth: 3, hasChildren: false, expanded: false },
  { id: 'hero-sub', label: 'Subtitle Text', depth: 3, hasChildren: false, expanded: false },
  { id: 'hero-btn', label: 'CTA Button', depth: 3, hasChildren: false, expanded: false },
  { id: 'features', label: 'Features Section', depth: 1, hasChildren: true, expanded: false },
  { id: 'footer', label: 'Footer Section', depth: 1, hasChildren: true, expanded: false },
]

export function NavigatorPlaceholder() {
  return (
    <ul role="tree" aria-label="Layer tree" className="select-none py-0.5">
      {ROWS.map((row) => (
        <li
          key={row.id}
          role="treeitem"
          aria-expanded={row.hasChildren ? row.expanded : undefined}
          style={{ paddingLeft: `${row.depth * 12 + 4}px` }}
          className="flex h-7 items-center gap-1 pr-2 text-xs text-foreground/80 hover:bg-accent/60"
        >
          {/* Expand / collapse chevron (static placeholder) */}
          <span className={cn('flex h-4 w-4 shrink-0 items-center justify-center')}>
            {row.hasChildren ? (
              <Icon
                icon={row.expanded ? 'tabler:chevron-down' : 'tabler:chevron-right'}
                width={12}
                height={12}
                className="text-muted-foreground"
              />
            ) : null}
          </span>

          {/* Label */}
          <span className="min-w-0 flex-1 truncate">{row.label}</span>

          {/* Visibility toggle placeholder */}
          <span className="invisible flex h-4 w-4 shrink-0 items-center justify-center group-hover:visible">
            <Icon icon="tabler:eye" width={12} height={12} className="text-muted-foreground" />
          </span>
        </li>
      ))}
    </ul>
  )
}
