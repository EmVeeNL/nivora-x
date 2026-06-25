import { cn } from '@/lib/utils'
import { useDocumentStore } from '@/document/store'
import { getElementDefinition, hasElement } from '@/elements/registry'
import type { DocumentTree } from '@/document/schema/types'

function findAncestorPath(tree: DocumentTree, targetId: string): string[] {
  function dfs(nodeId: string, path: string[]): string[] | null {
    if (nodeId === targetId) return [...path, nodeId]
    const node = tree.nodes[nodeId]
    if (!node) return null
    for (const childId of node.children) {
      const result = dfs(childId, [...path, nodeId])
      if (result) return result
    }
    return null
  }
  return dfs(tree.rootId, []) ?? []
}

function nodeLabel(tree: DocumentTree, nodeId: string): string {
  const node = tree.nodes[nodeId]
  if (!node) return nodeId
  if (node.meta.name) return node.meta.name
  if (hasElement(node.type)) return getElementDefinition(node.type).label
  return node.type
}

export function BreadcrumbBar() {
  const selectedId = useDocumentStore((s) => s.selectedId)
  const tree = useDocumentStore((s) => s.tree)

  if (!tree || !selectedId) {
    return (
      <nav aria-label="Element breadcrumb" className="flex min-w-0 flex-1 items-center">
        <span className="text-xs text-muted-foreground/40">No element selected</span>
      </nav>
    )
  }

  const path = findAncestorPath(tree, selectedId)

  return (
    <nav
      aria-label="Element breadcrumb"
      className="flex min-w-0 flex-1 items-center gap-0.5 overflow-hidden"
    >
      {path.map((nodeId, index) => {
        const isLast = index === path.length - 1
        const label = nodeLabel(tree, nodeId)
        return (
          <span key={nodeId} className="flex shrink-0 items-center gap-0.5">
            <button
              type="button"
              aria-current={isLast ? 'location' : undefined}
              onClick={() => useDocumentStore.getState().selectNode(nodeId)}
              className={cn(
                'max-w-[120px] truncate rounded px-1 py-0.5 text-xs transition-colors',
                isLast
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              )}
            >
              {label}
            </button>
            {!isLast && (
              <span aria-hidden="true" className="shrink-0 text-xs text-muted-foreground/50">
                ›
              </span>
            )}
          </span>
        )
      })}
    </nav>
  )
}
