import type { DocumentTree } from '@/document/schema/types'
import { getElementDefinition } from '@/elements/registry'

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
  const node = tree.nodes[nodeId]
  if (!node) return null

  const def = getElementDefinition(node.type)
  const Render = def.render

  const childNodes = node.children.map((childId) => (
    <RenderNode key={childId} nodeId={childId} tree={tree} />
  ))

  return (
    <Render node={node} data-node-id={nodeId}>
      {childNodes.length > 0 ? childNodes : undefined}
    </Render>
  )
}
