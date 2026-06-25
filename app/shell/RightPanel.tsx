import { Icon } from '@iconify/react'
import { cn } from '@/lib/utils'
import { useUiStore } from '@/state/uiStore'
import { InspectorPanel } from '@/inspector/InspectorPanel'

export function RightPanel() {
  const isOpen = useUiStore((s) => s.rightPanelOpen)

  if (!isOpen) {
    return (
      <div
        className="flex h-full w-full items-start justify-center pt-2"
        style={{ background: '#1a1a1a' }}
      >
        <button
          type="button"
          onClick={() => useUiStore.getState().toggleRightPanel()}
          aria-label="Expand inspector panel"
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded',
            'text-[#666] transition-colors hover:text-[#ccc]',
          )}
        >
          <Icon icon="tabler:chevron-left" width={16} height={16} />
        </button>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-hidden" style={{ background: '#1a1a1a' }}>
      {/* Panel header */}
      <div
        className="flex h-10 shrink-0 items-center justify-between px-3"
        style={{ borderBottom: '1px solid #2e2e2e' }}
      >
        <span
          className="text-[11px] font-medium uppercase tracking-widest"
          style={{ color: '#666' }}
        >
          Inspector
        </span>
        <button
          type="button"
          onClick={() => useUiStore.getState().toggleRightPanel()}
          aria-label="Collapse inspector panel"
          className="flex h-6 w-6 items-center justify-center rounded transition-colors"
          style={{ color: '#666' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#ccc')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#666')}
        >
          <Icon icon="tabler:chevron-right" width={14} height={14} />
        </button>
      </div>

      <InspectorPanel />
    </div>
  )
}
