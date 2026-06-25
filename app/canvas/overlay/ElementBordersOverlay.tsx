import { useEffect, useState, type RefObject } from 'react'
import { useUiStore } from '@/state/uiStore'
import { useDocumentStore } from '@/document/store'
import { getElementDefinition, hasElement } from '@/elements/registry'

const CATEGORY_COLORS: Record<string, string> = {
  Layout: '#3b82f6',
  Typography: '#a855f7',
  Forms: '#10b981',
  Media: '#f97316',
  CMS: '#06b6d4',
  Components: '#ec4899',
}

interface RectInfo {
  top: number
  left: number
  width: number
  height: number
  color: string
}

/**
 * Shows a colored dashed outline for every canvas element when
 * showElementBorders is enabled. Uses position:fixed in the chrome (not inside
 * the iframe) so no layout shifts occur inside the canvas.
 */
export function ElementBordersOverlay({
  iframeRef,
}: {
  iframeRef: RefObject<HTMLIFrameElement | null>
}) {
  const showBorders = useUiStore((s) => s.showElementBorders)
  const tree = useDocumentStore((s) => s.tree)
  const [rectMap, setRectMap] = useState<Record<string, RectInfo | null>>({})

  useEffect(() => {
    if (!showBorders || !tree) {
      setRectMap({})
      return
    }

    let rafId: number

    function update() {
      const iframe = iframeRef.current
      if (!iframe) {
        rafId = requestAnimationFrame(update)
        return
      }
      const iframeRect = iframe.getBoundingClientRect()
      const iframeDoc = iframe.contentDocument
      if (!iframeDoc) {
        rafId = requestAnimationFrame(update)
        return
      }

      const currentTree = useDocumentStore.getState().tree
      if (!currentTree) {
        rafId = requestAnimationFrame(update)
        return
      }

      const next: Record<string, RectInfo | null> = {}
      for (const nodeId of Object.keys(currentTree.nodes)) {
        const node = currentTree.nodes[nodeId]
        if (!node || node.type.startsWith('__')) {
          next[nodeId] = null
          continue
        }

        const el = iframeDoc.querySelector(`[data-node-id="${nodeId}"]`)
        if (!el) {
          next[nodeId] = null
          continue
        }

        const elRect = el.getBoundingClientRect()
        if (elRect.width === 0 && elRect.height === 0) {
          next[nodeId] = null
          continue
        }

        let color = '#64748b'
        if (hasElement(node.type)) {
          const def = getElementDefinition(node.type)
          color = CATEGORY_COLORS[def.category] ?? '#64748b'
        }

        next[nodeId] = {
          top: iframeRect.top + elRect.top,
          left: iframeRect.left + elRect.left,
          width: elRect.width,
          height: elRect.height,
          color,
        }
      }

      setRectMap(next)
      rafId = requestAnimationFrame(update)
    }

    rafId = requestAnimationFrame(update)
    return () => cancelAnimationFrame(rafId)
    // iframeRef is a stable ref — intentionally omitted from deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showBorders, tree])

  if (!showBorders) return null

  return (
    <>
      {Object.entries(rectMap).map(([nodeId, info]) => {
        if (!info) return null
        return (
          <div
            key={nodeId}
            data-testid="element-border"
            style={{
              position: 'fixed',
              top: info.top,
              left: info.left,
              width: info.width,
              height: info.height,
              outline: `1px dashed ${info.color}aa`,
              outlineOffset: -1,
              pointerEvents: 'none',
              zIndex: 98,
            }}
          />
        )
      })}
    </>
  )
}
