import type { RefObject } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { Icon } from '@iconify/react'
import { canInteract } from '@/document/canInteract'
import { useDocumentStore } from '@/document/store'
import { useUiStore } from '@/state/uiStore'
import { useDndEditor } from '@/canvas/dnd/DndProvider'
import { getElementDefinition, hasElement } from '@/elements/registry'
import { useFrameRect, type RectBox } from './useFrameRect'

function DeleteButton({ nodeId, label }: { nodeId: string; label: string }) {
  function handleClick(e: React.MouseEvent) {
    e.stopPropagation()
    useUiStore.getState().setPendingDelete({ nodeId, label })
  }

  return (
    <button
      type="button"
      title="Delete element"
      aria-label="Delete element"
      onClick={handleClick}
      style={{
        width: 20,
        height: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(239,68,68,0.15)',
        border: '1px solid rgba(239,68,68,0.4)',
        borderRadius: 3,
        color: '#fca5a5',
        cursor: 'pointer',
        padding: 0,
        flexShrink: 0,
      }}
    >
      <Icon icon="tabler:x" width={11} height={11} />
    </button>
  )
}

interface OverlayBoxProps {
  rect: RectBox
  variant: 'selection' | 'hover'
}

function OverlayBox({ rect, variant }: OverlayBoxProps) {
  const isSelection = variant === 'selection'
  return (
    <div
      data-testid={isSelection ? 'overlay-selection' : 'overlay-hover'}
      style={{
        position: 'fixed',
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        border: isSelection ? '2px solid #3b82f6' : '1px solid #94a3b8',
        borderRadius: 2,
        pointerEvents: 'none',
        zIndex: isSelection ? 101 : 100,
        boxSizing: 'border-box',
      }}
    />
  )
}

interface DragHandleProps {
  nodeId: string
  rect: RectBox
}

/**
 * Chrome-level drag handle that initiates a canvas-reorder drag via dnd-kit.
 * Lives in the chrome DOM (not the iframe) so the PointerSensor works natively.
 */
function DragHandle({ nodeId, rect }: DragHandleProps) {
  const node = useDocumentStore((s) => s.tree?.nodes[nodeId])
  const {
    attributes,
    listeners,
    setNodeRef,
    isDragging: isThisDragging,
  } = useDraggable({
    id: `move:${nodeId}`,
    data: { intent: 'move', nodeId },
    disabled: !node || !canInteract(node),
  })

  if (!node || !canInteract(node)) return null

  const htmlId = typeof node.props['htmlId'] === 'string' ? node.props['htmlId'].trim() : ''
  const label =
    node.meta.name ||
    (htmlId ? `#${htmlId}` : null) ||
    (hasElement(node.type) ? getElementDefinition(node.type).label : node.type)

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      data-testid="drag-handle"
      title={`Drag to reorder — ${label}`}
      aria-label={`Drag to reorder ${label}`}
      style={{
        position: 'fixed',
        top: rect.top - 22,
        left: rect.left,
        cursor: isThisDragging ? 'grabbing' : 'grab',
        zIndex: 102,
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: '2px 6px',
        borderRadius: 3,
        background: '#3b82f6',
        color: '#fff',
        fontSize: 11,
        userSelect: 'none',
        opacity: isThisDragging ? 0.4 : 1,
        maxWidth: 160,
      }}
    >
      <Icon icon="tabler:grip-horizontal" width={12} height={12} className="shrink-0" />
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
        {label}
      </span>
      <DeleteButton nodeId={nodeId} label={label} />
    </div>
  )
}

interface SelectionOverlayProps {
  iframeRef: RefObject<HTMLIFrameElement | null>
}

/**
 * Renders selection and hover outlines in the editor chrome, mapped to
 * element positions inside the iframe canvas.
 * Also renders a drag handle for reordering the selected element.
 *
 * Uses position:fixed so outlines track element visual positions regardless
 * of canvas-chrome scroll depth.
 */
export function SelectionOverlay({ iframeRef }: SelectionOverlayProps) {
  const selectedId = useDocumentStore((s) => s.selectedId)
  const hoveredId = useUiStore((s) => s.hoveredId)
  const { isDragging } = useDndEditor()

  // Show hover outline only when hovering a different element than the selection.
  const hoverTargetId = hoveredId !== selectedId ? hoveredId : null

  const selectionRect = useFrameRect(iframeRef, selectedId)
  const hoverRect = useFrameRect(iframeRef, hoverTargetId)

  return (
    <>
      {hoverRect && <OverlayBox rect={hoverRect} variant="hover" />}
      {selectionRect && <OverlayBox rect={selectionRect} variant="selection" />}
      {selectionRect && selectedId && !isDragging && (
        <DragHandle nodeId={selectedId} rect={selectionRect} />
      )}
    </>
  )
}
