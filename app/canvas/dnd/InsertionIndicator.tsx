import type { DropDescriptor } from './dropResolution'

interface InsertionIndicatorProps {
  descriptor: DropDescriptor
}

/**
 * Chrome-level overlay element that shows where the dragged element will land.
 * Uses position:fixed so it tracks element rects regardless of scroll.
 *
 * - 'line': a 2px horizontal rule between siblings (blue = valid, red = invalid).
 * - 'box':  a dashed border highlight on an empty container.
 */
export function InsertionIndicator({ descriptor }: InsertionIndicatorProps) {
  const { indicator, valid } = descriptor
  if (!indicator) return null

  const color = valid ? '#3b82f6' : '#ef4444'

  if (indicator.type === 'line') {
    return (
      <div
        data-testid="insertion-indicator-line"
        style={{
          position: 'fixed',
          top: indicator.top - 1,
          left: indicator.left,
          width: indicator.width,
          height: 2,
          backgroundColor: color,
          borderRadius: 1,
          pointerEvents: 'none',
          zIndex: 202,
        }}
      />
    )
  }

  return (
    <div
      data-testid="insertion-indicator-box"
      style={{
        position: 'fixed',
        top: indicator.top,
        left: indicator.left,
        width: indicator.width,
        height: indicator.height,
        border: `2px dashed ${color}`,
        backgroundColor: valid ? 'rgba(59,130,246,0.06)' : 'rgba(239,68,68,0.06)',
        borderRadius: 2,
        pointerEvents: 'none',
        zIndex: 202,
        boxSizing: 'border-box',
      }}
    />
  )
}
