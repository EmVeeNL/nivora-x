import { Icon } from '@iconify/react'
import { cn } from '@/lib/utils'
import { useUiStore } from '@/state/uiStore'
import { listLeftPanels } from './leftPanelRegistry'

/**
 * Icon-only vertical rail on the left edge of the editor.
 * Clicking a panel icon opens that panel; clicking the active icon collapses it.
 * New panels appear here automatically when registered via leftPanelRegistry.
 */
export function LeftRail() {
  const activePanel = useUiStore((s) => s.activeLeftPanel)
  const panels = listLeftPanels()

  return (
    <>
      {panels.map(({ id, label, icon }) => {
        const isActive = activePanel === id
        return (
          <button
            key={id}
            type="button"
            data-testid={`rail-btn-${id}`}
            aria-pressed={isActive}
            title={label}
            aria-label={label}
            onClick={() => useUiStore.getState().setLeftPanel(isActive ? null : id)}
            className={cn(
              'relative flex h-10 w-10 items-center justify-center transition-colors',
              isActive
                ? 'text-foreground'
                : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
            )}
          >
            {isActive && (
              <span className="absolute bottom-2 left-0 top-2 w-0.5 rounded-r bg-primary" />
            )}
            <Icon icon={icon} width={20} height={20} />
          </button>
        )
      })}
    </>
  )
}
