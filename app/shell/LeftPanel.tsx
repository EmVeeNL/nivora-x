import { useUiStore } from '@/state/uiStore'
import { NavigatorPlaceholder } from './NavigatorPlaceholder'

const PANEL_TITLE: Record<string, string> = {
  navigator: 'Navigation',
}

export function LeftPanel() {
  const activePanel = useUiStore((s) => s.activeLeftPanel)

  if (!activePanel) return null

  const title = PANEL_TITLE[activePanel] ?? activePanel

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex h-9 shrink-0 items-center border-b border-border px-3">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {title}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {activePanel === 'navigator' && <NavigatorPlaceholder />}
      </div>
    </div>
  )
}
