import { Icon } from '@iconify/react'
import { cn } from '@/lib/utils'
import { Button } from '@/lib/ui/button'
import { BreakpointSwitcher } from './BreakpointSwitcher'

declare global {
  interface Window {
    nivoraxBootstrap?: {
      postId: number
      mode: string
      restRoot: string
      restNonce: string
      adminUrl: string
      pagesUrl: string
      homeUrl: string
      siteName: string
      version: string
    }
  }
}

export function TopToolbar() {
  const bs = typeof window !== 'undefined' ? window.nivoraxBootstrap : undefined
  const pagesUrl = bs?.pagesUrl ?? '#'
  const homeUrl = bs?.homeUrl ?? '#'
  const siteName = bs?.siteName ?? 'NivoraX'

  return (
    <>
      {/* Left — back to pages + site name */}
      <div className="flex min-w-0 flex-1 items-center gap-1">
        <a
          href={pagesUrl}
          aria-label="Back to all pages"
          title="All Pages"
          className={cn(
            'flex h-7 items-center gap-1.5 rounded px-2 text-xs text-muted-foreground',
            'transition-colors hover:bg-accent hover:text-foreground',
          )}
        >
          <Icon icon="tabler:arrow-left" width={14} height={14} />
          <span className="hidden sm:inline">All Pages</span>
        </a>

        <span className="text-border/60 select-none">·</span>

        <a
          href={homeUrl}
          target="_blank"
          rel="noreferrer"
          aria-label={`Visit ${siteName}`}
          title={`Visit ${siteName}`}
          className={cn(
            'flex h-7 items-center gap-1.5 rounded px-2 text-xs text-muted-foreground',
            'transition-colors hover:bg-accent hover:text-foreground',
          )}
        >
          <Icon icon="tabler:world" width={14} height={14} />
          <span className="hidden md:inline">{siteName}</span>
        </a>

        <span className="text-border/60 mx-1 select-none">|</span>

        <span className="truncate text-xs font-medium text-foreground" aria-label="Page title">
          Untitled Page
        </span>
      </div>

      {/* Center — device / breakpoint switcher */}
      <div className="flex flex-1 justify-center">
        <BreakpointSwitcher />
      </div>

      {/* Right — Save Draft · Preview · Publish (visual only this phase) */}
      <div className="flex flex-1 items-center justify-end gap-2">
        <Button variant="ghost" size="sm" aria-label="Save draft">
          Save Draft
        </Button>
        <Button variant="ghost" size="sm" aria-label="Preview page">
          Preview
        </Button>
        <Button size="sm" aria-label="Publish page">
          Publish
        </Button>
      </div>
    </>
  )
}
