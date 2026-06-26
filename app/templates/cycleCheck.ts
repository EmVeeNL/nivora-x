import type { DocumentTree } from '@/document/schema/types'

/**
 * The element type used for embed-by-reference template parts. A part node
 * carries `props.templateId` pointing at the template it embeds.
 */
export const PART_ELEMENT_TYPE = 'part'

/**
 * A directed graph of template references: `templateId -> embedded templateIds`.
 * The Phase 13 reusable-parts feature must reject edges that would create a
 * cycle (a template embedding itself, directly or transitively).
 */
export type TemplateRefGraph = Record<number, number[]>

/**
 * Extract the template ids referenced by `part` nodes inside a document tree.
 * Returns a de-duplicated list; ignores parts with a missing/invalid id.
 */
export function extractPartRefs(tree: DocumentTree | null | undefined): number[] {
  if (!tree) {
    return []
  }

  const refs = new Set<number>()
  for (const node of Object.values(tree.nodes)) {
    if (node.type !== PART_ELEMENT_TYPE) {
      continue
    }
    const raw = (node.props as { templateId?: unknown }).templateId
    const id = typeof raw === 'number' ? raw : Number(raw)
    if (Number.isInteger(id) && id > 0) {
      refs.add(id)
    }
  }
  return [...refs]
}

/**
 * Whether `target` is reachable from `start` by following reference edges.
 * Iterative DFS so deeply-nested graphs cannot overflow the stack.
 */
function isReachable(graph: TemplateRefGraph, start: number, target: number): boolean {
  const stack = [start]
  const seen = new Set<number>()
  while (stack.length > 0) {
    const current = stack.pop() as number
    if (current === target) {
      return true
    }
    if (seen.has(current)) {
      continue
    }
    seen.add(current)
    for (const next of graph[current] ?? []) {
      stack.push(next)
    }
  }
  return false
}

/**
 * Whether adding an embed edge `from -> to` would create a cycle in `graph`.
 *
 * A self-reference (`from === to`) is always a cycle. Otherwise a cycle forms
 * when `from` is already reachable from `to` (so the new edge closes a loop).
 */
export function wouldCreateCycle(graph: TemplateRefGraph, from: number, to: number): boolean {
  if (from === to) {
    return true
  }
  return isReachable(graph, to, from)
}

/**
 * Whether the graph already contains a cycle reachable from `start`.
 * Used as a render-time guard alongside the edit-time {@link wouldCreateCycle}.
 */
export function hasCycleFrom(graph: TemplateRefGraph, start: number): boolean {
  const visiting = new Set<number>()
  const done = new Set<number>()

  const visit = (node: number): boolean => {
    if (visiting.has(node)) {
      return true
    }
    if (done.has(node)) {
      return false
    }
    visiting.add(node)
    for (const next of graph[node] ?? []) {
      if (visit(next)) {
        return true
      }
    }
    visiting.delete(node)
    done.add(node)
    return false
  }

  return visit(start)
}
