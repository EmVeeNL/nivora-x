import type { DocumentTree } from '@/document/schema/types'
import { getElementDefinition, hasElement } from '@/elements/registry'

export interface DropIndicator {
  /** 'line' = horizontal insertion line between siblings; 'box' = container highlight. */
  type: 'line' | 'box'
  /** Viewport (chrome) coordinates. */
  top: number
  left: number
  width: number
  height: number
}

export interface GhostRect {
  top: number
  left: number
  width: number
  height: number
}

export interface DropDescriptor {
  targetParentId: string
  index: number
  /** Whether the nesting rules allow this drop. */
  valid: boolean
  indicator: DropIndicator | null
  /** Optional dotted ghost preview of where the element will be placed. */
  ghost: GhostRect | null
}

/** Collect all IDs in the subtree rooted at nodeId (inclusive). */
function subtreeIds(nodes: DocumentTree['nodes'], nodeId: string): Set<string> {
  const ids = new Set<string>()
  const queue = [nodeId]
  while (queue.length > 0) {
    const id = queue.shift()!
    if (ids.has(id)) continue
    const node = nodes[id]
    if (!node) continue
    ids.add(id)
    for (const c of node.children) queue.push(c)
  }
  return ids
}

/** Find the parent node ID of a given node. */
function findParentId(nodes: DocumentTree['nodes'], nodeId: string): string | undefined {
  for (const [id, node] of Object.entries(nodes)) {
    if (node.children.includes(nodeId)) return id
  }
  return undefined
}

/** Check whether childType can be dropped into parentId. */
function canDrop(
  tree: DocumentTree,
  targetParentId: string,
  childType: string,
  /** ID of the node being moved (undefined when inserting new). */
  movingNodeId?: string,
): boolean {
  // Guard against dropping into own descendant
  if (movingNodeId) {
    const sub = subtreeIds(tree.nodes, movingNodeId)
    if (sub.has(targetParentId)) return false
    if (targetParentId === movingNodeId) return false
  }

  const parent = tree.nodes[targetParentId]
  if (!parent) return false

  // System/root node (not in element registry) accepts any element.
  if (!hasElement(parent.type)) return true

  const parentDef = getElementDefinition(parent.type)
  if (!parentDef.nesting.acceptsChildren) return false
  if (
    parentDef.nesting.allowedChildTypes &&
    !parentDef.nesting.allowedChildTypes.includes(childType)
  ) {
    return false
  }
  return true
}

function lineIndicator(top: number, iframeRect: DOMRect, nodeRect: DOMRect): DropIndicator {
  return {
    type: 'line',
    top,
    left: iframeRect.left + nodeRect.left,
    width: nodeRect.width,
    height: 2,
  }
}

function boxIndicator(iframeRect: DOMRect, nodeRect: DOMRect): DropIndicator {
  return {
    type: 'box',
    top: iframeRect.top + nodeRect.top,
    left: iframeRect.left + nodeRect.left,
    width: nodeRect.width,
    height: nodeRect.height,
  }
}

/**
 * Compute a drop descriptor from a pointer position in viewport coordinates.
 *
 * @param iframe   The canvas iframe element.
 * @param clientX  Viewport X coordinate of the pointer.
 * @param clientY  Viewport Y coordinate of the pointer.
 * @param tree     Current document tree.
 * @param childType  Element type being dragged (for nesting validation).
 * @param movingNodeId  ID of existing node being moved (undefined for new inserts).
 */
