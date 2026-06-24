import { Icon } from '@iconify/react'
import { cn } from '@/lib/utils'
import { useUiStore } from '@/state/uiStore'

interface PanelEntry {
  id: string
  label: string
  icon: string
}

const PANELS: PanelEntry[] = [
  { id: 'navigator', label: 'Navigator', icon: 'tabler:layers-subtract' },
]

export function ActivityBar() {
  const activePanel = useUiStore((s) => s.activeLeftPanel)

  return (
    <>
      {PANELS.map(({ id, label, icon }) => {
        const isActive = activePanel === id
        return (
          <button
            key={id}
            type="button"
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
            <Icon icon={icon} width={18} height={18} />
          </button>
        )
      })}
    </>
  )
}
