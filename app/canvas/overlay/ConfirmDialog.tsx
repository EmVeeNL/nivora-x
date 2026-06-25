import { createPortal } from 'react-dom'
import { useUiStore } from '@/state/uiStore'
import { useDocumentStore } from '@/document/store'

/**
 * Portal-based delete confirmation dialog.
 * Reads pendingDelete from uiStore; renders nothing when null.
 */
export function ConfirmDialog() {
  const pendingDelete = useUiStore((s) => s.pendingDelete)
  if (!pendingDelete) return null

  function handleConfirm() {
    const { nodeId } = useUiStore.getState().pendingDelete!
    useUiStore.getState().setPendingDelete(null)
    useDocumentStore.getState().removeNode(nodeId)
  }

  function handleCancel() {
    useUiStore.getState().setPendingDelete(null)
  }

  const dialog = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Confirm delete"
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
          minWidth: 300,
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}
      >
        <h2 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 600, color: '#ffffff' }}>
          Delete element?
        </h2>
        <p style={{ margin: '0 0 20px', fontSize: 13, color: '#999', lineHeight: 1.5 }}>
          <strong style={{ color: '#ccc' }}>{pendingDelete.label}</strong> and all its children will
          be permanently removed. This can be undone with Cmd+Z.
        </p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
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
            onClick={handleConfirm}
            autoFocus
            style={{
              height: 32,
              padding: '0 16px',
              background: '#ef4444',
              border: '1px solid #ef4444',
              borderRadius: 5,
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )

  return createPortal(dialog, document.body)
}
