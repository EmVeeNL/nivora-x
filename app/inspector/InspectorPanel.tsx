import { Icon } from '@iconify/react'
import { ControlRenderer } from './controls/ControlRenderer'
import { PageSettings } from './page/PageSettings'
import type { ControlSectionSchema } from './controls/types'
import { isLocked } from '@/document/canInteract'
import { useDocumentStore } from '@/document/store'
import { getElementDefinition, hasElement } from '@/elements/registry'
import { useUiStore } from '@/state/uiStore'
import { InspectorTabs } from '@/shell/InspectorTabs'

/** Shared identity section prepended to every element's Block (Settings) tab. */
const IDENTITY_SECTION: ControlSectionSchema = {
  id: 'identity',
  title: 'Identity',
  controls: [
    {
      id: 'html-id',
      type: 'text',
      label: 'HTML ID',
      prop: 'htmlId',
      valueScope: 'prop',
      placeholder: 'e.g. hero-section',
    },
  ],
}

const TABS = [
  { id: 'inspector', label: 'Style', icon: 'tabler:palette' },
  { id: 'block', label: 'Settings', icon: 'tabler:adjustments-horizontal' },
  { id: 'page', label: 'Page', icon: 'tabler:file-description' },
]

function EmptySelection({ label }: { label: string }) {
  return (
    <div className="flex flex-1 items-center justify-center px-5 text-center">
      <p style={{ fontSize: 11, color: '#555' }}>Select an element to edit {label} controls.</p>
    </div>
  )
}

function LockedBanner() {
  return (
    <div className="px-3 py-2" style={{ borderBottom: '1px solid #2e2e2e' }}>
      <p style={{ fontSize: 11, color: '#666' }}>
        This element is locked. Unlock it in the Navigator to edit controls.
      </p>
    </div>
  )
}

export function InspectorPanel() {
  const selectedId = useDocumentStore((s) => s.selectedId)
  const tree = useDocumentStore((s) => s.tree)
  const active = useUiStore((s) => s.activeInspectorTab)
  const activeTab = TABS.some((tab) => tab.id === active) ? active : 'inspector'
  const node = selectedId ? tree?.nodes[selectedId] : null
  const definition = node && hasElement(node.type) ? getElementDefinition(node.type) : null
  const locked = node ? isLocked(node) : false

  return (
    <>
      {/* Element identity bar */}
      {node && definition && (
        <div
          className="flex shrink-0 items-center gap-2 px-3"
          style={{ height: 36, borderBottom: '1px solid #2e2e2e', background: '#161616' }}
        >
          <Icon
            icon={definition.icon}
            width={13}
            height={13}
            style={{ color: '#4a9eff', flexShrink: 0 }}
          />
          <span
            className="min-w-0 flex-1 truncate"
            style={{ fontSize: 12, fontWeight: 500, color: '#e0e0e0' }}
          >
            {definition.label}
          </span>
          <span
            className="shrink-0 rounded px-1.5 py-0.5 font-mono"
            style={{ fontSize: 9, background: '#252525', color: '#666', letterSpacing: '0.02em' }}
          >
            {node.type}
          </span>
        </div>
      )}

      <InspectorTabs tabs={TABS} activeTab={activeTab} />

      {activeTab === 'page' && (
        <div className="flex-1 overflow-y-auto">
          <PageSettings />
        </div>
      )}

      {activeTab === 'block' &&
        (node && definition ? (
          <div className="flex-1 overflow-y-auto">
            {locked && <LockedBanner />}
            <ControlRenderer
              node={node}
              sections={[IDENTITY_SECTION, ...(definition.controlSchema?.block ?? [])]}
              disabled={locked}
            />
          </div>
        ) : (
          <EmptySelection label="settings" />
        ))}

      {activeTab === 'inspector' &&
        (node && definition ? (
          <div className="flex-1 overflow-y-auto">
            {locked && <LockedBanner />}
            <ControlRenderer
              node={node}
              sections={definition.controlSchema?.inspector ?? []}
              disabled={locked}
            />
          </div>
        ) : (
          <EmptySelection label="style" />
        ))}
    </>
  )
}
