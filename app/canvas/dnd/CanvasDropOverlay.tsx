import { useState, useEffect, type RefObject } from 'react'
import { useDocumentStore } from '@/document/store'
import { useDndEditor } from './DndProvider'
import { resolveDropDescriptor, type DropDescriptor } from './dropResolution'
import { InsertionIndicator } from './InsertionIndicator'

interface CanvasDropOverlayProps {
  iframeRef: RefObject<HTMLIFrameElement | null>
}

/**
 * Full-viewport transparent overlay active only during a drag.
 *
 * Uses document-level pointermove instead of React onPointerMove because
 * dnd-kit's PointerSensor calls setPointerCapture on the drag source element,
 * redirecting all pointer events to it. Captured events still bubble to
 * document, so document.addEventListener works where React synthetic events
 * on the overlay div do not.
 */
export function CanvasDropOverlay({ iframeRef }: CanvasDropOverlayProps) {
  const { isDragging, draggedItem, dropDescriptorRef } = useDndEditor()
  const [descriptor, setDescriptor] = useState<DropDescriptor | null>(null)

  useEffect(() => {
    if (!isDragging) {
      setDescriptor(null)
      return
    }

    function onMove(e: PointerEvent) {
      const iframe = iframeRef.current
      const item = draggedItem
      const tree = useDocumentStore.getState().tree

      if (!iframe || !item || !tree) {
        dropDescriptorRef.current = null
        setDescriptor(null)
        return
      }

      const childType =
        item.intent === 'insert' ? item.elementType : (tree.nodes[item.nodeId]?.type ?? '')
      const movingNodeId = item.intent === 'move' ? item.nodeId : undefined

      const desc = resolveDropDescriptor(
        iframe,
        e.clientX,
        e.clientY,
        tree,
        childType,
        movingNodeId,
      )
      dropDescriptorRef.current = desc
      setDescriptor(desc)
    }

    function onLeave() {
      dropDescriptorRef.current = null
      setDescriptor(null)
    }

    document.addEventListener('pointermove', onMove)
    document.addEventListener('pointerleave', onLeave)

    return () => {
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
      dropDescriptorRef.current = null
      setDescriptor(null)
    }
  }, [isDragging, draggedItem, iframeRef, dropDescriptorRef])

  if (!isDragging) return null

  return (
    <div
      data-testid="canvas-drop-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        pointerEvents: 'none',
      }}
    >
      {descriptor && <InsertionIndicator descriptor={descriptor} />}
    </div>
  )
}
