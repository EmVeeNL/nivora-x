import { registerLeftPanel } from './leftPanelRegistry'
import { ElementLibraryPanel } from './library/ElementLibraryPanel'
import { NavigatorPanel } from './navigator/NavigatorPanel'
import { AppearancePanel } from './AppearancePanel'

/**
 * Register all built-in left panels in order.
 * Navigator is first (top of rail), Elements second.
 * Safe to call multiple times (idempotent via registry).
 * Called once at app init from EditorApp.tsx.
 */
export function registerEditorPanels(): void {
  registerLeftPanel({
    id: 'navigator',
    label: 'Navigator',
    icon: 'tabler:layers-subtract',
    component: NavigatorPanel,
  })
  registerLeftPanel({
    id: 'elements',
    label: 'Elements',
    icon: 'tabler:layout-grid',
    component: ElementLibraryPanel,
  })
  registerLeftPanel({
    id: 'appearance',
    label: 'Appearance',
    icon: 'tabler:palette',
    component: AppearancePanel,
  })
}
