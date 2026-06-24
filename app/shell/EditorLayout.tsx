import { useUiStore } from '@/state/uiStore'
import { TopToolbar } from './TopToolbar'
import { LeftPanel } from './LeftPanel'

export function EditorLayout() {
  const leftOpen = useUiStore((s) => s.leftPanelOpen)
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

      {/* Middle row: left panel · canvas · right panel */}
      <div className="flex min-h-0 flex-1">
        <aside
          data-testid="region-left"
          className={[
            'shrink-0 overflow-hidden border-r border-border bg-background',
            leftOpen ? 'w-60' : 'w-10',
          ].join(' ')}
        >
          <LeftPanel />
        </aside>

        <main
          data-testid="region-canvas"
          className="flex min-w-0 flex-1 flex-col overflow-hidden bg-canvas-chrome"
        >
          {/* CanvasFrame — task 005 */}
        </main>

        <aside
          data-testid="region-right"
          className={[
            'shrink-0 overflow-hidden border-l border-border bg-background',
            rightOpen ? 'w-72' : 'w-0',
          ].join(' ')}
        >
          {/* RightPanel — task 006 */}
        </aside>
      </div>

      {/* Bottom breadcrumb region */}
      <footer
        data-testid="region-breadcrumb"
        className="flex h-8 shrink-0 items-center border-t border-border bg-shell-bar px-3"
      >
        {/* BreadcrumbBar — task 007 */}
      </footer>
    </div>
  )
}
