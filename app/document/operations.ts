import type { DocumentTree, NxNode, ResponsiveBreakpoint } from './schema/types'
import { reIdSubtree } from './ids'

/** Returns all descendant IDs of a node (inclusive of the node itself). */
function collectSubtree(nodes: Record<string, NxNode>, rootId: string): string[] {
  const ids: string[] = []
  const queue = [rootId]
  while (queue.length > 0) {
    const id = queue.shift()!
    const node = nodes[id]
    if (!node) continue
    ids.push(id)
    for (const childId of node.children) queue.push(childId)
  }
  return ids
}

/** Find the parent ID of a given node. Returns undefined if not found (root case). */
function findParentId(nodes: Record<string, NxNode>, nodeId: string): string | undefined {
  for (const [id, node] of Object.entries(nodes)) {
    if (node.children.includes(nodeId)) return id
  }
  return undefined
}

// ---------------------------------------------------------------------------
// Pure mutation functions
// ---------------------------------------------------------------------------

/**
 * Insert a node into the tree under parentId at position index.
 * The node must already have a valid ID (generated with ids.ts).
 * index defaults to append (end of children).
 */
export function insertNode(
  tree: DocumentTree,
  node: NxNode,
  parentId: string,
  index?: number,
): DocumentTree {
  const parent = tree.nodes[parentId]
  if (!parent) throw new Error(`insertNode: parent "${parentId}" not found`)
  if (tree.nodes[node.id]) throw new Error(`insertNode: node "${node.id}" already exists`)

  const newChildren = [...parent.children]
  const at = index !== undefined ? Math.min(index, newChildren.length) : newChildren.length
  newChildren.splice(at, 0, node.id)

  return {
    ...tree,
    nodes: {
      ...tree.nodes,
      [parentId]: { ...parent, children: newChildren },
      [node.id]: node,
    },
  }
}

/**
 * Remove a node and all its descendants from the tree.
 * Returns the new tree and the list of removed IDs.
 */
export function removeNode(
  tree: DocumentTree,
  nodeId: string,
): { tree: DocumentTree; removedIds: string[] } {
  if (nodeId === tree.rootId) throw new Error('removeNode: cannot remove the root node')
  const node = tree.nodes[nodeId]
  if (!node) throw new Error(`removeNode: node "${nodeId}" not found`)

  const removedIds = collectSubtree(tree.nodes, nodeId)
  const parentId = findParentId(tree.nodes, nodeId)

  const newNodes = { ...tree.nodes }
  for (const id of removedIds) delete newNodes[id]

  if (parentId && newNodes[parentId]) {
    const parent = newNodes[parentId]
    newNodes[parentId] = {
      ...parent,
      children: parent.children.filter((c) => c !== nodeId),
    }
  }

  return { tree: { ...tree, nodes: newNodes }, removedIds }
}

/**
 * Move a node to a new parent at a given index.
 * Returns null if the move is invalid (e.g. into own descendant, or root).
 */
export function moveNode(
  tree: DocumentTree,
  nodeId: string,
  newParentId: string,
  newIndex: number,
): DocumentTree | null {
  if (nodeId === tree.rootId) return null
  const node = tree.nodes[nodeId]
  if (!node) return null
  const newParent = tree.nodes[newParentId]
  if (!newParent) return null

  // Guard: cannot move into own descendant
  const subtree = collectSubtree(tree.nodes, nodeId)
  if (subtree.includes(newParentId)) return null

  const oldParentId = findParentId(tree.nodes, nodeId)
  const newNodes = { ...tree.nodes }

  // Remove from old parent
  if (oldParentId && newNodes[oldParentId]) {
    const oldParent = newNodes[oldParentId]
    newNodes[oldParentId] = {
      ...oldParent,
      children: oldParent.children.filter((c) => c !== nodeId),
    }
  }

  // Insert at new parent
  const currentNewParent = newNodes[newParentId]!
  const newChildren = currentNewParent.children.filter((c) => c !== nodeId)
  const at = Math.min(newIndex, newChildren.length)
  newChildren.splice(at, 0, nodeId)
  newNodes[newParentId] = { ...currentNewParent, children: newChildren }

  return { ...tree, nodes: newNodes }
}

/**
 * Update props on a node.
 * If breakpoint is given, merges into overrides[breakpoint].
 * Otherwise merges into base props.
 */
export function updateProps(
  tree: DocumentTree,
  nodeId: string,
  props: Record<string, unknown>,
  breakpoint?: ResponsiveBreakpoint,
): DocumentTree {
  const node = tree.nodes[nodeId]
  if (!node) throw new Error(`updateProps: node "${nodeId}" not found`)

  const updatedNode: NxNode = breakpoint
    ? {
        ...node,
        overrides: {
          ...node.overrides,
          [breakpoint]: { ...(node.overrides[breakpoint] ?? {}), ...props },
        },
      }
    : { ...node, props: { ...node.props, ...props } }

  return { ...tree, nodes: { ...tree.nodes, [nodeId]: updatedNode } }
}

/**
 * Duplicate a node (and its subtree) adjacent to the original.
 * Returns the new tree and the ID of the new duplicate root.
 */
export function duplicateNode(
  tree: DocumentTree,
  nodeId: string,
): { tree: DocumentTree; newNodeId: string } {
  if (nodeId === tree.rootId) throw new Error('duplicateNode: cannot duplicate the root node')
  const node = tree.nodes[nodeId]
  if (!node) throw new Error(`duplicateNode: node "${nodeId}" not found`)

  const { newNodes, newRootId } = reIdSubtree(tree.nodes, nodeId)
  const parentId = findParentId(tree.nodes, nodeId)
  if (!parentId) throw new Error(`duplicateNode: parent of "${nodeId}" not found`)

  const parent = tree.nodes[parentId]!
  const originalIndex = parent.children.indexOf(nodeId)
  const newChildren = [...parent.children]
  newChildren.splice(originalIndex + 1, 0, newRootId)

  return {
    tree: {
      ...tree,
      nodes: {
        ...tree.nodes,
        ...newNodes,
        [parentId]: { ...parent, children: newChildren },
      },
    },
    newNodeId: newRootId,
  }
}
