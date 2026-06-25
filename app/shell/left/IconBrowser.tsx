import { useState, useEffect, useCallback } from 'react'
import { Icon } from '@iconify/react'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Popular icon collections to surface in the browser
// ---------------------------------------------------------------------------

const COLLECTIONS = [
  { id: 'tabler', label: 'Tabler Icons' },
  { id: 'mdi', label: 'Material Design' },
  { id: 'heroicons', label: 'Heroicons' },
  { id: 'lucide', label: 'Lucide' },
  { id: 'ph', label: 'Phosphor' },
  { id: 'ri', label: 'Remix Icon' },
]

interface SearchResult {
  icons: string[]
  total: number
}

// ---------------------------------------------------------------------------
// Iconify API search
// ---------------------------------------------------------------------------

async function searchIconify(query: string, prefix?: string): Promise<string[]> {
  const params = new URLSearchParams({ limit: '80' })
  if (query) params.set('query', query)
  if (prefix) params.set('prefix', prefix)
  if (!query && !prefix) params.set('query', 'home')

  try {
    const res = await fetch(`https://api.iconify.design/search?${params.toString()}`)
    if (!res.ok) return []
    const data = (await res.json()) as SearchResult
    return data.icons
  } catch {
    return []
  }
}

// ---------------------------------------------------------------------------
// Copy helper
// ---------------------------------------------------------------------------

function copyToClipboard(text: string) {
  void navigator.clipboard.writeText(text)
}

// ---------------------------------------------------------------------------
// Icon grid item
// ---------------------------------------------------------------------------

interface IconItemProps {
  id: string
  isSelected: boolean
  onSelect: () => void
}

function IconItem({ id, isSelected, onSelect }: IconItemProps) {
  return (
    <button
      type="button"
      title={id}
      onClick={onSelect}
      className={cn(
        'group flex flex-col items-center justify-center gap-1 rounded p-2 transition-colors',
        isSelected ? 'bg-primary/20 ring-1 ring-primary' : 'hover:bg-accent/60',
      )}
    >
      <Icon icon={id} width={22} height={22} className="text-foreground" />
    </button>
  )
}

// ---------------------------------------------------------------------------
// Public component
// ---------------------------------------------------------------------------

export function IconBrowser() {
  const [query, setQuery] = useState('')
  const [activeCollection, setActiveCollection] = useState<string>('tabler')
  const [icons, setIcons] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const doSearch = useCallback(async (q: string, col: string) => {
    setLoading(true)
    setIcons([])
    const results = await searchIconify(q || 'a', col)
    setIcons(results)
    setLoading(false)
  }, [])

  useEffect(() => {
    void doSearch(query, activeCollection)
  }, [query, activeCollection, doSearch])

  function handleCopy(id: string) {
    copyToClipboard(id)
    setSelectedIcon(id)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background">
      {/* Header */}
      <div className="shrink-0 border-b border-border bg-shell-bar px-5 py-3">
        <h1 className="text-sm font-semibold text-foreground">Icon Browser</h1>
        <p className="mt-0.5 text-[10px] text-muted-foreground">
          Search icons from popular open-source collections.
        </p>
      </div>

      {/* Search + collections */}
      <div className="shrink-0 border-b border-border bg-shell-bar px-5 py-2.5">
        <div className="relative mb-2.5">
          <Icon
            icon="tabler:search"
            width={12}
            height={12}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/60"
          />
          <input
            type="text"
            placeholder="Search icons…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-7 w-full rounded border border-border bg-background pl-7 pr-2 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
          />
        </div>

        {/* Collection tabs */}
        <div className="flex flex-wrap gap-1">
          {COLLECTIONS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveCollection(id)}
              className={cn(
                'rounded px-2 py-1 text-[10px] transition-colors',
                activeCollection === id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-accent text-muted-foreground hover:text-foreground',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="flex min-h-0 flex-1">
        {/* Icon grid */}
        <div className="flex-1 overflow-y-auto p-3">
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <Icon
                icon="tabler:loader-2"
                width={20}
                height={20}
                className="animate-spin text-muted-foreground/50"
              />
            </div>
          ) : icons.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-center">
              <p className="text-[11px] text-muted-foreground/50">No icons found.</p>
            </div>
          ) : (
            <div
              className="grid gap-0.5"
              style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(40px, 1fr))' }}
            >
              {icons.map((id) => (
                <IconItem
                  key={id}
                  id={id}
                  isSelected={selectedIcon === id}
                  onSelect={() => setSelectedIcon(id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right: selected icon detail */}
        {selectedIcon && (
          <div className="w-56 shrink-0 border-l border-border bg-shell-bar">
            <div className="flex flex-col items-center gap-3 p-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-border bg-background">
                <Icon icon={selectedIcon} width={36} height={36} className="text-foreground" />
              </div>

              <div className="w-full text-center">
                <div className="truncate text-xs font-medium text-foreground" title={selectedIcon}>
                  {selectedIcon.split(':')[1] ?? selectedIcon}
                </div>
                <div className="mt-0.5 truncate text-[10px] text-muted-foreground/60">
                  {selectedIcon}
                </div>
              </div>

              <div className="flex w-full flex-col gap-1.5">
                <button
                  type="button"
                  onClick={() => handleCopy(selectedIcon)}
                  className="flex h-7 w-full items-center justify-center gap-1.5 rounded bg-primary text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
                >
                  <Icon icon={copied ? 'tabler:check' : 'tabler:copy'} width={12} height={12} />
                  {copied ? 'Copied!' : 'Copy icon ID'}
                </button>

                <button
                  type="button"
                  onClick={() => handleCopy(`<Icon icon="${selectedIcon}" />`)}
                  className="flex h-7 w-full items-center justify-center gap-1.5 rounded border border-border text-[11px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <Icon icon="tabler:code" width={11} height={11} />
                  Copy JSX
                </button>
              </div>

              {/* Preview sizes */}
              <div className="w-full">
                <div className="mb-1.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/50">
                  Preview
                </div>
                <div className="flex items-end gap-3">
                  {[12, 16, 20, 24, 32].map((size) => (
                    <div key={size} className="flex flex-col items-center gap-1">
                      <Icon
                        icon={selectedIcon}
                        width={size}
                        height={size}
                        className="text-foreground"
                      />
                      <span className="text-[8px] text-muted-foreground/50">{size}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer: total count */}
      {!loading && icons.length > 0 && (
        <div className="shrink-0 border-t border-border px-5 py-2">
          <span className="text-[10px] text-muted-foreground/50">
            {icons.length} icons · {COLLECTIONS.find((c) => c.id === activeCollection)?.label}
          </span>
        </div>
      )}
    </div>
  )
}
