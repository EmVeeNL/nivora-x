import { Icon } from '@iconify/react'
import { Button } from '@/lib/ui/button'
import { getBreakpointLabelFromList, getBreakpointWidthFromList } from '@/breakpoints/config'
import { useUiStore } from '@/state/uiStore'
import { CanvasFrame } from '@/canvas/CanvasFrame'

export function PreviewMode() {
  const breakpoints = useUiStore((s) => s.breakpoints)
  const activeBreakpoint = useUiStore((s) => s.activeBreakpoint)
  const frameWidth = getBreakpointWidthFromList(breakpoints, activeBreakpoint)
  const label = getBreakpointLabelFromList(breakpoints, activeBreakpoint)

  return (
    <div data-testid="preview-mode" className="flex h-full min-h-0 flex-col bg-canvas-chrome">
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-shell-bar px-4">
        <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
          <Icon icon="tabler:eye" width={14} height={14} />
          <span data-testid="preview-breakpoint-label" className="truncate">
            {label} · {frameWidth}px
          </span>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-label="Exit preview"
          onClick={() => useUiStore.getState().setPreviewMode(false)}
        >
          Exit Preview
        </Button>
      </header>

      <main className="min-h-0 flex-1">
        <CanvasFrame clean />
      </main>
    </div>
  )
}
