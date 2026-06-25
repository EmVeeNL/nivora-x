import { useState, useMemo } from 'react'
import { Icon } from '@iconify/react'
import { cn } from '@/lib/utils'
import type { DesignToken, TokenGroup } from '@/tokens/model'
import type { UnitValue } from '@/inspector/controls/types'
import { useTokenStore } from '@/tokens/store'
import { useDocumentStore } from '@/document/store'
import { isTokenReferenced } from '@/tokens/integrity'
import { TokenEditor } from './TokenEditor'

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

function formatValue(token: DesignToken): string {
  const v = token.value
  if (isUnitValue(v)) return `${v.value}${v.unit}`
  if (typeof v === 'string') return v.length > 28 ? v.slice(0, 28) + '…' : v
  return '—'
}

function cssVarName(token: DesignToken): string {
  return `--nx-${token.id}`
}

// ---------------------------------------------------------------------------
// Token swatch
// ---------------------------------------------------------------------------

function TokenSwatch({ token }: { token: DesignToken }) {
  const v = token.value
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

      <div className="mt-1 mb-0.5 px-2 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/40">
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
// Token table row
// ---------------------------------------------------------------------------

interface TokenRowProps {
  token: DesignToken
  isSelected: boolean
  onSelect: () => void
  onEdit: () => void
  onDelete: () => void
}

function TokenTableRow({ token, isSelected, onSelect, onEdit, onDelete }: TokenRowProps) {
  const meta = GROUP_META[token.group]
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
      {/* Swatch */}
      <div className="flex items-center justify-center">
        <TokenSwatch token={token} />
      </div>

      {/* Name */}
      <div className="min-w-0">
        <div className="truncate text-xs font-medium text-foreground">{token.name}</div>
        <div className="truncate text-[10px] text-muted-foreground/60">{cssVarName(token)}</div>
      </div>

      {/* Group badge */}
      <div>
        <span
          className="rounded px-1.5 py-0.5 text-[10px] font-medium"
          style={{ background: `${meta.color}18`, color: meta.color }}
        >
          {meta.label}
        </span>
      </div>

      {/* Value */}
      <div className="truncate text-[11px] text-muted-foreground" title={formatValue(token)}>
        {formatValue(token)}
      </div>

      {/* CSS var */}
      <div className="truncate text-[10px] text-muted-foreground/50" title={cssVarName(token)}>
        {cssVarName(token)}
      </div>

      {/* Actions */}
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

interface RightPanelProps {
  selectedGroup: TokenGroup | null
  selectedToken: DesignToken | null
  editingToken: DesignToken | null
  isCreating: boolean
  creatingGroup: TokenGroup
  onSave: (t: DesignToken) => void
  onCancelEdit: () => void
}

function RightPanel({
  selectedGroup,
  selectedToken,
  editingToken,
  isCreating,
  creatingGroup,
  onSave,
  onCancelEdit,
}: RightPanelProps) {
  const group = editingToken?.group ?? creatingGroup
  const meta = GROUP_META[group]

  if (isCreating || editingToken) {
    return (
      <div className="flex h-full flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <Icon icon={meta.icon} width={14} height={14} style={{ color: meta.color }} />
            <span className="text-xs font-semibold text-foreground">
              {editingToken ? 'Edit token' : `New ${meta.label.slice(0, -1).toLowerCase()}`}
            </span>
          </div>
          <p className="mt-0.5 text-[10px] text-muted-foreground">{meta.description}</p>
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-y-auto p-4">
          <TokenEditor
            group={group}
            {...(editingToken ? { token: editingToken } : {})}
            onSave={onSave}
            onCancel={onCancelEdit}
          />
        </div>
      </div>
    )
  }

  if (selectedToken) {
    const g = GROUP_META[selectedToken.group]
    return (
      <div className="flex h-full flex-col overflow-hidden">
        <div className="border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <TokenSwatch token={selectedToken} />
            <span className="text-xs font-semibold text-foreground">{selectedToken.name}</span>
          </div>
          <div className="mt-1.5 flex items-center gap-1.5">
            <span
              className="rounded px-1.5 py-0.5 text-[10px] font-medium"
              style={{ background: `${g.color}18`, color: g.color }}
            >
              {g.label}
            </span>
            <span className="text-[10px] text-muted-foreground/60">
              {cssVarName(selectedToken)}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-3">
            <div className="mb-0.5 text-[10px] text-muted-foreground">Value</div>
            <div className="flex items-center gap-2 rounded border border-border bg-background px-3 py-2">
              <TokenSwatch token={selectedToken} />
              <span className="text-xs text-foreground">{formatValue(selectedToken)}</span>
            </div>
          </div>

          <div className="mb-3">
            <div className="mb-0.5 text-[10px] text-muted-foreground">CSS variable</div>
            <div className="rounded border border-border bg-background px-3 py-2 font-mono text-[10px] text-muted-foreground">
              {cssVarName(selectedToken)}
            </div>
          </div>
        </div>
      </div>
    )
  }

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
  const [activeTab, setActiveTab] = useState('tokens')
  const [search, setSearch] = useState('')
  const [selectedGroup, setSelectedGroup] = useState<TokenGroup | null>(null)
  const [selectedToken, setSelectedToken] = useState<DesignToken | null>(null)
  const [editingToken, setEditingToken] = useState<DesignToken | null>(null)
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
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.id.toLowerCase().includes(q) ||
          formatValue(t).toLowerCase().includes(q),
      )
    }
    return list
  }, [tokens, selectedGroup, search])

  function handleSave(token: DesignToken) {
    useTokenStore.getState().upsertToken(token)
    void useTokenStore.getState().save()
    setEditingToken(null)
    setIsCreating(false)
    setSelectedToken(token)
  }

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
    if (selectedToken?.id === token.id) setSelectedToken(null)
    if (editingToken?.id === token.id) setEditingToken(null)
  }

  function handleStartCreate() {
    setEditingToken(null)
    setCreatingGroup(selectedGroup ?? 'color')
    setIsCreating(true)
    setSelectedToken(null)
  }

  function handleSaveAll() {
    setIsSaving(true)
    void useTokenStore
      .getState()
      .save()
      .finally(() => setIsSaving(false))
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

        {/* Search */}
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

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          {[
            { icon: 'tabler:filter', title: 'Filter' },
            { icon: 'tabler:upload', title: 'Import' },
            { icon: 'tabler:download', title: 'Export' },
            { icon: 'tabler:settings', title: 'Settings' },
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

      {/* ── Body: three columns ── */}
      {activeTab === 'tokens' && (
        <div className="flex min-h-0 flex-1">
          {/* Left: group tree */}
          <div className="w-44 shrink-0 border-r border-border">
            <GroupColumn
              selected={selectedGroup}
              onSelect={(g) => {
                setSelectedGroup(g)
                setSelectedToken(null)
                setEditingToken(null)
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
                    onSelect={() => {
                      setSelectedToken(token)
                      setEditingToken(null)
                      setIsCreating(false)
                    }}
                    onEdit={() => {
                      setEditingToken(token)
                      setSelectedToken(null)
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
            <RightPanel
              selectedGroup={selectedGroup}
              selectedToken={selectedToken}
              editingToken={editingToken}
              isCreating={isCreating}
              creatingGroup={creatingGroup}
              onSave={handleSave}
              onCancelEdit={() => {
                setEditingToken(null)
                setIsCreating(false)
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
