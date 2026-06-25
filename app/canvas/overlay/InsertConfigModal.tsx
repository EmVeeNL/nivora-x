import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useUiStore } from '@/state/uiStore'
import { useDocumentStore } from '@/document/store'
import { getElementDefinition } from '@/elements/registry'
import { generateId } from '@/document/ids'
import type { InsertConfigField } from '@/elements/types'

const INPUT_STYLE: React.CSSProperties = {
  height: 32,
  background: '#252525',
  border: '1px solid #333',
  borderRadius: 4,
  color: '#ffffff',
  fontSize: 13,
  padding: '0 10px',
  width: '100%',
  boxSizing: 'border-box',
  outline: 'none',
}

const SELECT_STYLE: React.CSSProperties = {
  ...INPUT_STYLE,
  cursor: 'pointer',
  appearance: 'none' as const,
  WebkitAppearance: 'none' as const,
}

function ConfigField({
  field,
  value,
  onChange,
}: {
  field: InsertConfigField
  value: unknown
  onChange: (v: unknown) => void
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 12, color: '#888', marginBottom: 6 }}>
        {field.label}
      </label>
      {field.type === 'number' && (
        <input
          type="number"
          value={value as number}
          min={field.min}
          max={field.max}
          step={field.step ?? 1}
          style={INPUT_STYLE}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      )}
      {field.type === 'select' && field.options && (
        <select
          value={value as string}
          style={SELECT_STYLE}
          onChange={(e) => onChange(e.target.value)}
        >
          {field.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}
    </div>
  )
}

/**
 * Portal-based config modal shown before inserting elements that have insertConfig.
 * Reads pendingInsert from uiStore; renders nothing when null.
 */
export function InsertConfigModal() {
  const pendingInsert = useUiStore((s) => s.pendingInsert)
  const [values, setValues] = useState<Record<string, unknown>>({})
  const [initialized, setInitialized] = useState<string | null>(null)

  if (!pendingInsert) return null

  const def = getElementDefinition(pendingInsert.elementType)
  if (!def.insertConfig) return null

  // Initialize defaults when modal first opens for this element
  if (initialized !== pendingInsert.elementType) {
    const defaults: Record<string, unknown> = {}
    for (const field of def.insertConfig.fields) {
      defaults[field.id] = field.defaultValue
    }
    setValues(defaults)
    setInitialized(pendingInsert.elementType)
    return null
  }

  function handleInsert() {
    const { elementType, targetParentId, index } = useUiStore.getState().pendingInsert!
    const elementDef = getElementDefinition(elementType)
    const configProps: Record<string, unknown> = {}
    for (const field of elementDef.insertConfig?.fields ?? []) {
      configProps[field.prop] = values[field.id] ?? field.defaultValue
    }
    const node = {
      id: generateId(),
      type: elementType,
      props: { ...elementDef.defaultProps, ...configProps },
      children: [],
      overrides: {},
      meta: {},
    }
    const store = useDocumentStore.getState()
    store.insertNode(node, targetParentId, index)
    store.selectNode(node.id)
    useUiStore.getState().setPendingInsert(null)
    setInitialized(null)
  }

  function handleCancel() {
    useUiStore.getState().setPendingInsert(null)
    setInitialized(null)
  }

  const modal = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={def.insertConfig.title}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.55)',
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') handleCancel()
      }}
    >
      <div
        style={{
          background: '#1a1a1a',
          border: '1px solid #333',
          borderRadius: 8,
          padding: '24px 28px',
          minWidth: 320,
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}
      >
        <h2 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 600, color: '#ffffff' }}>
          {def.insertConfig.title}
        </h2>

        {def.insertConfig.fields.map((field) => (
          <ConfigField
            key={field.id}
            field={field}
            value={values[field.id] ?? field.defaultValue}
            onChange={(v) => setValues((prev) => ({ ...prev, [field.id]: v }))}
          />
        ))}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
          <button
            type="button"
            onClick={handleCancel}
            style={{
              height: 32,
              padding: '0 16px',
              background: 'transparent',
              border: '1px solid #444',
              borderRadius: 5,
              color: '#ccc',
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleInsert}
            style={{
              height: 32,
              padding: '0 16px',
              background: '#4a9eff',
              border: '1px solid #4a9eff',
              borderRadius: 5,
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Insert
          </button>
        </div>
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}