export function resolveDropDescriptor(
  iframe: HTMLIFrameElement,
  clientX: number,
  clientY: number,
  tree: DocumentTree,
  childType: string,
  movingNodeId?: string,
): DropDescriptor | null {
  const iframeRect = iframe.getBoundingClientRect()

  // Pointer must be over the iframe
  if (
    clientX < iframeRect.left ||
    clientX > iframeRect.right ||
    clientY < iframeRect.top ||
    clientY > iframeRect.bottom
  ) {
    return null
  }

  const iframeX = clientX - iframeRect.left
  const iframeY = clientY - iframeRect.top

  const iframeDoc = iframe.contentDocument
  if (!iframeDoc) return null

  const el = iframeDoc.elementFromPoint(iframeX, iframeY) as HTMLElement | null

  // Hit nothing or hit the very root — append to document root
  if (!el) {
    const valid = canDrop(tree, tree.rootId, childType, movingNodeId)
    const root = tree.nodes[tree.rootId]
    return {
      targetParentId: tree.rootId,
      index: root ? root.children.length : 0,
      valid,
      indicator: null,
      ghost: null,
    }
  }

  // Walk up to find the nearest element with data-node-id
  const nodeEl: HTMLElement | null = el.closest('[data-node-id]')

  if (!nodeEl) {
    // Inside iframe but outside any registered node — append to root
    const valid = canDrop(tree, tree.rootId, childType, movingNodeId)
    const root = tree.nodes[tree.rootId]
    return {
      targetParentId: tree.rootId,
      index: root ? root.children.length : 0,
      valid,
      indicator: null,
      ghost: null,
    }
  }

  const nodeId = nodeEl.dataset['nodeId']
  if (!nodeId) return null
  const node = tree.nodes[nodeId]
  if (!node) return null

  // Skip the moved node itself
  if (movingNodeId && nodeId === movingNodeId) return null

  const nodeDef = getElementDefinition(node.type)
  const nodeRect = nodeEl.getBoundingClientRect() // iframe-local coords
  const nodeTopCh = iframeRect.top + nodeRect.top
  const nodeBottomCh = iframeRect.top + nodeRect.bottom

  const relY = iframeY - nodeRect.top
  const relH = nodeRect.height || 1

  // --- Container element (accepts children) ---
  if (nodeDef.nesting.acceptsChildren) {
    const isEmpty = node.children.length === 0

    if (isEmpty) {
      // Drop inside an empty container
      const valid = canDrop(tree, nodeId, childType, movingNodeId)
      return {
        targetParentId: nodeId,
        index: 0,
        valid,
        indicator: boxIndicator(iframeRect, nodeRect),
        ghost: null,
      }
    }

    // Use pixel-clamped zones so very tall containers still have reachable edges.
    const edgeZone = Math.min(relH * 0.2, 28)

    if (relY < edgeZone) {
      // Top edge → before this node in its parent
      return beforeNode(tree, nodeId, childType, movingNodeId, iframeRect, nodeRect, nodeTopCh)
    }

    if (relY > relH - edgeZone) {
      // Bottom edge → after this node in its parent
      return afterNode(tree, nodeId, childType, movingNodeId, iframeRect, nodeRect, nodeBottomCh)
    }

    // Middle → inside this container (append)
    const valid = canDrop(tree, nodeId, childType, movingNodeId)
    return {
      targetParentId: nodeId,
      index: node.children.length,
      valid,
      indicator: boxIndicator(iframeRect, nodeRect),
      ghost: null,
    }
  }

  // --- Leaf element ---
  if (relY / relH < 0.5) {
    return beforeNode(tree, nodeId, childType, movingNodeId, iframeRect, nodeRect, nodeTopCh)
  }
  return afterNode(tree, nodeId, childType, movingNodeId, iframeRect, nodeRect, nodeBottomCh)
}

const GHOST_HEIGHT = 40

function beforeNode(
  tree: DocumentTree,
  nodeId: string,
  childType: string,
  movingNodeId: string | undefined,
  iframeRect: DOMRect,
  nodeRect: DOMRect,
  lineTop: number,
): DropDescriptor {
  const parentId = findParentId(tree.nodes, nodeId)
  if (!parentId) {
    return { targetParentId: tree.rootId, index: 0, valid: false, indicator: null, ghost: null }
  }
  const parent = tree.nodes[parentId]!
  const index = parent.children.indexOf(nodeId)
  const valid = canDrop(tree, parentId, childType, movingNodeId)
  return {
    targetParentId: parentId,
    index: Math.max(0, index),
    valid,
    indicator: lineIndicator(lineTop, iframeRect, nodeRect),
    ghost: {
      top: lineTop - GHOST_HEIGHT - 2,
      left: iframeRect.left + nodeRect.left,
      width: nodeRect.width,
      height: GHOST_HEIGHT,
    },
  }
}

function afterNode(
  tree: DocumentTree,
  nodeId: string,
  childType: string,
  movingNodeId: string | undefined,
  iframeRect: DOMRect,
  nodeRect: DOMRect,
  lineTop: number,
): DropDescriptor {
  const parentId = findParentId(tree.nodes, nodeId)
  if (!parentId) {
    const root = tree.nodes[tree.rootId]
    return {
      targetParentId: tree.rootId,
      index: root ? root.children.length : 0,
      valid: false,
      indicator: null,
      ghost: null,
    }
  }
  const parent = tree.nodes[parentId]!
  const index = parent.children.indexOf(nodeId)
  const valid = canDrop(tree, parentId, childType, movingNodeId)
  return {
    targetParentId: parentId,
    index: index + 1,
    valid,
    indicator: lineIndicator(lineTop, iframeRect, nodeRect),
    ghost: {
      top: lineTop + 2,
      left: iframeRect.left + nodeRect.left,
      width: nodeRect.width,
      height: GHOST_HEIGHT,
    },
  }
}
