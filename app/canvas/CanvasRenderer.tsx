import { useDocumentStore } from '@/document/store'
import { EmptyState } from './EmptyState'
import { RenderNode } from './renderNode'

/**
 * Root renderer for the canvas iframe.
 * Reads the document tree from the store and renders the top-level elements.
 * The root node (page container) is not rendered directly — its children are.
 */
export function CanvasRenderer() {
  const tree = useDocumentStore((s) => s.tree)

  if (!tree) return <EmptyState />

  const root = tree.nodes[tree.rootId]
  if (!root || root.children.length === 0) return <EmptyState />

  return (
    <>
      {root.children.map((childId) => (
        <RenderNode key={childId} nodeId={childId} tree={tree} />
      ))}
    </>
  )
}
