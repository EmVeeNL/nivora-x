import { useState, useEffect, type RefObject } from 'react'

/** A minimal axis-aligned rect in viewport (chrome) coordinates. */
export interface RectBox {
  top: number
  left: number
  width: number
  height: number
}

/**
 * Returns the viewport-relative rect of a canvas element identified by nodeId,
 * mapped from iframe-space to chrome-space.
 *
 * Re-computes on: main-window scroll/resize, iframe content scroll, iframe resize.
 *
 * This is the shared primitive for the selection overlay (Phase 05) and
 * drag-and-drop drop indicators (Phase 06). Keep its API stable.
 */
export function useFrameRect(
  iframeRef: RefObject<HTMLIFrameElement | null>,
  nodeId: string | null,
): RectBox | null {
  const [rect, setRect] = useState<RectBox | null>(null)

  useEffect(() => {
    if (!nodeId) {
      setRect(null)
      return
    }

    const measure = () => {
      const iframe = iframeRef.current
      if (!iframe) {
        setRect(null)
        return
      }
      const iframeRect = iframe.getBoundingClientRect()
      const el = iframe.contentDocument?.querySelector(`[data-node-id="${CSS.escape(nodeId)}"]`)
      if (!el) {
        setRect(null)
        return
      }
      const elRect = el.getBoundingClientRect()
      setRect({
        top: iframeRect.top + elRect.top,
        left: iframeRect.left + elRect.left,
        width: elRect.width,
        height: elRect.height,
      })
    }

    measure()

    const iframe = iframeRef.current
    if (!iframe) return

    const ro = new ResizeObserver(measure)
    ro.observe(iframe)

    const iframeDoc = iframe.contentDocument
    if (iframeDoc) {
      iframeDoc.addEventListener('scroll', measure, { passive: true })
    }
    window.addEventListener('scroll', measure, { passive: true })
    window.addEventListener('resize', measure, { passive: true })

    return () => {
      ro.disconnect()
      iframeDoc?.removeEventListener('scroll', measure)
      window.removeEventListener('scroll', measure)
      window.removeEventListener('resize', measure)
    }
    // iframeRef is stable; intentionally omitted from deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodeId])

  return rect
}
