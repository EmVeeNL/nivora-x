import { useState, useMemo, useEffect, useCallback } from 'react'
import { Icon } from '@iconify/react'
import { cn } from '@/lib/utils'
import type { DesignToken, TokenGroup, TokenMode, TokenValue } from '@/tokens/model'
import { DEFAULT_MODE, isTokenRef } from '@/tokens/model'
import type { UnitValue } from '@/inspector/controls/types'
import { CSS_UNITS } from '@/inspector/controls/types'
import { useTokenStore } from '@/tokens/store'
import { useDocumentStore } from '@/document/store'
import { isTokenReferenced } from '@/tokens/integrity'
import { toCssString } from '@/css/rules'
import { SYSTEM_FONT_OPTIONS, loadWordPressFontOptions } from '@/inspector/style/fontFamilies'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TABS = [
  { id: 'tokens', label: 'Tokens', icon: 'tabler:variable' },
  { id: 'styles', label: 'Styles', icon: 'tabler:brush', disabled: true },
  { id: 'doc', label: 'Doc', icon: 'tabler:file-text', disabled: true },
  { id: 'figma', label: 'Figma', icon: 'tabler:brand-figma', disabled: true },
  { id: 'transforms', label: 'Transforms', icon: 'tabler:transform', disabled: true },
  { id: 'analytics', label: 'Analytics', icon: 'tabler:chart-bar', disabled: true },
]

const GROUP_META: Record<
  TokenGroup,
  { label: string; icon: string; description: string; color: string }
> = {
  color: {
    label: 'Colors',
    icon: 'tabler:palette',
    description: 'Brand colors, neutral tones, and semantic status colors.',
    color: '#f87171',
  },
  typography: {
    label: 'Typography',
    icon: 'tabler:typography',
    description: 'Font families, type scale sizes, weights, and line heights.',
    color: '#60a5fa',
  },
  spacing: {
    label: 'Spacing',
    icon: 'tabler:spacing-horizontal',
    description: 'Margin, padding, and gap values for consistent rhythm.',
    color: '#34d399',
  },
  effect: {
    label: 'Effects',
    icon: 'tabler:sparkles',
    description: 'Border radii, shadows, and decorative visual effects.',
    color: '#a78bfa',
  },
}

const GROUPS: TokenGroup[] = ['color', 'typography', 'spacing', 'effect']

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isUnitValue(v: unknown): v is UnitValue {
  return typeof v === 'object' && v !== null && 'value' in v && 'unit' in v
}

function defaultValueForGroup(group: TokenGroup): TokenValue {
  if (group === 'color') return '#000000'
  if (group === 'typography') return 'system-ui'
  return { value: 0, unit: 'px' }
}

function formatValue(v: TokenValue): string {
  if (isUnitValue(v)) return `${v.value}${v.unit}`
  if (typeof v === 'string') return v.length > 28 ? v.slice(0, 28) + '…' : v
  return '—'
}

function cssVarName(token: DesignToken): string {
  return `--nx-${token.id}`
}

function valueToCss(v: TokenValue): string {
  return toCssString(v) ?? ''
}

function buildCssOutput(token: DesignToken, modes: TokenMode[]): string {
  const base = valueToCss(token.value)
  let out = `${cssVarName(token)}: ${base};`
  for (const mode of modes) {
    if (mode.id === DEFAULT_MODE.id) continue
    const override = token.modeValues?.[mode.id]
    if (!override) continue
    const ov = valueToCss(override)
    if (ov)
      out += `\n\n/* ${mode.name} */\n[data-nx-mode="${mode.id}"] {\n  ${cssVarName(token)}: ${ov};\n}`
  }
  return out
}

// ---------------------------------------------------------------------------
// Token swatch
// ---------------------------------------------------------------------------

