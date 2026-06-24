import { useUiStore } from '@/state/uiStore'
import { TopToolbar } from './TopToolbar'
import { ActivityBar } from './ActivityBar'
import { LeftPanel } from './LeftPanel'
import { RightPanel } from './RightPanel'
import { BreadcrumbBar } from './BreadcrumbBar'
import { CanvasFrame } from '@/canvas/CanvasFrame'

export function EditorLayout() {
  const activeLeftPanel = useUiStore((s) => s.activeLeftPanel)
  const rightOpen = useUiStore((s) => s.rightPanelOpen)

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Top toolbar region */}
      <header
        data-testid="region-toolbar"
        className="flex h-11 shrink-0 items-center border-b border-border bg-shell-bar px-3"
      >
        <TopToolbar />
      </header>

      {/* Middle row: activity bar · left panel · canvas · right panel */}
      <div className="flex min-h-0 flex-1">
        <nav
          data-testid="region-activity-bar"
          className="flex w-10 shrink-0 flex-col border-r border-border bg-shell-bar py-1"
        >
          <ActivityBar />
        </nav>

        <aside
          data-testid="region-left"
          className={[
            'shrink-0 overflow-hidden border-r border-border bg-background transition-[width]',
            activeLeftPanel ? 'w-52' : 'w-0',
          ].join(' ')}
        >
          <LeftPanel />
        </aside>

        <main
          data-testid="region-canvas"
          className="flex min-w-0 flex-1 flex-col overflow-hidden bg-canvas-chrome"
        >
          <CanvasFrame />
        </main>

        <aside
          data-testid="region-right"
          className={[
            'shrink-0 overflow-hidden border-l border-border bg-background',
            rightOpen ? 'w-72' : 'w-10',
          ].join(' ')}
        >
          <RightPanel />
        </aside>
      </div>

      {/* Bottom breadcrumb region */}
      <footer
        data-testid="region-breadcrumb"
        className="flex h-8 shrink-0 items-center border-t border-border bg-shell-bar px-3"
      >
        <BreadcrumbBar />
      </footer>
    </div>
  )
}
