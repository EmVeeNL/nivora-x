import { Icon } from '@iconify/react'
import { useUiStore } from '@/state/uiStore'
import { NavigatorPlaceholder } from './NavigatorPlaceholder'

export function LeftPanel() {
  const isOpen = useUiStore((s) => s.leftPanelOpen)

  if (!isOpen) {
    return (
      <div className="flex h-full w-full items-start justify-center pt-2">
        <button
          type="button"
          onClick={() => useUiStore.getState().toggleLeftPanel()}
          aria-label="Expand navigation panel"
          title="Expand panel"
          className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Icon icon="tabler:chevron-right" width={16} height={16} />
        </button>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Panel header */}
      <div className="flex h-9 shrink-0 items-center justify-between border-b border-border px-3">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-label">
          Navigation
        </span>
        <button
          type="button"
          onClick={() => useUiStore.getState().toggleLeftPanel()}
          aria-label="Collapse navigation panel"
          title="Collapse panel"
          className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Icon icon="tabler:chevron-left" width={14} height={14} />
        </button>
      </div>

      {/* Panel body */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <NavigatorPlaceholder />
      </div>
    </div>
  )
}
