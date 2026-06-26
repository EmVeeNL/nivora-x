import { STYLE_STATES, type StyleState } from '@/document/schema/types'
import { useUiStore } from '@/state/uiStore'

const STATE_LABELS: Record<StyleState, string> = {
  default: 'Default',
  hover: 'Hover',
  focus: 'Focus',
  active: 'Active',
}

export function StateSwitcher() {
  const activeStyleState = useUiStore((s) => s.activeStyleState)
  const setActiveStyleState = useUiStore((s) => s.setActiveStyleState)

  return (
    <div
      data-testid="state-switcher"
      className="flex items-center gap-2 px-3 py-2"
      style={{ borderBottom: '1px solid #2e2e2e', background: '#141414' }}
    >
      <span style={{ fontSize: 10, fontWeight: 600, color: '#666', letterSpacing: '0.08em' }}>
        STATE
      </span>
      <div className="flex flex-1 gap-1">
        {STYLE_STATES.map((state) => {
          const active = state === activeStyleState
          return (
            <button
              key={state}
              type="button"
              data-testid={`state-switcher-${state}`}
              aria-pressed={active}
              onClick={() => setActiveStyleState(state)}
              className="flex-1 rounded px-2 py-1"
              style={{
                border: `1px solid ${active ? '#4a9eff' : '#2f2f2f'}`,
                background: active ? 'rgba(74,158,255,0.16)' : '#1b1b1b',
                color: active ? '#d6ebff' : '#8b8b8b',
                fontSize: 11,
                fontWeight: 500,
              }}
            >
              {STATE_LABELS[state]}
            </button>
          )
        })}
      </div>
    </div>
  )
}
