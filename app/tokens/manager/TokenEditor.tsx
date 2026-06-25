import { useEffect, useState } from 'react'
import type { DesignToken, TokenGroup, TokenValue } from '@/tokens/model'
import type { UnitValue } from '@/inspector/controls/types'
import { CSS_UNITS } from '@/inspector/controls/types'
import { SYSTEM_FONT_OPTIONS, loadWordPressFontOptions } from '@/inspector/style/fontFamilies'

const S = {
  input: {
    height: 24,
    background: '#1e1e1e',
    border: '1px solid #333',
    borderRadius: 3,
    color: '#ffffff',
    fontSize: 11,
    padding: '0 6px',
    width: '100%',
    boxSizing: 'border-box' as const,
    outline: 'none',
  },
  select: {
    height: 24,
    background: '#1e1e1e',
    border: '1px solid #333',
    borderRadius: 3,
    color: '#ffffff',
    fontSize: 11,
    padding: '0 4px',
    boxSizing: 'border-box' as const,
    outline: 'none',
    cursor: 'pointer' as const,
  },
  label: { fontSize: 10, color: '#666', marginBottom: 2, display: 'block' as const },
  row: { display: 'flex', alignItems: 'center', gap: 4 },
}

function isUnitValue(v: TokenValue): v is UnitValue {
  return typeof v === 'object' && 'value' in v && 'unit' in v
}

function defaultValueForGroup(group: TokenGroup): TokenValue {
  if (group === 'color') return '#000000'
  if (group === 'typography') return 'system-ui'
  return { value: 0, unit: 'px' }
}

interface TokenEditorProps {
  group: TokenGroup
  token?: DesignToken
  onSave: (token: DesignToken) => void
  onCancel: () => void
}

export function TokenEditor({ group, token, onSave, onCancel }: TokenEditorProps) {
  const [name, setName] = useState(token?.name ?? '')
  const [value, setValue] = useState<TokenValue>(token?.value ?? defaultValueForGroup(group))
  const [fontOptions, setFontOptions] = useState(SYSTEM_FONT_OPTIONS)

  useEffect(() => {
    if (group !== 'typography' || isUnitValue(value)) return
    let cancelled = false
    void loadWordPressFontOptions().then((opts) => {
      if (!cancelled && opts.length > 0) {
        const merged = [...opts, ...SYSTEM_FONT_OPTIONS].filter(
          (o, i, arr) => arr.findIndex((x) => x.value === o.value) === i,
        )
        setFontOptions(merged)
      }
    })
    return () => {
      cancelled = true
    }
  }, [group, value])

  function handleSave() {
    const trimmed = name.trim()
    if (!trimmed) return
    const id =
      token?.id ??
      `${group}-${trimmed
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')}-${Date.now()}`
    onSave({ id, group, name: trimmed, value })
  }

  const unitVal: UnitValue = isUnitValue(value) ? value : { value: 0, unit: 'px' }

  return (
    <div
      style={{
        background: '#1a1a1a',
        border: '1px solid #2a2a2a',
        borderRadius: 4,
        padding: '8px 8px 6px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      {/* Name */}
      <div>
        <span style={S.label}>Name</span>
        <input
          autoFocus
          value={name}
          placeholder="Token name"
          style={S.input}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave()
            if (e.key === 'Escape') onCancel()
          }}
        />
      </div>

      {/* Value */}
      <div>
        <span style={S.label}>Value</span>

        {group === 'color' && typeof value === 'string' && (
          <div style={S.row}>
            <input
              type="color"
              value={value}
              style={{
                width: 24,
                height: 24,
                padding: 2,
                border: '1px solid #333',
                borderRadius: 3,
                background: '#252525',
                cursor: 'pointer',
                flexShrink: 0,
              }}
              onChange={(e) => setValue(e.target.value)}
            />
            <input
              value={value}
              placeholder="#000000"
              style={{ ...S.input, flex: 1 }}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>
        )}

        {group === 'typography' && !isUnitValue(value) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <select
              value={typeof value === 'string' ? value : ''}
              style={{ ...S.select, width: '100%' }}
              onChange={(e) => setValue(e.target.value)}
            >
              {fontOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <input
              value={typeof value === 'string' ? value : ''}
              placeholder="system-ui, sans-serif"
              style={S.input}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>
        )}

        {(group === 'spacing' ||
          group === 'effect' ||
          (group === 'typography' && isUnitValue(value))) && (
          <div style={S.row}>
            <input
              type="number"
              value={unitVal.value}
              min={0}
              style={{ ...S.input, flex: 1 }}
              onChange={(e) => setValue({ ...unitVal, value: Number(e.target.value) })}
            />
            <select
              value={unitVal.unit}
              style={{ ...S.select, width: 44, flexShrink: 0 }}
              onChange={(e) =>
                setValue({ ...unitVal, unit: e.target.value as (typeof CSS_UNITS)[number] })
              }
            >
              {CSS_UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end', paddingTop: 2 }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            fontSize: 10,
            padding: '3px 8px',
            background: 'transparent',
            border: '1px solid #333',
            borderRadius: 3,
            color: '#888',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={!name.trim()}
          style={{
            fontSize: 10,
            padding: '3px 8px',
            background: '#4a9eff',
            border: 'none',
            borderRadius: 3,
            color: '#fff',
            cursor: 'pointer',
            opacity: name.trim() ? 1 : 0.4,
          }}
        >
          {token ? 'Update' : 'Create'}
        </button>
      </div>
    </div>
  )
}
