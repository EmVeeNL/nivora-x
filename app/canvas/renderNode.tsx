import type { DocumentTree } from '@/document/schema/types'
import { isHidden } from '@/document/canInteract'
import { getElementDefinition } from '@/elements/registry'
import { useUiStore } from '@/state/uiStore'
import { isHiddenAtBreakpoint } from './style/applyStyles'

interface RenderNodeProps {
  nodeId: string
  tree: DocumentTree
}

/**
 * Renders a single node and its descendants using the element registry.
 * Unknown types render the safe fallback placeholder.
 * `data-node-id` is passed to each element's render component so it can
 * place it on the root DOM element (required for pointer-event resolution).
 */
export function RenderNode({ nodeId, tree }: RenderNodeProps) {
  const activeBreakpoint = useUiStore((s) => s.activeBreakpoint)
  const node = tree.nodes[nodeId]
  if (!node) return null

  const def = getElementDefinition(node.type)
  const Render = def.render

  const childNodes = node.children.map((childId) => (
    <RenderNode key={childId} nodeId={childId} tree={tree} />
  ))

  const rendered = (
    <Render node={node} data-node-id={nodeId} className={`nivorax-${nodeId}`}>
      {childNodes.length > 0 ? childNodes : undefined}
    </Render>
  )

  if (isHiddenAtBreakpoint(node, activeBreakpoint)) {
    return (
      <div style={{ position: 'relative', opacity: 0.25, pointerEvents: 'none' }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <span
            style={{
              background: 'rgba(0,0,0,0.65)',
              borderRadius: 4,
              padding: '3px 8px',
              fontSize: 11,
              color: '#fff',
              fontFamily: 'sans-serif',
              letterSpacing: 0.3,
            }}
          >
            Hidden on {activeBreakpoint}
          </span>
        </div>
        {rendered}
      </div>
    )
  }

  if (isHidden(node)) {
    return <div style={{ opacity: 0.35, pointerEvents: 'none' }}>{rendered}</div>
  }

  return rendered
}
