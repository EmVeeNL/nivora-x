import { useEffect, useState, useMemo } from 'react'
import { Icon } from '@iconify/react'
import { listElementDefinitions } from '@/elements/registry'
import { ElementCard } from './ElementCard'

type ElementDefs = ReturnType<typeof listElementDefinitions>

function groupByCategory(defs: ElementDefs, query: string): Map<string, ElementDefs> {
  const q = query.toLowerCase().trim()
  const filtered = q
    ? defs.filter(
        (d) =>
          d.label.toLowerCase().includes(q) ||
          d.type.toLowerCase().includes(q) ||
          d.category.toLowerCase().includes(q),
      )
    : defs

  const map = new Map<string, ElementDefs>()
  for (const def of filtered) {
    const cat = def.category || 'Other'
    const group = map.get(cat) ?? []
    group.push(def)
    map.set(cat, group)
  }
  return map
}

/**
 * Categorized, searchable grid of all registered element types.
 * Each entry is a draggable ElementCard (drag wiring: canvas/dnd/DndProvider).
 */
export function ElementLibraryPanel() {
  const [query, setQuery] = useState('')
  const defs = useMemo(() => listElementDefinitions(), [])
  const grouped = useMemo(() => groupByCategory(defs, query), [defs, query])
  const categories = useMemo(() => Array.from(grouped.entries()), [grouped])
  const [openCategories, setOpenCategories] = useState<Set<string>>(() => {
    const first = groupByCategory(listElementDefinitions(), '').keys().next().value
    return first ? new Set([first]) : new Set()
  })

  useEffect(() => {
    const first = categories[0]?.[0]
    setOpenCategories(first ? new Set([first]) : new Set())
  }, [query, categories])

  function toggleCategory(category: string) {
    setOpenCategories((current) => {
      const next = new Set(current)
      if (next.has(category)) next.delete(category)
      else next.add(category)
      return next
    })
  }

  return (
    <div className="flex flex-col">
      {/* Search */}
      <div className="sticky top-0 z-10 bg-background px-2 pb-2 pt-2.5">
        <div className="relative">
          <Icon
            icon="tabler:search"
            width={13}
            height={13}
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/60"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search elements…"
            aria-label="Search elements"
            className="h-7 w-full rounded-md border border-border/50 bg-muted/30 pl-7 pr-2 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none focus:ring-0"
          />
        </div>
      </div>

      {/* Empty state */}
      {grouped.size === 0 && (
        <p className="px-3 py-6 text-center text-[11px] text-muted-foreground/60">
          No elements found
        </p>
      )}

      {/* Categories */}
      <div className="pb-3">
        {categories.map(([category, items]) => (
          <div key={category} className="mt-3">
            <button
              type="button"
              className="mb-1 flex h-6 w-full items-center gap-1 px-2.5 text-left text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/60 hover:text-muted-foreground"
              aria-expanded={openCategories.has(category)}
              onClick={() => toggleCategory(category)}
            >
              <Icon
                icon={openCategories.has(category) ? 'tabler:chevron-down' : 'tabler:chevron-right'}
                width={11}
                height={11}
                className="shrink-0"
              />
              <span className="min-w-0 flex-1 truncate">{category}</span>
            </button>
            {openCategories.has(category) && (
              <div className="grid grid-cols-3 gap-px px-1.5">
                {items.map((def) => (
                  <ElementCard key={def.type} def={def} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
