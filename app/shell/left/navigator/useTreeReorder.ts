import { useEffect, useState } from 'react'
import type { DropDescriptor } from '@/canvas/dnd/dropResolution'
import { useDndEditor } from '@/canvas/dnd/DndProvider'
import { canInteract } from '@/document/canInteract'
import { useDocumentStore } from '@/document/store'
import type { DocumentTree } from '@/document/schema/types'
import { getElementDefinition, hasElement } from '@/elements/registry'

function findParentId(tree: DocumentTree, nodeId: string): string | null {
  for (const [id, node] of Object.entries(tree.nodes)) {
    if (node.children.includes(nodeId)) return id
  }
  return null
}

function subtreeIds(tree: DocumentTree, nodeId: string): Set<string> {
  const ids = new Set<string>()
  const queue = [nodeId]
  while (queue.length > 0) {
    const id = queue.shift()!
    if (ids.has(id)) continue
    const node = tree.nodes[id]
    if (!node) continue
    ids.add(id)
    queue.push(...node.children)
  }
  return ids
}

function canDrop(tree: DocumentTree, parentId: string, movingNodeId: string): boolean {
  const movingNode = tree.nodes[movingNodeId]
  const parent = tree.nodes[parentId]
  if (!movingNode || !parent) return false
  if (!canInteract(movingNode)) return false
  if (parentId === movingNodeId || subtreeIds(tree, movingNodeId).has(parentId)) return false
  if (parentId !== tree.rootId && !canInteract(parent)) return false

  if (!hasElement(parent.type)) return true

  const parentDef = getElementDefinition(parent.type)
  if (!parentDef.nesting.acceptsChildren) return false
  if (
    parentDef.nesting.allowedChildTypes &&
    !parentDef.nesting.allowedChildTypes.includes(movingNode.type)
  ) {
    return false
  }
  return true
}

function lineDescriptor(
  row: HTMLElement,
  targetParentId: string,
  index: number,
  valid: boolean,
  top: number,
): DropDescriptor {
  const rect = row.getBoundingClientRect()
  return {
    targetParentId,
    index,
    valid,
    indicator: {
      type: 'line',
      top,
      left: rect.left,
      width: rect.width,
      height: 2,
    },
    ghost: null,
  }
}

function boxDescriptor(
  row: HTMLElement,
  targetParentId: string,
  index: number,
  valid: boolean,
): DropDescriptor {
  const rect = row.getBoundingClientRect()
  return {
    targetParentId,
    index,
    valid,
    indicator: {
      type: 'box',
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    },
    ghost: null,
  }
}

function resolveTreeDescriptor(clientX: number, clientY: number, movingNodeId: string) {
  const tree = useDocumentStore.getState().tree
  if (!tree) return null

  // Use elementsFromPoint (returns all elements in z-order) so the fixed
  // CanvasDropOverlay and DragOverlay ghost don't block finding the row beneath.
  const row =
    document
      .elementsFromPoint(clientX, clientY)
      .find((el): el is HTMLElement => el instanceof HTMLElement && Boolean(el.dataset['rowId'])) ??
    null
  if (!row) return null

  const targetId = row.dataset['rowId']
  if (!targetId || targetId === movingNodeId) return null

  const target = tree.nodes[targetId]
  if (!target) return null

  const rect = row.getBoundingClientRect()
  const yRatio = (clientY - rect.top) / (rect.height || 1)

  if (yRatio < 0.33) {
    const parentId = findParentId(tree, targetId)
    if (!parentId) return null
    const parent = tree.nodes[parentId]
    const index = parent ? parent.children.indexOf(targetId) : 0
    return lineDescriptor(
      row,
      parentId,
      Math.max(0, index),
      canDrop(tree, parentId, movingNodeId),
      rect.top,
    )
  }

  if (yRatio > 0.67) {
    const parentId = findParentId(tree, targetId)
    if (!parentId) return null
    const parent = tree.nodes[parentId]
    const index = parent ? parent.children.indexOf(targetId) + 1 : 0
    return lineDescriptor(row, parentId, index, canDrop(tree, parentId, movingNodeId), rect.bottom)
  }

  return boxDescriptor(row, targetId, target.children.length, canDrop(tree, targetId, movingNodeId))
}

export function useTreeReorder(): DropDescriptor | null {
  const { isDragging, draggedItem, treeDropDescriptorRef } = useDndEditor()
  const [descriptor, setDescriptor] = useState<DropDescriptor | null>(null)

  useEffect(() => {
    if (!isDragging || draggedItem?.intent !== 'move') {
      treeDropDescriptorRef.current = null
      setDescriptor(null)
      return
    }

    function handlePointerMove(event: PointerEvent) {
      if (draggedItem?.intent !== 'move') return
      const next = resolveTreeDescriptor(event.clientX, event.clientY, draggedItem.nodeId)
      treeDropDescriptorRef.current = next
      setDescriptor(next)
    }

    document.addEventListener('pointermove', handlePointerMove)

    return () => {
      document.removeEventListener('pointermove', handlePointerMove)
      treeDropDescriptorRef.current = null
      setDescriptor(null)
    }
  }, [draggedItem, isDragging, treeDropDescriptorRef])

  return descriptor
}
