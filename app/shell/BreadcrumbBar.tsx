import { cn } from '@/lib/utils'

const CRUMBS = ['Body', 'Page Wrapper', 'Hero Section', 'Content Wrapper', 'Hero Heading']

export function BreadcrumbBar() {
  return (
    <nav aria-label="Element breadcrumb" className="flex min-w-0 flex-1 items-center gap-0.5">
      {CRUMBS.map((crumb, index) => {
        const isLast = index === CRUMBS.length - 1
        return (
          <span key={crumb} className="flex items-center gap-0.5">
            <button
              type="button"
              aria-current={isLast ? 'location' : undefined}
              className={cn(
                'rounded px-1 py-0.5 text-xs transition-colors',
                isLast
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              )}
            >
              {crumb}
            </button>
            {!isLast && (
              <span aria-hidden="true" className="text-xs text-muted-foreground/50">
                ›
              </span>
            )}
          </span>
        )
      })}
    </nav>
  )
}
