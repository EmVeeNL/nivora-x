import { useEffect, type RefObject } from 'react'
import { canInteract } from '@/document/canInteract'
import { useDocumentStore } from '@/document/store'
import { useUiStore } from '@/state/uiStore'

/**
 * Attaches pointer-event listeners to the iframe document for click-to-select
 * and hover tracking. Must be called after bootstrapIframe() has written the
 * iframe document (i.e., after the bootstrap useEffect in CanvasFrame).
 *
 * Resolution strategy: find the closest ancestor (or self) with data-node-id,
 * so clicking inside a deeply nested element selects the nearest node.
 */
export function useCanvasSelection(
  iframeRef: RefObject<HTMLIFrameElement | null>,
  enabled = true,
): void {
  useEffect(() => {
    if (!enabled) {
      useUiStore.getState().setHoveredId(null)
      return
    }

    const iframe = iframeRef.current
    const doc = iframe?.contentDocument
    if (!doc) return

    const handleClick = (e: MouseEvent) => {
      const target = (e.target as Element).closest('[data-node-id]')
      const nodeId = target?.getAttribute('data-node-id') ?? null
      const node = nodeId ? useDocumentStore.getState().tree?.nodes[nodeId] : null
      if (node && !canInteract(node)) {
        e.preventDefault()
        e.stopPropagation()
        return
      }
      useDocumentStore.getState().selectNode(nodeId)
    }

    const handleMouseOver = (e: MouseEvent) => {
      const target = (e.target as Element).closest('[data-node-id]')
      const nodeId = target?.getAttribute('data-node-id') ?? null
      useUiStore.getState().setHoveredId(nodeId)
    }

    const handleMouseOut = (e: MouseEvent) => {
      const related = e.relatedTarget as Element | null
      if (!related || !related.closest('[data-node-id]')) {
        useUiStore.getState().setHoveredId(null)
      }
    }

    doc.addEventListener('click', handleClick)
    doc.addEventListener('mouseover', handleMouseOver)
    doc.addEventListener('mouseout', handleMouseOut)

    return () => {
      doc.removeEventListener('click', handleClick)
      doc.removeEventListener('mouseover', handleMouseOver)
      doc.removeEventListener('mouseout', handleMouseOut)
      useUiStore.getState().setHoveredId(null)
    }
    // iframeRef is a stable ref object; intentionally omitted from deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled])
}
