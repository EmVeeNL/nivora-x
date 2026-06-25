import { Icon } from '@iconify/react'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipProvider } from '@/lib/ui/tooltip'
import { useUiStore } from '@/state/uiStore'
import { listLeftPanels } from './leftPanelRegistry'

export function LeftRail() {
  const activePanel = useUiStore((s) => s.activeLeftPanel)
  const editorTheme = useUiStore((s) => s.editorTheme)
  const panels = listLeftPanels()

  return (
    <TooltipProvider>
      <div className="flex flex-1 flex-col">
        {panels.map(({ id, label, icon }) => {
          const isActive = activePanel === id
          return (
            <Tooltip key={id} content={label} side="right">
              <button
                type="button"
                data-testid={`rail-btn-${id}`}
                aria-pressed={isActive}
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
            </Tooltip>
          )
        })}
      </div>

      {/* Theme toggle — pinned to bottom */}
      <Tooltip
        content={editorTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        side="right"
      >
        <button
          type="button"
          aria-label="Toggle editor theme"
          onClick={() => useUiStore.getState().toggleEditorTheme()}
          className="flex h-10 w-10 items-center justify-center text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
        >
          <Icon
            icon={editorTheme === 'dark' ? 'tabler:sun' : 'tabler:moon'}
            width={18}
            height={18}
          />
        </button>
      </Tooltip>
    </TooltipProvider>
  )
}
