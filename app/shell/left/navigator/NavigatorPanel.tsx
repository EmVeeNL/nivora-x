import { useEffect, useMemo } from 'react'
import { InsertionIndicator } from '@/canvas/dnd/InsertionIndicator'
import { useDocumentStore } from '@/document/store'
import type { DocumentTree, NxNode } from '@/document/schema/types'
import { useUiStore } from '@/state/uiStore'
import { TreeRow } from './TreeRow'
import { useTreeReorder } from './useTreeReorder'

interface NodeRow {
  node: NxNode
  depth: number
}

function buildRows(tree: DocumentTree, collapsed: Record<string, true>): NodeRow[] {
  const rows: NodeRow[] = []

  function walk(nodeId: string, depth: number) {
    const node = tree.nodes[nodeId]
    if (!node) return

    if (node.type !== '__root__') {
      rows.push({ node, depth })
    }

    if (collapsed[node.id]) return

    const childDepth = node.type === '__root__' ? 0 : depth + 1
    for (const childId of node.children) walk(childId, childDepth)
  }

  walk(tree.rootId, 0)
  return rows
}

function ancestorIds(tree: DocumentTree, nodeId: string): string[] {
  const ancestors: string[] = []
  let current = nodeId

  while (current !== tree.rootId) {
    const parent = Object.values(tree.nodes).find((node) => node.children.includes(current))
    if (!parent) break
    ancestors.push(parent.id)
    current = parent.id
  }

  return ancestors
}

export function NavigatorPanel() {
  const tree = useDocumentStore((s) => s.tree)
  const selectedId = useDocumentStore((s) => s.selectedId)
  const navigatorCollapsed = useUiStore((s) => s.navigatorCollapsed)
  const setNavigatorCollapsed = useUiStore((s) => s.setNavigatorCollapsed)
  const treeDescriptor = useTreeReorder()

  useEffect(() => {
    if (!tree || !selectedId) return
    for (const nodeId of ancestorIds(tree, selectedId)) {
      setNavigatorCollapsed(nodeId, false)
    }
  }, [selectedId, setNavigatorCollapsed, tree])

  const rows = useMemo(
    () => (tree ? buildRows(tree, navigatorCollapsed) : []),
    [navigatorCollapsed, tree],
  )

  if (!tree) {
    return (
      <p className="px-3 py-6 text-center text-[11px] text-muted-foreground/50">
        No document loaded
      </p>
    )
  }

  if (rows.length === 0) {
    return (
      <p className="px-3 py-6 text-center text-[11px] text-muted-foreground/50">
        Canvas is empty - drag elements from the Elements panel
      </p>
    )
  }

  return (
    <>
      <ul role="tree" aria-label="Layer tree" className="select-none py-1">
        {rows.map(({ node, depth }) => (
          <TreeRow
            key={node.id}
            node={node}
            depth={depth}
            selected={node.id === selectedId}
            expanded={!navigatorCollapsed[node.id]}
            canExpand={node.children.length > 0}
            onSelect={(nodeId) => useDocumentStore.getState().selectNode(nodeId)}
            onToggleExpanded={(nodeId) =>
              setNavigatorCollapsed(nodeId, !navigatorCollapsed[nodeId])
            }
          />
        ))}
      </ul>
      {treeDescriptor && <InsertionIndicator descriptor={treeDescriptor} />}
    </>
  )
}
