import { describe, it, expect } from 'vitest'
import type { DocumentTree } from '@/document/schema/types'
import { makeTokenRef } from '@/tokens/model'
import {
  findNodeRefs,
  isTokenReferenced,
  reassignTokenRefs,
  resolveOrOrphan,
} from '@/tokens/integrity'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeTree(nodes: DocumentTree['nodes']): DocumentTree {
  const rootId = Object.keys(nodes)[0] ?? 'root'
  return { rootId, nodes }
}

function node(
  id: string,
  props: Record<string, unknown>,
  overrides: DocumentTree['nodes'][string]['overrides'] = {},
): DocumentTree['nodes'][string] {
  return { id, type: 'section', props, children: [], overrides, meta: {} }
}

// ---------------------------------------------------------------------------
// findNodeRefs
// ---------------------------------------------------------------------------

describe('findNodeRefs', () => {
  it('returns empty array when no token refs exist', () => {
    const tree = makeTree({ n1: node('n1', { color: '#fff' }) })
    expect(findNodeRefs(tree, 'color-primary')).toEqual([])
  })

  it('finds a flat token ref in props', () => {
    const tree = makeTree({ n1: node('n1', { color: makeTokenRef('color-primary') }) })
    expect(findNodeRefs(tree, 'color-primary')).toEqual(['n1'])
  })

  it('finds a token ref inside a responsive object (base slot)', () => {
    const tree = makeTree({
      n1: node('n1', { color: { base: makeTokenRef('color-primary') } }),
    })
    expect(findNodeRefs(tree, 'color-primary')).toEqual(['n1'])
  })

  it('finds a token ref inside a responsive object (override slot)', () => {
    const tree = makeTree({
      n1: node('n1', { color: { base: '#000', tablet: makeTokenRef('color-primary') } }),
    })
    expect(findNodeRefs(tree, 'color-primary')).toEqual(['n1'])
  })

  it('finds a token ref in node.overrides', () => {
    const tree = makeTree({
      n1: node('n1', { color: '#000' }, { tablet: { color: makeTokenRef('color-primary') } }),
    })
    expect(findNodeRefs(tree, 'color-primary')).toEqual(['n1'])
  })

  it('does not match a different token id', () => {
    const tree = makeTree({ n1: node('n1', { color: makeTokenRef('color-secondary') }) })
    expect(findNodeRefs(tree, 'color-primary')).toEqual([])
  })

  it('returns multiple node ids when multiple nodes reference the token', () => {
    const tree = makeTree({
      n1: node('n1', { color: makeTokenRef('color-primary') }),
      n2: node('n2', { backgroundColor: makeTokenRef('color-primary') }),
    })
    const refs = findNodeRefs(tree, 'color-primary')
    expect(refs).toContain('n1')
    expect(refs).toContain('n2')
    expect(refs).toHaveLength(2)
  })
})

// ---------------------------------------------------------------------------
// isTokenReferenced
// ---------------------------------------------------------------------------

describe('isTokenReferenced', () => {
  it('returns false when token is not referenced', () => {
    const tree = makeTree({ n1: node('n1', { color: '#fff' }) })
    expect(isTokenReferenced(tree, 'color-primary')).toBe(false)
  })

  it('returns true when token is referenced', () => {
    const tree = makeTree({ n1: node('n1', { color: makeTokenRef('color-primary') }) })
    expect(isTokenReferenced(tree, 'color-primary')).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// reassignTokenRefs
// ---------------------------------------------------------------------------

describe('reassignTokenRefs', () => {
  it('renames references from one token id to another', () => {
    const tree = makeTree({ n1: node('n1', { color: makeTokenRef('old-id') }) })
    const next = reassignTokenRefs(tree, 'old-id', 'new-id')
    const prop = next.nodes['n1']?.props['color']
    expect(prop).toEqual({ __token: 'new-id' })
  })

  it('renames references inside responsive objects', () => {
    const tree = makeTree({
      n1: node('n1', { color: { base: makeTokenRef('old-id'), tablet: '#fff' } }),
    })
    const next = reassignTokenRefs(tree, 'old-id', 'new-id')
    const color = next.nodes['n1']?.props['color'] as Record<string, unknown>
    expect(color['base']).toEqual({ __token: 'new-id' })
    expect(color['tablet']).toBe('#fff')
  })

  it('renames references inside node.overrides', () => {
    const tree = makeTree({
      n1: node('n1', { color: '#000' }, { tablet: { color: makeTokenRef('old-id') } }),
    })
    const next = reassignTokenRefs(tree, 'old-id', 'new-id')
    const ovColor = next.nodes['n1']?.overrides['tablet']?.['color']
    expect(ovColor).toEqual({ __token: 'new-id' })
  })

  it('does not mutate the original tree', () => {
    const tree = makeTree({ n1: node('n1', { color: makeTokenRef('old-id') }) })
    const next = reassignTokenRefs(tree, 'old-id', 'new-id')
    expect(tree.nodes['n1']?.props['color']).toEqual({ __token: 'old-id' })
    expect(next.nodes['n1']?.props['color']).toEqual({ __token: 'new-id' })
  })

  it('strips references when toId is null', () => {
    const tree = makeTree({ n1: node('n1', { color: makeTokenRef('old-id') }) })
    const next = reassignTokenRefs(tree, 'old-id', null)
    const prop = next.nodes['n1']?.props['color']
    expect(prop).toBeUndefined()
  })
})

// ---------------------------------------------------------------------------
// resolveOrOrphan
// ---------------------------------------------------------------------------

describe('resolveOrOrphan', () => {
  it('returns the original token ref when id is known', () => {
    const ref = makeTokenRef('color-primary')
    const known = new Set(['color-primary'])
    expect(resolveOrOrphan(ref, known, '')).toBe(ref)
  })

  it('returns the fallback when the referenced token is unknown (orphan)', () => {
    const ref = makeTokenRef('deleted-token')
    const known = new Set(['color-primary'])
    expect(resolveOrOrphan(ref, known, '')).toBe('')
  })

  it('passes non-token values through unchanged', () => {
    const known = new Set(['color-primary'])
    expect(resolveOrOrphan('#fff', known, '')).toBe('#fff')
    expect(resolveOrOrphan(null, known, '')).toBeNull()
  })
})
