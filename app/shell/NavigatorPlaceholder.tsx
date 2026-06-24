import { Icon } from '@iconify/react'
import { cn } from '@/lib/utils'

type ElementKind = 'body' | 'section' | 'nav' | 'image' | 'text' | 'button' | 'generic'

interface Row {
  id: string
  label: string
  depth: number
  hasChildren: boolean
  expanded: boolean
  kind: ElementKind
}

const KIND_COLOR: Record<ElementKind, string> = {
  body: 'bg-blue-500/70',
  section: 'bg-violet-500/60',
  nav: 'bg-teal-500/60',
  image: 'bg-green-500/60',
  text: 'bg-foreground/30',
  button: 'bg-primary/80',
  generic: 'bg-foreground/20',
}

const ROWS: Row[] = [
  { id: 'body', label: 'Body', depth: 0, hasChildren: true, expanded: true, kind: 'body' },
  {
    id: 'header',
    label: 'Header Section',
    depth: 1,
    hasChildren: true,
    expanded: true,
    kind: 'section',
  },
  {
    id: 'nav',
    label: 'Navigation',
    depth: 2,
    hasChildren: true,
    expanded: false,
    kind: 'nav',
  },
  { id: 'logo', label: 'Logo', depth: 3, hasChildren: false, expanded: false, kind: 'image' },
  {
    id: 'nav-items',
    label: 'Nav Menu Items',
    depth: 3,
    hasChildren: false,
    expanded: false,
    kind: 'nav',
  },
  {
    id: 'hero',
    label: 'Hero Section',
    depth: 1,
    hasChildren: true,
    expanded: true,
    kind: 'section',
  },
  {
    id: 'hero-img',
    label: 'Image Wrapper',
    depth: 2,
    hasChildren: false,
    expanded: false,
    kind: 'image',
  },
  {
    id: 'hero-content',
    label: 'Content Wrapper',
    depth: 2,
    hasChildren: true,
    expanded: true,
    kind: 'generic',
  },
  {
    id: 'hero-h',
    label: 'Hero Heading',
    depth: 3,
    hasChildren: false,
    expanded: false,
    kind: 'text',
  },
  {
    id: 'hero-sub',
    label: 'Subtitle Text',
    depth: 3,
    hasChildren: false,
    expanded: false,
    kind: 'text',
  },
  {
    id: 'hero-btn',
    label: 'CTA Button',
    depth: 3,
    hasChildren: false,
    expanded: false,
    kind: 'button',
  },
  {
    id: 'features',
    label: 'Features Section',
    depth: 1,
    hasChildren: true,
    expanded: false,
    kind: 'section',
  },
  {
    id: 'footer',
    label: 'Footer Section',
    depth: 1,
    hasChildren: true,
    expanded: false,
    kind: 'section',
  },
]

/** The id of the statically "selected" placeholder item. */
const SELECTED_ID = 'hero'

export function NavigatorPlaceholder() {
  return (
    <ul role="tree" aria-label="Layer tree" className="select-none py-0.5">
      {ROWS.map((row) => {
        const isSelected = row.id === SELECTED_ID
        return (
          <li
            key={row.id}
            role="treeitem"
            aria-selected={isSelected}
            aria-expanded={row.hasChildren ? row.expanded : undefined}
            style={{ paddingLeft: `${row.depth * 12 + 4}px` }}
            className={cn(
              'group flex h-7 items-center gap-1 pr-2 text-xs',
              isSelected
                ? 'border-l-2 border-selection bg-selection-muted text-foreground'
                : 'border-l-2 border-transparent text-foreground/80 hover:bg-accent/60',
            )}
          >
            {/* Expand / collapse chevron (static placeholder) */}
            <span className="flex h-4 w-4 shrink-0 items-center justify-center">
              {row.hasChildren ? (
                <Icon
                  icon={row.expanded ? 'tabler:chevron-down' : 'tabler:chevron-right'}
                  width={12}
                  height={12}
                  className="text-muted-foreground"
                />
              ) : null}
            </span>

            {/* Element-type colour indicator */}
            <span
              aria-hidden="true"
              className={cn('h-2.5 w-2.5 shrink-0 rounded-sm', KIND_COLOR[row.kind])}
            />

            {/* Label */}
            <span className="min-w-0 flex-1 truncate">{row.label}</span>

            {/* Visibility toggle (shown on row hover via group) */}
            <span className="invisible flex h-4 w-4 shrink-0 items-center justify-center group-hover:visible">
              <Icon icon="tabler:eye" width={12} height={12} className="text-muted-foreground" />
            </span>
          </li>
        )
      })}
    </ul>
  )
}
