import type { RefObject } from 'react'
import { useDocumentStore } from '@/document/store'
import { useUiStore } from '@/state/uiStore'
import { useFrameRect, type RectBox } from './useFrameRect'

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

interface SelectionOverlayProps {
  iframeRef: RefObject<HTMLIFrameElement | null>
}

/**
 * Renders selection and hover outlines in the editor chrome, mapped to
 * element positions inside the iframe canvas.
 *
 * Uses position:fixed so outlines track element visual positions regardless
 * of canvas-chrome scroll depth.
 */
export function SelectionOverlay({ iframeRef }: SelectionOverlayProps) {
  const selectedId = useDocumentStore((s) => s.selectedId)
  const hoveredId = useUiStore((s) => s.hoveredId)

  // Show hover outline only when hovering a different element than the selection.
  const hoverTargetId = hoveredId !== selectedId ? hoveredId : null

  const selectionRect = useFrameRect(iframeRef, selectedId)
  const hoverRect = useFrameRect(iframeRef, hoverTargetId)

  return (
    <>
      {hoverRect && <OverlayBox rect={hoverRect} variant="hover" />}
      {selectionRect && <OverlayBox rect={selectionRect} variant="selection" />}
    </>
  )
}
