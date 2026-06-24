import { Icon } from '@iconify/react'
import { cn } from '@/lib/utils'
import { useUiStore } from '@/state/uiStore'
import { InspectorTabs } from './InspectorTabs'
import { InspectorSection, ControlRow, ButtonGroupRow } from './InspectorSection'

const PILL_SECTIONS = [
  { id: 'spacing', title: 'Spacing', controls: ['Margin', 'Padding'] },
  { id: 'size', title: 'Size', controls: ['Width', 'Height', 'Min Width', 'Max Width'] },
  {
    id: 'typography',
    title: 'Typography',
    controls: ['Font Family', 'Font Size', 'Font Weight', 'Line Height'],
  },
  { id: 'position', title: 'Position', controls: ['Position', 'Top', 'Right', 'Bottom', 'Left'] },
  { id: 'border', title: 'Border', controls: ['Border Width', 'Border Radius', 'Border Color'] },
  { id: 'effects', title: 'Effects', controls: ['Opacity', 'Box Shadow', 'Transform'] },
]

export function RightPanel() {
  const isOpen = useUiStore((s) => s.rightPanelOpen)
  const activeTab = useUiStore((s) => s.activeInspectorTab)

  if (!isOpen) {
    return (
      <div className="flex h-full w-full items-start justify-center pt-2">
        <button
          type="button"
          onClick={() => useUiStore.getState().toggleRightPanel()}
          aria-label="Expand inspector panel"
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded',
            'text-muted-foreground transition-colors hover:bg-accent hover:text-foreground',
          )}
        >
          <Icon icon="tabler:chevron-left" width={16} height={16} />
        </button>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Panel header */}
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-border px-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-label">Body</span>
        <button
          type="button"
          onClick={() => useUiStore.getState().toggleRightPanel()}
          aria-label="Collapse inspector panel"
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded',
            'text-muted-foreground transition-colors hover:bg-accent hover:text-foreground',
          )}
        >
          <Icon icon="tabler:chevron-right" width={14} height={14} />
        </button>
      </div>

      {/* Tab bar */}
      <InspectorTabs />

      {/* Tab content */}
      {activeTab === 'style' ? (
        <div className="flex-1 overflow-y-auto">
          {/* Layout section: button-group controls for display/direction/align/justify */}
          <InspectorSection id="layout" title="Layout">
            <ButtonGroupRow label="Display" count={3} />
            <ButtonGroupRow label="Direction" count={4} />
            <ButtonGroupRow label="Align" count={4} />
            <ButtonGroupRow label="Justify" count={5} />
          </InspectorSection>

          {/* Remaining sections: pill-style placeholders */}
          {PILL_SECTIONS.map((section) => (
            <InspectorSection key={section.id} id={section.id} title={section.title}>
              {section.controls.map((ctrl) => (
                <ControlRow key={ctrl} label={ctrl} />
              ))}
            </InspectorSection>
          ))}
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-xs text-muted-foreground">Settings — Phase 08</p>
        </div>
      )}
    </div>
  )
}
