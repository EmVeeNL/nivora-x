import { Icon } from '@iconify/react'
import { useUiStore } from '@/state/uiStore'

interface Tab {
  id: string
  label: string
  icon?: string
}

const DEFAULT_TABS: Tab[] = [
  { id: 'inspector', label: 'Style', icon: 'tabler:palette' },
  { id: 'block', label: 'Settings', icon: 'tabler:adjustments-horizontal' },
  { id: 'page', label: 'Page', icon: 'tabler:file-description' },
]

interface InspectorTabsProps {
  tabs?: Tab[]
  activeTab?: string
}

export function InspectorTabs({ tabs = DEFAULT_TABS, activeTab }: InspectorTabsProps) {
  const storeActiveTab = useUiStore((s) => s.activeInspectorTab)
  const current = activeTab ?? storeActiveTab

  return (
    <div
      role="tablist"
      aria-label="Inspector tabs"
      className="flex shrink-0"
      style={{ borderBottom: '1px solid #2e2e2e', background: '#161616' }}
    >
      {tabs.map((tab) => {
        const isActive = current === tab.id
        return (
          <button
            key={tab.id}
            role="tab"
            type="button"
            title={tab.label}
            aria-selected={isActive}
            onClick={() => useUiStore.getState().setInspectorTab(tab.id)}
            className="flex flex-1 flex-col items-center justify-center gap-1 py-2 transition-colors"
            style={{
              color: isActive ? '#ffffff' : '#666666',
              borderBottom: isActive ? '2px solid #4a9eff' : '2px solid transparent',
              marginBottom: -1,
            }}
          >
            {tab.icon && <Icon icon={tab.icon} width={15} height={15} />}
            <span style={{ fontSize: 9, letterSpacing: '0.04em' }}>{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}
