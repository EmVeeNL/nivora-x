import { Button } from '@/lib/ui/button'
import { BreakpointSwitcher } from './BreakpointSwitcher'

export function TopToolbar() {
  return (
    <>
      {/* Left — page title + autosave indicator (reserved, Phase 09) */}
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span className="truncate text-sm font-medium text-foreground" aria-label="Page title">
          Untitled Page
        </span>
      </div>

      {/* Center — device / breakpoint switcher */}
      <div className="flex flex-1 justify-center">
        <BreakpointSwitcher />
      </div>

      {/* Right — Preview + Publish (visual only this phase) */}
      <div className="flex flex-1 items-center justify-end gap-2">
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
