import { useMemo } from 'react'
import type { ReactNode } from 'react'
import { Icon } from '@iconify/react'
import type { TokenGroup } from '@/tokens/model'
import { isTokenRef, makeTokenRef } from '@/tokens/model'
import { useTokenStore } from '@/tokens/store'

interface TokenOrValueProps {
  value: unknown
  group: TokenGroup
  disabled?: boolean
  onChange: (v: unknown) => void
  children: (rawValue: unknown, onChange: (v: unknown) => void, disabled: boolean) => ReactNode
}

const BTN: React.CSSProperties = {
  width: 18,
  height: 18,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'transparent',
  border: '1px solid #333',
  borderRadius: 3,
  cursor: 'pointer',
  padding: 0,
  flexShrink: 0,
}

/**
 * Wraps a style control to support token references alongside raw values.
 * When the stored value is a TokenRef, shows a compact token picker.
 * Otherwise renders children with a "link to token" toggle button.
 */
export function TokenOrValue({
  value,
  group,
  disabled = false,
  onChange,
  children,
}: TokenOrValueProps) {
  const tokens = useTokenStore((s) => s.tokens)
  const groupTokens = useMemo(() => tokens.filter((t) => t.group === group), [tokens, group])

  if (isTokenRef(value)) {
    const activeId = value.__token
    const activeToken = groupTokens.find((t) => t.id === activeId)

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
        <Icon
          icon="tabler:link"
          width={11}
          height={11}
          style={{ color: '#4a9eff', flexShrink: 0 }}
        />
        <select
          data-testid="token-picker"
          value={activeId}
          disabled={disabled}
          style={{
            flex: 1,
            height: 24,
            background: '#1d2a3a',
            border: '1px solid #2a4a6a',
            borderRadius: 3,
            color: '#4a9eff',
            fontSize: 11,
            padding: '0 4px',
            outline: 'none',
            cursor: disabled ? 'not-allowed' : 'pointer',
            minWidth: 0,
          }}
          onChange={(e) => onChange(makeTokenRef(e.target.value))}
        >
          {activeToken == null && <option value={activeId}>{activeId}</option>}
          {groupTokens.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          title="Switch to raw value"
          disabled={disabled}
          style={{ ...BTN, color: '#555' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#aaa'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#555'
          }}
          onClick={() => onChange('')}
        >
          <Icon icon="tabler:unlink" width={11} height={11} />
        </button>
      </div>
    )
  }

  const handleLinkToken = () => {
    const first = groupTokens[0]
    if (first) onChange(makeTokenRef(first.id))
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
      <div style={{ flex: 1, minWidth: 0 }}>{children(value, onChange, disabled)}</div>
      <button
        type="button"
        title={groupTokens.length > 0 ? 'Link to token' : 'No tokens available'}
        disabled={disabled || groupTokens.length === 0}
        style={{ ...BTN, color: '#444', flexShrink: 0 }}
        onMouseEnter={(e) => {
          if (!disabled && groupTokens.length > 0) e.currentTarget.style.color = '#4a9eff'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = '#444'
        }}
        onClick={handleLinkToken}
      >
        <Icon icon="tabler:link" width={11} height={11} />
      </button>
    </div>
  )
}