function TokenSwatch({ token, value }: { token: DesignToken; value?: TokenValue }) {
  const v = value ?? token.value
  if (token.group === 'color' && typeof v === 'string') {
    return (
      <div
        style={{
          width: 18,
          height: 18,
          borderRadius: '50%',
          background: v,
          flexShrink: 0,
          border: '1px solid rgba(255,255,255,0.12)',
        }}
      />
    )
  }
  const meta = GROUP_META[token.group]
  return (
    <div
      style={{
        width: 18,
        height: 18,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon icon={meta.icon} width={13} height={13} style={{ color: meta.color }} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Token value input (inline — reusable across view/edit)
// ---------------------------------------------------------------------------

interface TokenValueInputProps {
  group: TokenGroup
  value: TokenValue
  onChange: (v: TokenValue) => void
}

function TokenValueInput({ group, value, onChange }: TokenValueInputProps) {
  const [fontOptions, setFontOptions] = useState(SYSTEM_FONT_OPTIONS)
  const unitVal: UnitValue = isUnitValue(value) ? value : { value: 0, unit: 'px' }

  useEffect(() => {
    if (group !== 'typography') return
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
  }, [group])

  const S = {
    input:
      'h-7 w-full rounded border border-border bg-input px-2.5 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none',
    select:
      'h-7 rounded border border-border bg-input px-2 text-xs text-foreground focus:border-primary focus:outline-none cursor-pointer',
  }

  if (group === 'color' && typeof value === 'string') {
    return (
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-7 w-7 shrink-0 cursor-pointer rounded border border-border bg-input p-0.5"
        />
        <input
          value={value}
          placeholder="#000000"
          onChange={(e) => onChange(e.target.value)}
          className={S.input}
        />
      </div>
    )
  }

  if (group === 'typography' && !isUnitValue(value)) {
    return (
      <div className="flex flex-col gap-1.5">
        <select
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value)}
          className={cn(S.select, 'w-full')}
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
          onChange={(e) => onChange(e.target.value)}
          className={S.input}
        />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        value={unitVal.value}
        min={0}
        onChange={(e) => onChange({ ...unitVal, value: Number(e.target.value) })}
        className={cn(S.input, 'flex-1')}
      />
      <select
        value={unitVal.unit}
        onChange={(e) =>
          onChange({ ...unitVal, unit: e.target.value as (typeof CSS_UNITS)[number] })
        }
        className={cn(S.select, 'w-16 shrink-0')}
      >
        {CSS_UNITS.map((u) => (
          <option key={u} value={u}>
            {u}
          </option>
        ))}
      </select>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Left group column
// ---------------------------------------------------------------------------

interface GroupColumnProps {
  selected: TokenGroup | null
  onSelect: (g: TokenGroup | null) => void
  counts: Record<TokenGroup, number>
  total: number
}

function GroupColumn({ selected, onSelect, counts, total }: GroupColumnProps) {
  return (
    <div className="flex h-full flex-col gap-0.5 overflow-y-auto p-2">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={cn(
          'flex items-center justify-between rounded px-2 py-1.5 text-left text-xs transition-colors',
          selected === null
            ? 'bg-accent text-foreground'
            : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
        )}
      >
        <span className="font-medium">All Tokens</span>
        <span
          className={cn(
            'text-[10px] tabular-nums',
            selected === null ? 'text-foreground/60' : 'text-muted-foreground/60',
          )}
        >
          {total}
        </span>
      </button>

      <div className="mb-0.5 mt-1 px-2 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/40">
        Groups
      </div>

      {GROUPS.map((group) => {
        const meta = GROUP_META[group]
        const isActive = selected === group
        return (
          <button
            key={group}
            type="button"
            onClick={() => onSelect(group)}
            className={cn(
              'flex items-center gap-2 rounded px-2 py-1.5 text-left text-xs transition-colors',
              isActive
                ? 'bg-accent text-foreground'
                : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
            )}
          >
            <Icon icon={meta.icon} width={13} height={13} style={{ color: meta.color }} />
            <span className="flex-1 truncate">{meta.label}</span>
            <span
              className={cn(
                'text-[10px] tabular-nums',
                isActive ? 'text-foreground/60' : 'text-muted-foreground/60',
              )}
            >
              {counts[group]}
            </span>
          </button>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Modes bar
// ---------------------------------------------------------------------------

interface ModesBarProps {
  modes: TokenMode[]
  activeMode: string
  onSetActive: (id: string) => void
  onAdd: (name: string) => void
  onDelete: (id: string) => void
}

function ModesBar({ modes, activeMode, onSetActive, onAdd, onDelete }: ModesBarProps) {
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')

  function handleAdd() {
    const n = newName.trim()
    if (n) {
      onAdd(n)
      setNewName('')
    }
    setAdding(false)
  }

  return (
    <div className="flex shrink-0 items-center gap-1.5 border-b border-border bg-shell-bar px-4 py-1.5">
      <span className="mr-1 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/40">
        Modes
      </span>
      {modes.map((m) => (
        <div key={m.id} className="flex items-center">
          <button
            type="button"
            onClick={() => onSetActive(m.id)}
            className={cn(
              'flex h-5 items-center rounded-l px-2 text-[10px] transition-colors',
              m.id === DEFAULT_MODE.id ? 'rounded' : 'rounded-l',
              activeMode === m.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-accent/60 text-muted-foreground hover:bg-accent hover:text-foreground',
            )}
          >
            {m.name}
          </button>
          {m.id !== DEFAULT_MODE.id && (
            <button
              type="button"
              title={`Delete ${m.name} mode`}
              onClick={() => onDelete(m.id)}
              className={cn(
                'flex h-5 w-5 items-center justify-center rounded-r border-l border-border/40 text-[10px] transition-colors',
                activeMode === m.id
                  ? 'bg-primary/80 text-primary-foreground hover:bg-destructive hover:text-white'
                  : 'bg-accent/60 text-muted-foreground/50 hover:bg-destructive/20 hover:text-destructive',
              )}
            >
              <Icon icon="tabler:x" width={9} height={9} />
            </button>
          )}
        </div>
      ))}

      {adding ? (
        <div className="flex items-center gap-1">
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Mode name"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd()
              if (e.key === 'Escape') {
                setAdding(false)
                setNewName('')
              }
            }}
            className="h-5 w-24 rounded border border-border bg-input px-2 text-[10px] text-foreground focus:border-primary focus:outline-none"
          />
          <button
            type="button"
            onClick={handleAdd}
            className="flex h-5 items-center gap-0.5 rounded bg-primary px-2 text-[10px] text-primary-foreground"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => {
              setAdding(false)
              setNewName('')
            }}
            className="text-[10px] text-muted-foreground hover:text-foreground"
          >
            <Icon icon="tabler:x" width={10} height={10} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          title="Add mode"
          onClick={() => setAdding(true)}
          className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground/40 transition-colors hover:bg-accent hover:text-foreground"
        >
          <Icon icon="tabler:plus" width={11} height={11} />
        </button>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Token table row
// ---------------------------------------------------------------------------

interface TokenRowProps {
  token: DesignToken
  isSelected: boolean
  activeMode: string
  onSelect: () => void
  onEdit: () => void
  onDelete: () => void
}

function TokenTableRow({
  token,
  isSelected,
  activeMode,
  onSelect,
  onEdit,
  onDelete,
}: TokenRowProps) {
  const meta = GROUP_META[token.group]
  const displayValue =
    activeMode !== DEFAULT_MODE.id && token.modeValues?.[activeMode] !== undefined
      ? token.modeValues[activeMode]
      : token.value

  return (
    <div
      role="row"
      onClick={onSelect}
      className={cn(
        'group grid cursor-pointer items-center gap-3 border-b border-border/40 px-4 py-2.5 transition-colors',
        isSelected ? 'bg-accent' : 'hover:bg-accent/40',
      )}
      style={{ gridTemplateColumns: '24px 1fr 80px 140px 130px 56px' }}
    >
      <div className="flex items-center justify-center">
        <TokenSwatch token={token} value={displayValue} />
      </div>
      <div className="min-w-0">
        <div className="truncate text-xs font-medium text-foreground">{token.name}</div>
        <div className="truncate text-[10px] text-muted-foreground/60">{cssVarName(token)}</div>
      </div>
      <div>
        <span
          className="rounded px-1.5 py-0.5 text-[10px] font-medium"
          style={{ background: `${meta.color}18`, color: meta.color }}
        >
          {meta.label}
        </span>
      </div>
      <div className="truncate text-[11px] text-muted-foreground" title={formatValue(displayValue)}>
        {formatValue(displayValue)}
      </div>
      <div className="truncate text-[10px] text-muted-foreground/50" title={cssVarName(token)}>
        {cssVarName(token)}
      </div>
      <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          type="button"
          title="Edit token"
          onClick={(e) => {
            e.stopPropagation()
            onEdit()
          }}
          className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Icon icon="tabler:pencil" width={12} height={12} />
        </button>
        <button
          type="button"
          title="Delete token"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-destructive/20 hover:text-destructive"
        >
          <Icon icon="tabler:trash" width={12} height={12} />
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Right detail / edit panel
// ---------------------------------------------------------------------------

interface TokenDetailPanelProps {
  selectedGroup: TokenGroup | null
  selectedToken: DesignToken | null
  isEditing: boolean
  isCreating: boolean
  creatingGroup: TokenGroup
  modes: TokenMode[]
  onSave: (t: DesignToken) => void
  onCancelEdit: () => void
  onStartEdit: () => void
}

function TokenDetailPanel({
  selectedGroup,
  selectedToken,
  isEditing,
  isCreating,
  creatingGroup,
  modes,
  onSave,
  onCancelEdit,
  onStartEdit,
}: TokenDetailPanelProps) {
  const isFormOpen = isEditing || isCreating
  const sourceToken = isCreating ? null : selectedToken
  const group = sourceToken?.group ?? creatingGroup

  // Form state — reset when token or mode changes
  const [name, setName] = useState(sourceToken?.name ?? '')
  const [description, setDescription] = useState(sourceToken?.description ?? '')
  const [category, setCategory] = useState(sourceToken?.category ?? '')
  const [formGroup, setFormGroup] = useState<TokenGroup>(group)
  const [defaultValue, setDefaultValue] = useState<TokenValue>(
    sourceToken?.value ?? defaultValueForGroup(group),
  )
  const [modeValues, setModeValues] = useState<Record<string, TokenValue>>(
    sourceToken?.modeValues ?? {},
  )
  const [editingModeId, setEditingModeId] = useState<string>(DEFAULT_MODE.id)
  const [viewModeId, setViewModeId] = useState<string>(DEFAULT_MODE.id)

  // Reinit when source token changes
  useEffect(() => {
    setName(sourceToken?.name ?? '')
    setDescription(sourceToken?.description ?? '')
    setCategory(sourceToken?.category ?? '')
    setFormGroup(sourceToken?.group ?? creatingGroup)
    setDefaultValue(sourceToken?.value ?? defaultValueForGroup(sourceToken?.group ?? creatingGroup))
    setModeValues(sourceToken?.modeValues ?? {})
    setEditingModeId(DEFAULT_MODE.id)
    setViewModeId(DEFAULT_MODE.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceToken?.id, isCreating, creatingGroup])

  const activeEditValue: TokenValue =
    editingModeId === DEFAULT_MODE.id ? defaultValue : (modeValues[editingModeId] ?? defaultValue)

  function handleEditValueChange(v: TokenValue) {
    if (editingModeId === DEFAULT_MODE.id) {
      setDefaultValue(v)
    } else {
      setModeValues((prev) => ({ ...prev, [editingModeId]: v }))
    }
  }

  function handleSave() {
    const trimmed = name.trim()
    if (!trimmed) return
    const id =
      sourceToken?.id ??
      `${formGroup}-${trimmed
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')}-${Date.now()}`
    const saved: DesignToken = {
      id,
      group: formGroup,
      name: trimmed,
      value: defaultValue,
      ...(description.trim() ? { description: description.trim() } : {}),
      ...(category.trim() ? { category: category.trim() } : {}),
      ...(Object.keys(modeValues).length > 0 ? { modeValues } : {}),
    }
    onSave(saved)
  }

  const formMeta = GROUP_META[formGroup]

  // ── Edit / create form ──────────────────────────────────────────────────
  if (isFormOpen) {
    return (
      <div className="flex h-full flex-col overflow-hidden">
        <div className="border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <Icon icon={formMeta.icon} width={14} height={14} style={{ color: formMeta.color }} />
            <span className="text-xs font-semibold text-foreground">
              {isEditing ? 'Edit token' : `New token`}
            </span>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {/* Name */}
          <div>
            <label className="mb-1 block text-[10px] text-muted-foreground">Name</label>
            <input
              autoFocus
              value={name}
              placeholder="Token name"
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave()
                if (e.key === 'Escape') onCancelEdit()
              }}
              className="h-7 w-full rounded border border-border bg-input px-2.5 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1 block text-[10px] text-muted-foreground">Description</label>
            <textarea
              value={description}
              placeholder="Optional description…"
              rows={2}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full resize-none rounded border border-border bg-input px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
            />
          </div>

          {/* Type (group) */}
          <div>
            <label className="mb-1 block text-[10px] text-muted-foreground">Type</label>
            <select
              value={formGroup}
              onChange={(e) => {
                const g = e.target.value as TokenGroup
                setFormGroup(g)
                setDefaultValue(defaultValueForGroup(g))
                setModeValues({})
              }}
              className="h-7 w-full rounded border border-border bg-input px-2 text-xs text-foreground focus:border-primary focus:outline-none"
            >
              {GROUPS.map((g) => (
                <option key={g} value={g}>
                  {GROUP_META[g].label}
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="mb-1 block text-[10px] text-muted-foreground">Category</label>
            <input
              value={category}
              placeholder="e.g. Brand, Neutral, Semantic…"
              onChange={(e) => setCategory(e.target.value)}
              className="h-7 w-full rounded border border-border bg-input px-2.5 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
            />
          </div>

          {/* Mode + Value */}
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-[10px] text-muted-foreground">Value</label>
              {modes.length > 1 && (
                <select
                  value={editingModeId}
                  onChange={(e) => setEditingModeId(e.target.value)}
                  className="h-5 rounded border border-border bg-input px-1.5 text-[10px] text-foreground focus:border-primary focus:outline-none"
                >
                  {modes.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <TokenValueInput
              group={formGroup}
              value={activeEditValue}
              onChange={handleEditValueChange}
            />
            {editingModeId !== DEFAULT_MODE.id && (
              <p className="mt-1 text-[10px] text-muted-foreground/50">
                Overrides the default value for{' '}
                <em>{modes.find((m) => m.id === editingModeId)?.name ?? editingModeId}</em> mode.
              </p>
            )}
          </div>

          {/* CSS output preview */}
          <div>
            <label className="mb-1 block text-[10px] text-muted-foreground">
              CSS output preview
            </label>
            <pre className="rounded border border-border bg-background p-2.5 font-mono text-[10px] text-muted-foreground whitespace-pre-wrap break-all">
              {`--nx-${(name.trim() || 'token-name').toLowerCase().replace(/\s+/g, '-')}: ${valueToCss(activeEditValue) || '…'};`}
            </pre>
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border px-4 py-3">
          <button
            type="button"
            onClick={onCancelEdit}
            className="flex h-7 items-center rounded border border-border px-3 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!name.trim()}
            className="flex h-7 items-center gap-1.5 rounded bg-primary px-3 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {isEditing ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    )
  }

  // ── Token detail view ───────────────────────────────────────────────────
  if (selectedToken) {
    const g = GROUP_META[selectedToken.group]
    const displayValue: TokenValue =
      viewModeId !== DEFAULT_MODE.id
        ? (selectedToken.modeValues?.[viewModeId] ?? selectedToken.value)
        : selectedToken.value
    const hasModeValues = Object.keys(selectedToken.modeValues ?? {}).length > 0
    const isRef = isTokenRef(selectedToken.value)

    return (
      <div className="flex h-full flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <TokenSwatch token={selectedToken} value={displayValue} />
            <span className="flex-1 truncate text-xs font-semibold text-foreground">
              {selectedToken.name}
            </span>
            <button
              type="button"
              onClick={onStartEdit}
              title="Edit"
              className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <Icon icon="tabler:pencil" width={12} height={12} />
            </button>
          </div>
          <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
            <span
              className="rounded px-1.5 py-0.5 text-[10px] font-medium"
              style={{ background: `${g.color}18`, color: g.color }}
            >
              {g.label}
            </span>
            {selectedToken.category && (
              <span className="rounded bg-accent px-1.5 py-0.5 text-[10px] text-muted-foreground">
                {selectedToken.category}
              </span>
            )}
            <span className="text-[10px] text-muted-foreground/50">
              {cssVarName(selectedToken)}
            </span>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {/* Description */}
          {selectedToken.description && (
            <div>
              <div className="mb-0.5 text-[10px] text-muted-foreground">Description</div>
              <p className="text-[11px] text-foreground/70">{selectedToken.description}</p>
            </div>
          )}

          {/* Mode tabs */}
          {modes.length > 1 && (
            <div>
              <div className="mb-1 text-[10px] text-muted-foreground">Mode</div>
              <div className="flex flex-wrap gap-1">
                {modes.map((m) => {
                  const hasOverride =
                    m.id !== DEFAULT_MODE.id && selectedToken.modeValues?.[m.id] !== undefined
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setViewModeId(m.id)}
                      className={cn(
                        'flex h-5 items-center gap-1 rounded px-2 text-[10px] transition-colors',
                        viewModeId === m.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-accent/60 text-muted-foreground hover:bg-accent hover:text-foreground',
                      )}
                    >
                      {m.name}
                      {hasOverride && (
                        <span className="h-1 w-1 rounded-full bg-current opacity-60" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Value */}
          <div>
            <div className="mb-0.5 text-[10px] text-muted-foreground">Value</div>
            <div className="flex items-center gap-2 rounded border border-border bg-background px-3 py-2">
              <TokenSwatch token={selectedToken} value={displayValue} />
              <span className="text-xs text-foreground">
                {isRef ? '(token reference)' : formatValue(displayValue)}
              </span>
              {viewModeId !== DEFAULT_MODE.id &&
                selectedToken.modeValues?.[viewModeId] === undefined && (
                  <span className="ml-auto text-[9px] text-muted-foreground/40">inherited</span>
                )}
            </div>
          </div>

          {/* CSS output */}
          <div>
            <div className="mb-0.5 text-[10px] text-muted-foreground">CSS output</div>
            <pre className="rounded border border-border bg-background p-2.5 font-mono text-[10px] text-muted-foreground whitespace-pre-wrap break-all">
              {buildCssOutput(selectedToken, hasModeValues ? modes : [DEFAULT_MODE])}
            </pre>
          </div>
        </div>
      </div>
    )
  }

  // ── Group info ──────────────────────────────────────────────────────────
  if (selectedGroup) {
    const g = GROUP_META[selectedGroup]
    return (
      <div className="flex h-full flex-col overflow-hidden">
        <div className="border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <Icon icon={g.icon} width={14} height={14} style={{ color: g.color }} />
            <span className="text-xs font-semibold text-foreground">{g.label}</span>
          </div>
          <p className="mt-0.5 text-[10px] text-muted-foreground">{g.description}</p>
        </div>
        <div className="flex-1 p-4">
          <p className="text-[11px] text-muted-foreground/60">
            Select a token to view details, or click + to add a new one.
          </p>
        </div>
      </div>
    )
  }

  // ── Empty state ─────────────────────────────────────────────────────────
  return (
    <div className="flex h-full items-center justify-center p-6 text-center">
      <div>
        <Icon
          icon="tabler:variable"
          width={28}
          height={28}
          className="mx-auto mb-2 text-muted-foreground/30"
        />
        <p className="text-[11px] text-muted-foreground/50">
          Select a group or token to inspect it.
        </p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Public component
// ---------------------------------------------------------------------------

export function TokenManagerFull() {
  const tokens = useTokenStore((s) => s.tokens)
  const modes = useTokenStore((s) => s.modes)
  const activeMode = useTokenStore((s) => s.activeMode)
  const [activeTab, setActiveTab] = useState('tokens')
  const [search, setSearch] = useState('')
  const [selectedGroup, setSelectedGroup] = useState<TokenGroup | null>(null)
  const [selectedToken, setSelectedToken] = useState<DesignToken | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [creatingGroup, setCreatingGroup] = useState<TokenGroup>('color')
  const [isSaving, setIsSaving] = useState(false)

  const counts = useMemo(() => {
    const c: Record<TokenGroup, number> = { color: 0, typography: 0, spacing: 0, effect: 0 }
    for (const t of tokens) c[t.group]++
    return c
  }, [tokens])

  const filtered = useMemo(() => {
    let list = selectedGroup ? tokens.filter((t) => t.group === selectedGroup) : tokens
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((t) => t.name.toLowerCase().includes(q) || t.id.toLowerCase().includes(q))
    }
    return list
  }, [tokens, selectedGroup, search])

  const handleSave = useCallback((token: DesignToken) => {
    useTokenStore.getState().upsertToken(token)
    void useTokenStore.getState().save()
    setIsEditing(false)
    setIsCreating(false)
    setSelectedToken(token)
  }, [])

  function handleDelete(token: DesignToken) {
    const tree = useDocumentStore.getState().tree
    if (tree && isTokenReferenced(tree, token.id)) {
      const ok = window.confirm(
        'This token is used by one or more elements. Deleting it will leave references unresolved. Delete anyway?',
      )
      if (!ok) return
    }
    useTokenStore.getState().deleteToken(token.id)
    void useTokenStore.getState().save()
    if (selectedToken?.id === token.id) {
      setSelectedToken(null)
      setIsEditing(false)
    }
  }

  function handleStartCreate() {
    setIsEditing(false)
    setIsCreating(true)
    setCreatingGroup(selectedGroup ?? 'color')
    setSelectedToken(null)
  }

  function handleSaveAll() {
    setIsSaving(true)
    void useTokenStore
      .getState()
      .save()
      .finally(() => setIsSaving(false))
  }

  function handleCancelEdit() {
    setIsEditing(false)
    setIsCreating(false)
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background">
      {/* ── Header bar ── */}
      <div className="flex shrink-0 items-center gap-4 border-b border-border bg-shell-bar px-5 py-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-sm font-semibold text-foreground">Design Tokens Manager</h1>
          <p className="text-[10px] text-muted-foreground">
            Load design tokens to update your design system.
          </p>
        </div>

        <div className="relative">
          <Icon
            icon="tabler:search"
            width={12}
            height={12}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/60"
          />
          <input
            type="text"
            placeholder="Search tokens…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-7 w-44 rounded border border-border bg-background pl-7 pr-2 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1">
          {[
            { icon: 'tabler:upload', title: 'Import' },
            { icon: 'tabler:download', title: 'Export' },
          ].map(({ icon, title }) => (
            <button
              key={title}
              type="button"
              title={title}
              className="flex h-7 w-7 items-center justify-center rounded border border-border text-muted-foreground transition-colors hover:border-border/80 hover:bg-accent hover:text-foreground"
            >
              <Icon icon={icon} width={13} height={13} />
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleSaveAll}
          disabled={isSaving}
          className="flex h-7 items-center gap-1.5 rounded bg-primary px-3 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isSaving ? (
            <Icon icon="tabler:loader-2" width={12} height={12} className="animate-spin" />
          ) : (
            <Icon icon="tabler:device-floppy" width={12} height={12} />
          )}
          Save Changes
        </button>
      </div>

      {/* ── Tab bar ── */}
      <div className="flex shrink-0 items-end gap-0 border-b border-border bg-shell-bar px-5">
        {TABS.map(({ id, label, icon, disabled }) => (
          <button
            key={id}
            type="button"
            disabled={disabled}
            onClick={() => !disabled && setActiveTab(id)}
            className={cn(
              'flex items-center gap-1.5 border-b-2 px-3 pb-2 pt-2.5 text-[11px] transition-colors',
              activeTab === id
                ? 'border-primary text-foreground'
                : disabled
                  ? 'cursor-not-allowed border-transparent text-muted-foreground/30'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon icon={icon} width={12} height={12} />
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'tokens' && (
        <>
          {/* ── Modes bar ── */}
          <ModesBar
            modes={modes}
            activeMode={activeMode}
            onSetActive={(id) => useTokenStore.getState().setActiveMode(id)}
            onAdd={(name) => {
              useTokenStore.getState().addMode(name)
            }}
            onDelete={(id) => useTokenStore.getState().deleteMode(id)}
          />

          {/* ── Body: three columns ── */}
          <div className="flex min-h-0 flex-1">
            {/* Left: group tree */}
            <div className="w-44 shrink-0 border-r border-border">
              <GroupColumn
                selected={selectedGroup}
                onSelect={(g) => {
                  setSelectedGroup(g)
                  setSelectedToken(null)
                  setIsEditing(false)
                  setIsCreating(false)
                }}
                counts={counts}
                total={tokens.length}
              />
            </div>

            {/* Center: token table */}
            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
              {/* Table header */}
              <div
                className="grid shrink-0 items-center gap-3 border-b border-border bg-shell-bar px-4 py-2"
                style={{ gridTemplateColumns: '24px 1fr 80px 140px 130px 56px' }}
              >
                <div />
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                  Name
                </div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                  Group
                </div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                  Value
                </div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                  CSS var
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    title="New token"
                    onClick={handleStartCreate}
                    className="flex h-6 items-center gap-1 rounded bg-primary px-2 text-[10px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    <Icon icon="tabler:plus" width={10} height={10} />
                    New
                  </button>
                </div>
              </div>

              {/* Token rows */}
              <div className="flex-1 overflow-y-auto">
                {filtered.length === 0 ? (
                  <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                      <Icon
                        icon="tabler:variable-off"
                        width={24}
                        height={24}
                        className="mx-auto mb-2 text-muted-foreground/30"
                      />
                      <p className="text-[11px] text-muted-foreground/50">
                        {search ? 'No tokens match your search.' : 'No tokens yet.'}
                      </p>
                    </div>
                  </div>
                ) : (
                  filtered.map((token) => (
                    <TokenTableRow
                      key={token.id}
                      token={token}
                      isSelected={selectedToken?.id === token.id}
                      activeMode={activeMode}
                      onSelect={() => {
                        setSelectedToken(token)
                        setIsEditing(false)
                        setIsCreating(false)
                      }}
                      onEdit={() => {
                        setSelectedToken(token)
                        setIsEditing(true)
                        setIsCreating(false)
                      }}
                      onDelete={() => handleDelete(token)}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Right: detail / edit */}
            <div className="w-72 shrink-0 border-l border-border">
              <TokenDetailPanel
                selectedGroup={selectedGroup}
                selectedToken={selectedToken}
                isEditing={isEditing}
                isCreating={isCreating}
                creatingGroup={creatingGroup}
                modes={modes}
                onSave={handleSave}
                onCancelEdit={handleCancelEdit}
                onStartEdit={() => setIsEditing(true)}
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
