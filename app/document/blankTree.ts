import type { DocumentTree } from './schema/types'
import { generateId } from './ids'

/**
 * Creates a minimal blank document tree with a single root node.
 * The root node type '__root__' is intentionally not in the element
 * registry so any element type is accepted as a child (canDrop returns true).
 */
export function createBlankTree(): DocumentTree {
  const rootId = generateId()
  return {
    rootId,
    nodes: {
      [rootId]: {
        id: rootId,
        type: '__root__',
        props: {},
        children: [],
        overrides: {},
        meta: { name: 'Page' },
      },
    },
  }
}
