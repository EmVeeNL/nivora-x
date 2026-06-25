import type { DocumentTree } from '@/document/schema/types'
import { isTokenRef } from './model'

// ---------------------------------------------------------------------------
// Reference scanning
// ---------------------------------------------------------------------------

/**
 * Collect all style prop values from a node props map,
 * including both flat values and the `base` + override slots of responsive objects.
 */
function* propValues(props: Record<string, unknown>): Generator<unknown> {
  for (const raw of Object.values(props)) {
    if (typeof raw === 'object' && raw !== null && 'base' in raw && !('__token' in raw)) {
      // Responsive object — yield base + all override slots.
      const resp = raw as Record<string, unknown>
      for (const slot of Object.values(resp)) {
        yield slot
      }
    } else {
      yield raw
    }
  }
}

/** All node IDs that hold at least one reference to `tokenId`. */
export function findNodeRefs(tree: DocumentTree, tokenId: string): string[] {
  const refs: string[] = []
  for (const [nodeId, node] of Object.entries(tree.nodes)) {
    let found = false

    for (const v of propValues(node.props)) {
      if (isTokenRef(v) && v.__token === tokenId) {
        found = true
        break
      }
    }

    if (!found) {
      for (const bpProps of Object.values(node.overrides)) {
        if (bpProps) {
          for (const v of propValues(bpProps)) {
            if (isTokenRef(v) && v.__token === tokenId) {
              found = true
              break
            }
          }
        }
        if (found) break
      }
    }

    if (found) refs.push(nodeId)
  }
  return refs
}

/** True when `tokenId` is referenced by at least one node in the tree. */
export function isTokenReferenced(tree: DocumentTree, tokenId: string): boolean {
  return findNodeRefs(tree, tokenId).length > 0
}

// ---------------------------------------------------------------------------
// Reassignment (replace one token id with another across the whole tree)
// ---------------------------------------------------------------------------

function rewritePropValue(value: unknown, from: string, to: string | null): unknown {
  if (isTokenRef(value) && value.__token === from) {
    return to === null ? undefined : { __token: to }
  }
  if (typeof value === 'object' && value !== null && 'base' in value && !('__token' in value)) {
    const resp = value as Record<string, unknown>
    const next: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(resp)) {
      const rewritten = rewritePropValue(v, from, to)
      if (rewritten !== undefined) {
        next[k] = rewritten
      } else {
        next[k] = v
      }
    }
    return next
  }
  return value
}

function rewriteProps(
  props: Record<string, unknown>,
  from: string,
  to: string | null,
): Record<string, unknown> {
  const next: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(props)) {
    next[k] = rewritePropValue(v, from, to)
  }
  return next
}

/**
 * Return a new tree where all references to `fromId` are replaced with `toId`.
 * Pass `null` as `toId` to strip the reference (replace with `undefined` slot — omitted).
 */
export function reassignTokenRefs(
  tree: DocumentTree,
  fromId: string,
  toId: string | null,
): DocumentTree {
  const nextNodes = { ...tree.nodes }
  for (const nodeId of findNodeRefs(tree, fromId)) {
    const node = nextNodes[nodeId]
    if (!node) continue
    const nextOverrides: typeof node.overrides = {}
    for (const [bp, bpProps] of Object.entries(node.overrides)) {
      nextOverrides[bp] = bpProps ? rewriteProps(bpProps, fromId, toId) : bpProps
    }
    nextNodes[nodeId] = {
      ...node,
      props: rewriteProps(node.props, fromId, toId),
      overrides: nextOverrides,
    }
  }
  return { ...tree, nodes: nextNodes }
}

// ---------------------------------------------------------------------------
// Orphan fallback
// ---------------------------------------------------------------------------

/**
 * Resolve a value that may be an orphaned token reference.
 * When the referenced token does not exist in `knownIds`, returns `fallback`.
 * Otherwise returns the value unchanged.
 */
export function resolveOrOrphan<T>(
  value: unknown,
  knownIds: ReadonlySet<string>,
  fallback: T,
): unknown {
  if (isTokenRef(value)) {
    return knownIds.has(value.__token) ? value : fallback
  }
  return value
}
