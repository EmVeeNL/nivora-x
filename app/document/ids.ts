import type { NxNode } from './schema/types'

const CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789'
const ID_LENGTH = 9

/**
 * Generate a unique, CSS-selector-safe node ID.
 * Format: `nx-` + 9 lowercase alphanumeric chars (~36^9 ≈ 1.6 trillion combinations).
 */
export function generateId(): string {
  let id = 'nx-'
  for (let i = 0; i < ID_LENGTH; i++) {
    id += CHARS.charAt(Math.floor(Math.random() * CHARS.length)) || 'a'
  }
  return id
}

/** Returns true if the given string is a valid NivoraX node ID. */
export function isValidId(id: string): boolean {
  return /^nx-[a-z0-9]{9}$/.test(id)
}

/**
 * Deep-clone a node subtree, assigning fresh IDs to every node.
 * Returns the cloned nodes map, the new root ID, and the old→new ID mapping.
 */
export function reIdSubtree(
  nodes: Record<string, NxNode>,
  subtreeRootId: string,
): { newNodes: Record<string, NxNode>; newRootId: string; idMap: Map<string, string> } {
  // Collect all IDs in the subtree (BFS)
  const subtreeIds: string[] = []
  const queue = [subtreeRootId]
  while (queue.length > 0) {
    const id = queue.shift()!
    const node = nodes[id]
    if (!node) continue
    subtreeIds.push(id)
    for (const childId of node.children) {
      queue.push(childId)
    }
  }

  // Build old → new ID map
  const idMap = new Map<string, string>()
  for (const oldId of subtreeIds) {
    idMap.set(oldId, generateId())
  }

  // Clone nodes with remapped IDs
  const newNodes: Record<string, NxNode> = {}
  for (const oldId of subtreeIds) {
    const node = nodes[oldId]
    if (!node) continue
    const newId = idMap.get(oldId) ?? generateId()
    newNodes[newId] = {
      ...node,
      id: newId,
      children: node.children.map((c) => idMap.get(c) ?? c),
    }
  }

  return { newNodes, newRootId: idMap.get(subtreeRootId) ?? generateId(), idMap }
}
