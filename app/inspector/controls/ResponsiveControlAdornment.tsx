import { Icon } from '@iconify/react'

interface ResponsiveControlAdornmentProps {
  breakpoint: string
  state: 'inherited' | 'overridden'
  onCreateOverride(this: void): void
  onReset(this: void): void
}

export function ResponsiveControlAdornment({
  breakpoint,
  state,
  onCreateOverride,
  onReset,
}: ResponsiveControlAdornmentProps) {
  const inherited = state === 'inherited'

  return (
    <div
      style={{
        position: 'absolute',
        top: 3,
        right: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        zIndex: 1,
      }}
    >
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          height: 16,
          borderRadius: 999,
          padding: '0 6px',
          fontSize: 9,
          lineHeight: 1,
          color: inherited ? '#666' : '#4a9eff',
          background: inherited ? '#202020' : 'rgba(74,158,255,0.12)',
          border: `1px solid ${inherited ? '#333' : 'rgba(74,158,255,0.35)'}`,
          whiteSpace: 'nowrap',
        }}
      >
        {inherited ? 'Inherited' : 'Overridden'}
      </span>

      <button
        type="button"
        title={
          inherited ? `Create ${breakpoint} override` : `Reset ${breakpoint} to inherited value`
        }
        aria-label={
          inherited ? `Create ${breakpoint} override` : `Reset ${breakpoint} to inherited value`
        }
        onClick={inherited ? onCreateOverride : onReset}
        style={{
          width: 16,
          height: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
          border: 'none',
          color: inherited ? '#666' : '#4a9eff',
          cursor: 'pointer',
          padding: 0,
        }}
      >
        <Icon
          icon={inherited ? 'tabler:lock-open' : 'tabler:arrow-back-up'}
          width={11}
          height={11}
        />
      </button>
    </div>
  )
}
