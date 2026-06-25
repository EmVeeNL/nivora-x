import type React from 'react'
import { useEffect, useMemo, useState } from 'react'
import { Icon } from '@iconify/react'
import { saveBreakpoints } from './persistence'
import { useUiStore } from '@/state/uiStore'
import { normalizeBreakpoints, type BreakpointConfig, type BreakpointId } from './config'
import { getBootstrapData } from '@/lib/bootstrap'
import { useDocumentStore } from '@/document/store'

const INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  height: 28,
  background: '#252525',
  border: '1px solid #333',
  borderRadius: 4,
  color: '#ffffff',
  fontSize: 11,
  padding: '0 8px',
  boxSizing: 'border-box',
  outline: 'none',
}

const LABEL_STYLE: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  color: '#888',
  marginBottom: 4,
}

type DraftBreakpoint = BreakpointConfig

function slugifyId(label: string): string {
  return label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function countDocumentOverridesForBreakpoint(breakpointId: BreakpointId): number {
  const tree = useDocumentStore.getState().tree
  if (!tree) return 0

  let count = 0
  for (const node of Object.values(tree.nodes)) {
    if (
      node.overrides[breakpointId] &&
      Object.keys(node.overrides[breakpointId] ?? {}).length > 0
    ) {
      count += 1
    }
  }
  return count
}

export function BreakpointSettings() {
  const canManage = getBootstrapData()?.canManageSettings ?? false
  const currentBreakpoints = useUiStore((s) => s.breakpoints)
  useDocumentStore((s) => s.tree)
  const [drafts, setDrafts] = useState<DraftBreakpoint[]>(currentBreakpoints)
  const [saving, setSaving] = useState<'idle' | 'saving' | 'error'>('idle')
  const [message, setMessage] = useState<string>('')

  useEffect(() => {
    setDrafts(currentBreakpoints)
  }, [currentBreakpoints])

  const dirty = useMemo(
    () => JSON.stringify(normalizeBreakpoints(drafts)) !== JSON.stringify(currentBreakpoints),
    [currentBreakpoints, drafts],
  )

  if (!canManage) {
    return null
  }

  function patchDraft(id: string, patch: Partial<DraftBreakpoint>) {
    setDrafts((rows) =>
      rows.map((row) => {
        if (row.id !== id) return row
        const next = { ...row, ...patch }
        if (!row.builtin && patch.label !== undefined && (!patch.id || patch.id === row.id)) {
          next.id = slugifyId(next.label) || row.id
        }
        return next
      }),
    )
  }

  function addBreakpoint() {
    const nextIdBase = 'breakpoint'
    let index = 1
    while (drafts.some((row) => row.id === `${nextIdBase}-${String(index)}`)) index += 1
    setDrafts((rows) =>
      normalizeBreakpoints([
        ...rows,
        {
          id: `${nextIdBase}-${String(index)}`,
          label: `Breakpoint ${String(index)}`,
          width: 1024,
          direction: 'max',
          builtin: false,
        },
      ]),
    )
  }

  function removeBreakpoint(id: string) {
    const target = drafts.find((row) => row.id === id)
    if (!target || target.builtin) return
    const overrideCount = countDocumentOverridesForBreakpoint(target.id)
    const confirmed = window.confirm(
      overrideCount > 0
        ? `Remove "${target.label}"? ${String(overrideCount)} node override set(s) in the current document use this breakpoint. They will be preserved as inactive data until this breakpoint id is added again.`
        : `Remove "${target.label}"? Existing ${target.label} overrides on documents will be preserved as inactive data until this breakpoint id is added again.`,
    )
    if (!confirmed) return
    setDrafts((rows) => rows.filter((row) => row.id !== id))
  }

  async function handleSave() {
    setSaving('saving')
    setMessage('')
    try {
      const payload = normalizeBreakpoints(drafts)
      const response = await saveBreakpoints(payload)
      const saved = normalizeBreakpoints(response.breakpoints)
      useUiStore.getState().setBreakpoints(saved)
      const bs = getBootstrapData()
      if (bs) bs.breakpoints = saved
      setDrafts(saved)
      setSaving('idle')
      setMessage('Saved')
    } catch {
      setSaving('error')
      setMessage('Save failed')
    }
  }

  function resetDrafts() {
    setDrafts(currentBreakpoints)
    setMessage('')
    setSaving('idle')
  }

  return (
    <section
      style={{
        display: 'grid',
        gap: 10,
        padding: 12,
        borderTop: '1px solid #2e2e2e',
        marginTop: 4,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 style={{ fontSize: 12, fontWeight: 600, color: '#e0e0e0' }}>Breakpoints</h3>
          <p style={{ fontSize: 11, color: '#777', marginTop: 2 }}>
            Desktop stays the base. Removing a breakpoint preserves matching overrides as inactive
            data.
          </p>
        </div>
        <button
          type="button"
          onClick={addBreakpoint}
          className="flex h-7 items-center gap-1.5 rounded border border-[#333] px-2 text-xs text-[#ddd] transition-colors hover:bg-[#252525]"
        >
          <Icon icon="tabler:plus" width={14} height={14} />
          Add
        </button>
      </div>

      <div style={{ display: 'grid', gap: 8 }}>
        {drafts.map((breakpoint) => (
          <div
            key={breakpoint.id}
            style={{
              display: 'grid',
              gap: 8,
              padding: 10,
              border: '1px solid #2e2e2e',
              borderRadius: 6,
              background: '#141414',
            }}
          >
            <div className="grid grid-cols-[minmax(0,1fr)_88px_28px] gap-2">
              <label>
                <span style={LABEL_STYLE}>Label</span>
                <input
                  value={breakpoint.label}
                  aria-label={`${breakpoint.id} label`}
                  style={INPUT_STYLE}
                  disabled={breakpoint.builtin}
                  onChange={(e) => patchDraft(breakpoint.id, { label: e.target.value })}
                />
              </label>
              <label>
                <span style={LABEL_STYLE}>Width</span>
                <input
                  value={String(breakpoint.width)}
                  aria-label={`${breakpoint.id} width`}
                  type="number"
                  min={1}
                  style={INPUT_STYLE}
                  onChange={(e) =>
                    patchDraft(breakpoint.id, { width: Math.max(1, Number(e.target.value) || 1) })
                  }
                />
              </label>
              <div className="flex items-end">
                <button
                  type="button"
                  aria-label={`Remove ${breakpoint.label}`}
                  disabled={breakpoint.builtin}
                  onClick={() => removeBreakpoint(breakpoint.id)}
                  className="flex h-7 w-7 items-center justify-center rounded border border-[#333] text-[#999] transition-colors hover:bg-[#252525] hover:text-[#fff] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Icon icon="tabler:trash" width={14} height={14} />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <code style={{ fontSize: 10, color: '#666' }}>#{breakpoint.id}</code>
              {breakpoint.builtin && (
                <span style={{ fontSize: 10, color: '#666' }}>Built-in breakpoint</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3">
        <span
          style={{
            minHeight: 16,
            fontSize: 11,
            color: saving === 'error' ? '#ff7a7a' : '#777',
          }}
        >
          {message}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={resetDrafts}
            disabled={!dirty || saving === 'saving'}
            className="rounded border border-[#333] px-2 py-1 text-xs text-[#bbb] transition-colors hover:bg-[#252525] disabled:opacity-40"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={() => {
              void handleSave()
            }}
            disabled={!dirty || saving === 'saving'}
            className="rounded bg-[#2f6fed] px-2 py-1 text-xs text-white transition-opacity disabled:opacity-40"
          >
            {saving === 'saving' ? 'Saving…' : 'Save Breakpoints'}
          </button>
        </div>
      </div>
    </section>
  )
}
