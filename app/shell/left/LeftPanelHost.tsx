import { useUiStore } from '@/state/uiStore'
import { listLeftPanels } from './leftPanelRegistry'

/**
 * Renders the currently active left panel, looked up from the panel registry.
 * Returns null when no panel is active (sidebar collapsed).
 */
export function LeftPanelHost() {
  const activePanel = useUiStore((s) => s.activeLeftPanel)

  if (!activePanel) return null

  const entry = listLeftPanels().find((p) => p.id === activePanel)
  if (!entry) return null

  const PanelComponent = entry.component

  return (
    <div data-testid="left-panel-host" className="flex h-full flex-col overflow-hidden">
      <div className="flex h-9 shrink-0 items-center border-b border-border px-3">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {entry.label}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <PanelComponent />
      </div>
    </div>
  )
}
