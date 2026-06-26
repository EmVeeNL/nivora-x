import { useUiStore } from '@/state/uiStore'
import { TopToolbar } from './TopToolbar'
import { LeftRail } from './left/LeftRail'
import { LeftPanelHost } from './left/LeftPanelHost'
import { RightPanel } from './RightPanel'
import { BreadcrumbBar } from './BreadcrumbBar'
import { CanvasFrame } from '@/canvas/CanvasFrame'
import { ConfirmDialog } from '@/canvas/overlay/ConfirmDialog'
import { InsertConfigModal } from '@/canvas/overlay/InsertConfigModal'
import { PreviewMode } from './PreviewMode'
import { TokenManagerFull } from '@/tokens/manager/TokenManagerFull'
import { IconBrowser } from './left/IconBrowser'
import { AppearancePlaceholder } from './AppearancePlaceholder'

function AppearanceCanvas() {
  const view = useUiStore((s) => s.appearanceView)

  if (view === 'tokens') return <TokenManagerFull />
  if (view === 'icons') return <IconBrowser />
  if (view === 'themes')
    return (
      <AppearancePlaceholder
        title="Themes"
        description="Switch and customise site-wide visual themes."
        icon="tabler:brush"
      />
    )
  if (view === 'templates')
    return (
      <AppearancePlaceholder
        title="Templates"
        description="Manage reusable page and section templates."
        icon="tabler:layout"
      />
    )
  if (view === 'global-styles')
    return (
      <AppearancePlaceholder
        title="Global Styles"
        description="Set default typography, colours, and spacing for the whole site."
        icon="tabler:world"
      />
    )

  return null
}

export function EditorLayout() {
  const activeLeftPanel = useUiStore((s) => s.activeLeftPanel)
  const appearanceView = useUiStore((s) => s.appearanceView)
  const rightOpen = useUiStore((s) => s.rightPanelOpen)
  const previewMode = useUiStore((s) => s.previewMode)

  const isAppearance = activeLeftPanel === 'appearance' && appearanceView !== null

  if (previewMode) {
    return (
      <div className="flex h-full flex-col overflow-hidden">
        <PreviewMode />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Top toolbar region */}
      <header
        data-testid="region-toolbar"
        className="flex h-11 shrink-0 items-center border-b border-border bg-shell-bar px-3"
      >
        <TopToolbar />
      </header>

      {/* Middle row: activity bar · left panel · canvas/appearance · right panel */}
      <div className="flex min-h-0 flex-1">
        <nav
          data-testid="region-activity-bar"
          className="flex w-10 shrink-0 flex-col border-r border-border bg-shell-bar py-1"
        >
          <LeftRail />
        </nav>

        <aside
          data-testid="region-left"
          className={[
            'shrink-0 overflow-hidden border-r border-border bg-background transition-[width]',
            activeLeftPanel ? 'w-52' : 'w-0',
          ].join(' ')}
        >
          <LeftPanelHost />
        </aside>

        {isAppearance ? (
          /* Appearance full-canvas view — fills all remaining width, no right panel */
          <main data-testid="region-appearance" className="min-w-0 flex-1 overflow-hidden">
            <AppearanceCanvas />
          </main>
        ) : (
          <>
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
                rightOpen ? 'w-100' : 'w-10',
              ].join(' ')}
            >
              <RightPanel />
            </aside>
          </>
        )}
      </div>

      {/* Bottom breadcrumb region */}
      <footer
        data-testid="region-breadcrumb"
        className="flex h-8 shrink-0 items-center border-t border-border bg-shell-bar px-3"
      >
        <BreadcrumbBar />
      </footer>

      {/* Global portal dialogs */}
      <ConfirmDialog />
      <InsertConfigModal />
    </div>
  )
}
