import { useState } from 'react'
import { Icon } from '@iconify/react'
import type { DesignToken, TokenGroup } from '@/tokens/model'
import type { UnitValue } from '@/inspector/controls/types'
import { useTokenStore } from '@/tokens/store'
import { useDocumentStore } from '@/document/store'
import { isTokenReferenced } from '@/tokens/integrity'
import { TokenEditor } from './TokenEditor'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isUnitValue(v: unknown): v is UnitValue {
  return typeof v === 'object' && v !== null && 'value' in v && 'unit' in v
}

function formatValue(token: DesignToken): string {
  const v = token.value
  if (isUnitValue(v)) return `${v.value}${v.unit}`
  if (typeof v === 'string') {
    if (v.length > 22) return v.slice(0, 22) + '…'
    return v
  }
  return '—'
}

// ---------------------------------------------------------------------------
// Token preview swatch / badge
// ---------------------------------------------------------------------------

function TokenPreview({ token }: { token: DesignToken }) {
  const v = token.value

  if (token.group === 'color' && typeof v === 'string') {
    return (
      <div
        aria-hidden="true"
        style={{
          width: 16,
          height: 16,
          borderRadius: 3,
          background: v,
          border: '1px solid rgba(255,255,255,0.1)',
          flexShrink: 0,
        }}
      />
    )
  }

  if (token.group === 'typography' && typeof v === 'string') {
    return (
      <span
        aria-hidden="true"
        style={{
          fontFamily: v,
          fontSize: 12,
          color: '#aaa',
          flexShrink: 0,
          width: 16,
          textAlign: 'center',
          lineHeight: 1,
        }}
      >
        Aa
      </span>
    )
  }

  if (token.group === 'spacing') {
    return (
      <Icon
        icon="tabler:spacing-horizontal"
        width={14}
        height={14}
        style={{ color: '#666', flexShrink: 0 }}
      />
    )
  }

  return (
    <Icon
      icon="tabler:border-radius"
      width={14}
      height={14}
      style={{ color: '#666', flexShrink: 0 }}
    />
  )
}

// ---------------------------------------------------------------------------
// Token row
// ---------------------------------------------------------------------------

interface TokenRowProps {
  token: DesignToken
  isEditing: boolean
  onEdit: () => void
  onDelete: () => void
  onSave: (updated: DesignToken) => void
  onCancelEdit: () => void
}

function TokenRow({ token, isEditing, onEdit, onDelete, onSave, onCancelEdit }: TokenRowProps) {
  if (isEditing) {
    return (
      <li style={{ listStyle: 'none', padding: '4px 8px' }}>
        <TokenEditor group={token.group} token={token} onSave={onSave} onCancel={onCancelEdit} />
      </li>
    )
  }

  return (
    <li
      style={{
        listStyle: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 8px',
        borderRadius: 3,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = '#1e1e1e'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent'
      }}
    >
      <TokenPreview token={token} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 11,
            color: '#ccc',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {token.name}
        </div>
        <div
          style={{
            fontSize: 10,
            color: '#555',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            marginTop: 1,
          }}
        >
          {formatValue(token)}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
        <button
          type="button"
          title="Edit token"
          onClick={onEdit}
          style={{
            width: 20,
            height: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: 'none',
            color: '#555',
            cursor: 'pointer',
            borderRadius: 2,
            padding: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#aaa'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#555'
          }}
        >
          <Icon icon="tabler:pencil" width={12} height={12} />
        </button>
        <button
          type="button"
          title="Delete token"
          onClick={onDelete}
          style={{
            width: 20,
            height: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: 'none',
            color: '#555',
            cursor: 'pointer',
            borderRadius: 2,
            padding: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#f87171'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#555'
          }}
        >
          <Icon icon="tabler:trash" width={12} height={12} />
        </button>
      </div>
    </li>
  )
}

// ---------------------------------------------------------------------------
// Group section
// ---------------------------------------------------------------------------

const GROUP_META: Record<TokenGroup, { label: string; icon: string }> = {
  color: { label: 'Colors', icon: 'tabler:palette' },
  typography: { label: 'Typography', icon: 'tabler:typography' },
  spacing: { label: 'Spacing', icon: 'tabler:spacing-horizontal' },
  effect: { label: 'Effects', icon: 'tabler:sparkles' },
}

interface GroupSectionProps {
  group: TokenGroup
  tokens: DesignToken[]
  editingId: string | null
  isCreating: boolean
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onSave: (token: DesignToken) => void
  onCancelEdit: () => void
  onStartCreate: () => void
  onCancelCreate: () => void
  onCreateSave: (token: DesignToken) => void
}

