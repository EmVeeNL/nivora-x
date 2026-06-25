import type { NxNode } from './schema/types'

/** Hidden nodes stay in the document tree but do not participate in canvas interaction. */
export function isHidden(node: NxNode): boolean {
  return node.meta.visible === false
}

/** Locked nodes stay selectable in the navigator but resist canvas and mutation actions. */
export function isLocked(node: NxNode): boolean {
  return node.meta.locked === true
}

/** Shared guard for editor actions that mutate or directly interact with a node. */
export function canInteract(node: NxNode): boolean {
  return !isHidden(node) && !isLocked(node)
}
