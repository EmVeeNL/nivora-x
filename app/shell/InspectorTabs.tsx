import { cn } from '@/lib/utils'
import { useUiStore } from '@/state/uiStore'

interface Tab {
  id: string
  label: string
}

const DEFAULT_TABS: Tab[] = [
  { id: 'style', label: 'Style' },
  { id: 'settings', label: 'Settings' },
]

interface InspectorTabsProps {
  tabs?: Tab[]
}

export function InspectorTabs({ tabs = DEFAULT_TABS }: InspectorTabsProps) {
  const activeTab = useUiStore((s) => s.activeInspectorTab)

  return (
    <div
      role="tablist"
      aria-label="Inspector tabs"
      className="flex shrink-0 border-b border-border"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          type="button"
          aria-selected={activeTab === tab.id}
          onClick={() => useUiStore.getState().setInspectorTab(tab.id)}
          className={cn(
            'flex h-9 flex-1 items-center justify-center text-xs font-medium transition-colors',
            activeTab === tab.id
              ? 'border-b-2 border-primary text-foreground'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
