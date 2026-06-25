import { useUiStore } from '@/state/uiStore'

/** Placeholder control row used in tests and as a skeleton. */
export function ControlRow({ label }: { label: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '4px 0',
      }}
    >
      <span style={{ fontSize: 11, color: '#888' }}>{label}</span>
      <div
        style={{ height: 22, width: 72, borderRadius: 3, background: '#252525' }}
        aria-hidden="true"
      />
    </div>
  )
}

interface InspectorSectionProps {
  id: string
  title: string
  children: React.ReactNode
}

export function InspectorSection({ id, title, children }: InspectorSectionProps) {
  const isOpen = useUiStore((s) => s.openSections[id] ?? true)

  return (
    <div style={{ borderBottom: '1px solid #2e2e2e' }}>
      <button
        type="button"
        onClick={() => useUiStore.getState().toggleSection(id)}
        aria-expanded={isOpen}
        aria-controls={`section-body-${id}`}
        className="flex w-full items-center gap-2 px-3 transition-colors"
        style={{ height: 32, color: '#cccccc' }}
      >
        {/* Solid triangle — rotates on collapse */}
        <span
          style={{
            display: 'inline-block',
            fontSize: 7,
            lineHeight: 1,
            color: '#888',
            transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
            transition: 'transform 120ms',
          }}
          aria-hidden="true"
        >
          ▼
        </span>
        <span className="flex-1 text-left" style={{ fontSize: 11, fontWeight: 500 }}>
          {title}
        </span>
      </button>

      {isOpen && (
        <div id={`section-body-${id}`} className="px-3" style={{ paddingBottom: 8, paddingTop: 2 }}>
          {children}
        </div>
      )}
    </div>
  )
}
