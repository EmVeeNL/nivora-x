import type { DropDescriptor } from './dropResolution'

interface InsertionIndicatorProps {
  descriptor: DropDescriptor
}

/**
 * Chrome-level overlay that shows where the dragged element will land.
 *
 * - 'line': a 3px insertion bar between siblings + a dotted ghost outline
 *   showing the approximate footprint of the dropped element.
 * - 'box':  a dashed border highlight on an empty container.
 *
 * Blue = valid drop target. Red = nesting rule violation.
 */
export function InsertionIndicator({ descriptor }: InsertionIndicatorProps) {
  const { indicator, ghost, valid } = descriptor
  if (!indicator) return null

  const color = valid ? '#3b82f6' : '#ef4444'
  const ghostBg = valid ? 'rgba(59,130,246,0.07)' : 'rgba(239,68,68,0.07)'
  const ghostBorder = valid ? 'rgba(59,130,246,0.45)' : 'rgba(239,68,68,0.45)'

  if (indicator.type === 'line') {
    return (
      <>
        {/* Ghost placeholder — dotted outline where element will appear */}
        {ghost && (
          <div
            data-testid="insertion-ghost"
            style={{
              position: 'fixed',
              top: ghost.top,
              left: ghost.left,
              width: ghost.width,
              height: ghost.height,
              border: `2px dashed ${ghostBorder}`,
              backgroundColor: ghostBg,
              borderRadius: 3,
              pointerEvents: 'none',
              zIndex: 201,
              boxSizing: 'border-box',
            }}
          />
        )}
        {/* Insertion line */}
        <div
          data-testid="insertion-indicator-line"
          style={{
            position: 'fixed',
            top: indicator.top - 1.5,
            left: indicator.left,
            width: indicator.width,
            height: 3,
            backgroundColor: color,
            borderRadius: 2,
            pointerEvents: 'none',
            zIndex: 202,
          }}
        >
          {/* Left cap */}
          <div
            style={{
              position: 'absolute',
              left: -3,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 9,
              height: 9,
              borderRadius: '50%',
              backgroundColor: color,
            }}
          />
          {/* Right cap */}
          <div
            style={{
              position: 'absolute',
              right: -3,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 9,
              height: 9,
              borderRadius: '50%',
              backgroundColor: color,
            }}
          />
        </div>
      </>
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
        border: `2px dashed ${ghostBorder}`,
        backgroundColor: ghostBg,
        borderRadius: 3,
        pointerEvents: 'none',
        zIndex: 202,
        boxSizing: 'border-box',
      }}
    />
  )
}
