import { Icon } from '@iconify/react'
import { cn } from '@/lib/utils'
import { useUiStore } from '@/state/uiStore'
import type { AppearanceView } from '@/state/uiStore'

interface NavItem {
  id: AppearanceView
  label: string
  icon: string
  available: boolean
}

const NAV_ITEMS: NavItem[] = [
  { id: 'themes', label: 'Themes', icon: 'tabler:brush', available: false },
  { id: 'templates', label: 'Templates', icon: 'tabler:layout', available: false },
  { id: 'global-styles', label: 'Global styles', icon: 'tabler:world', available: false },
  { id: 'tokens', label: 'Design tokens', icon: 'tabler:variable', available: true },
  { id: 'icons', label: 'Icons', icon: 'tabler:icons', available: true },
]

export function AppearancePanel() {
  const active = useUiStore((s) => s.appearanceView)

  return (
    <div className="flex flex-col gap-0.5 px-1 py-2">
      {NAV_ITEMS.map(({ id, label, icon, available }) => {
        const isActive = active === id
        return (
          <button
            key={id}
            type="button"
            disabled={!available}
            onClick={() => useUiStore.getState().setAppearanceView(id)}
            className={cn(
              'group flex w-full items-center gap-2.5 rounded px-2 py-1.5 text-left text-xs transition-colors',
              isActive
                ? 'bg-accent text-foreground'
                : available
                  ? 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                  : 'cursor-not-allowed text-muted-foreground/40',
            )}
          >
            <Icon icon={icon} width={14} height={14} className="shrink-0" />
            <span className="flex-1 truncate">{label}</span>
            {!available && (
              <span className="text-[9px] uppercase tracking-wider text-muted-foreground/40">
                soon
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