function GroupSection({
  group,
  tokens,
  editingId,
  isCreating,
  onEdit,
  onDelete,
  onSave,
  onCancelEdit,
  onStartCreate,
  onCancelCreate,
  onCreateSave,
}: GroupSectionProps) {
  const [collapsed, setCollapsed] = useState(false)
  const meta = GROUP_META[group]

  return (
    <div style={{ borderBottom: '1px solid #1e1e1e' }}>
      <button
        type="button"
        onClick={() => setCollapsed((v) => !v)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 8px',
          background: 'transparent',
          border: 'none',
          color: '#888',
          cursor: 'pointer',
          fontSize: 10,
          fontWeight: 600,
          textTransform: 'uppercase' as const,
          letterSpacing: '0.05em',
        }}
      >
        <Icon
          icon={collapsed ? 'tabler:chevron-right' : 'tabler:chevron-down'}
          width={10}
          height={10}
          style={{ flexShrink: 0 }}
        />
        <Icon icon={meta.icon} width={12} height={12} style={{ flexShrink: 0 }} />
        <span style={{ flex: 1, textAlign: 'left' }}>{meta.label}</span>
        <span style={{ color: '#444' }}>{tokens.length}</span>
      </button>

      {!collapsed && (
        <>
          {tokens.length === 0 && !isCreating && (
            <p style={{ fontSize: 10, color: '#444', padding: '4px 8px 6px 30px', margin: 0 }}>
              No {meta.label.toLowerCase()} yet
            </p>
          )}

          <ul style={{ margin: 0, padding: 0 }}>
            {tokens.map((token) => (
              <TokenRow
                key={token.id}
                token={token}
                isEditing={editingId === token.id}
                onEdit={() => onEdit(token.id)}
                onDelete={() => onDelete(token.id)}
                onSave={onSave}
                onCancelEdit={onCancelEdit}
              />
            ))}
          </ul>

          {isCreating && (
            <div style={{ padding: '4px 8px 6px' }}>
              <TokenEditor group={group} onSave={onCreateSave} onCancel={onCancelCreate} />
            </div>
          )}

          {!isCreating && (
            <button
              type="button"
              onClick={onStartCreate}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '4px 8px 6px 30px',
                background: 'transparent',
                border: 'none',
                color: '#444',
                cursor: 'pointer',
                fontSize: 10,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#777'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#444'
              }}
            >
              <Icon icon="tabler:plus" width={10} height={10} />
              Add {meta.label.slice(0, -1).toLowerCase()}
            </button>
          )}
        </>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Public panel
// ---------------------------------------------------------------------------

const GROUPS: TokenGroup[] = ['color', 'typography', 'spacing', 'effect']

export function TokenManager() {
  const tokens = useTokenStore((s) => s.tokens)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [creatingGroup, setCreatingGroup] = useState<TokenGroup | null>(null)

  function handleSave(token: DesignToken) {
    useTokenStore.getState().upsertToken(token)
    void useTokenStore.getState().save()
    setEditingId(null)
    setCreatingGroup(null)
  }

  function handleDelete(id: string) {
    const tree = useDocumentStore.getState().tree
    if (tree && isTokenReferenced(tree, id)) {
      const ok = window.confirm(
        'This token is used by one or more elements. Deleting it will leave those references unresolved. Delete anyway?',
      )
      if (!ok) return
    }
    useTokenStore.getState().deleteToken(id)
    void useTokenStore.getState().save()
    if (editingId === id) setEditingId(null)
  }

  function handleEdit(id: string) {
    setCreatingGroup(null)
    setEditingId((prev) => (prev === id ? null : id))
  }

  function handleStartCreate(group: TokenGroup) {
    setEditingId(null)
    setCreatingGroup(group)
  }

  return (
    <div
      data-testid="token-manager"
      style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%' }}
    >
      <div
        style={{
          padding: '8px 8px 6px',
          borderBottom: '1px solid #1e1e1e',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 11, fontWeight: 600, color: '#ccc', flex: 1 }}>Design Tokens</span>
        <span style={{ fontSize: 10, color: '#444' }}>{tokens.length}</span>
      </div>

      <div style={{ overflowY: 'auto', flex: 1 }}>
        {GROUPS.map((group) => (
          <GroupSection
            key={group}
            group={group}
            tokens={tokens.filter((t) => t.group === group)}
            editingId={editingId}
            isCreating={creatingGroup === group}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSave={handleSave}
            onCancelEdit={() => setEditingId(null)}
            onStartCreate={() => handleStartCreate(group)}
            onCancelCreate={() => setCreatingGroup(null)}
            onCreateSave={handleSave}
          />
        ))}
      </div>
    </div>
  )
}
