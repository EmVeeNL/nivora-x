import { describe, it, expect } from 'vitest'
import { generateId, isValidId, reIdSubtree } from '@/document/ids'
import type { NxNode } from '@/document/schema/types'

const mkNode = (id: string, children: string[] = []): NxNode => ({
  id,
  type: 'section',
  props: {},
  children,
  overrides: {},
  meta: {},
})

describe('generateId', () => {
  it('returns a string with the nx- prefix', () => {
    expect(generateId()).toMatch(/^nx-/)
  })

  it('returns CSS-selector-safe IDs (lowercase alphanum after prefix)', () => {
    for (let i = 0; i < 50; i++) {
      expect(generateId()).toMatch(/^nx-[a-z0-9]{9}$/)
    }
  })

  it('generates unique IDs across 10 000 calls', () => {
    const ids = new Set(Array.from({ length: 10_000 }, generateId))
    expect(ids.size).toBe(10_000)
  })
})

describe('isValidId', () => {
  it('accepts valid nx- IDs', () => {
    expect(isValidId('nx-abc123def')).toBe(true)
    expect(isValidId('nx-000000000')).toBe(true)
  })

  it('rejects IDs without nx- prefix', () => {
    expect(isValidId('abc123defgh')).toBe(false)
  })

  it('rejects IDs with wrong length', () => {
    expect(isValidId('nx-ab')).toBe(false)
    expect(isValidId('nx-abcdefghij')).toBe(false)
  })

  it('rejects IDs with uppercase letters', () => {
    expect(isValidId('nx-ABCDEFGHI')).toBe(false)
  })

  it('rejects IDs with special characters', () => {
    expect(isValidId('nx-abc!@#def')).toBe(false)
  })
})

describe('reIdSubtree', () => {
  it('assigns fresh IDs to every node in the subtree', () => {
    const nodes: Record<string, NxNode> = {
      'nx-root0001': mkNode('nx-root0001', ['nx-sec00001']),
      'nx-sec00001': mkNode('nx-sec00001', ['nx-txt00001']),
      'nx-txt00001': mkNode('nx-txt00001'),
    }
    const { newNodes, newRootId } = reIdSubtree(nodes, 'nx-root0001')

    // All original IDs should be gone
    expect(newNodes['nx-root0001']).toBeUndefined()
    expect(newNodes['nx-sec00001']).toBeUndefined()
    expect(newNodes['nx-txt00001']).toBeUndefined()

    // New root ID must be in the new nodes map
    expect(newNodes[newRootId]).toBeDefined()
  })

  it('all new IDs pass isValidId', () => {
    const nodes: Record<string, NxNode> = {
      'nx-root0001': mkNode('nx-root0001', ['nx-child001']),
      'nx-child001': mkNode('nx-child001'),
    }
    const { newNodes, newRootId } = reIdSubtree(nodes, 'nx-root0001')
    expect(isValidId(newRootId)).toBe(true)
    for (const id of Object.keys(newNodes)) {
      expect(isValidId(id)).toBe(true)
    }
  })

  it('preserves the subtree structure (parent → child links)', () => {
    const nodes: Record<string, NxNode> = {
      'nx-root0001': mkNode('nx-root0001', ['nx-child001']),
      'nx-child001': mkNode('nx-child001'),
    }
    const { newNodes, newRootId } = reIdSubtree(nodes, 'nx-root0001')

    const newRoot = newNodes[newRootId]!
    expect(newRoot.children).toHaveLength(1)

    const childId = newRoot.children[0]!
    expect(newNodes[childId]).toBeDefined()
    expect(newNodes[childId]!.children).toHaveLength(0)
  })

  it('produces a unique new ID for every node (no collisions)', () => {
    const nodes: Record<string, NxNode> = {
      'nx-root0001': mkNode('nx-root0001', ['nx-a000001', 'nx-b000001']),
      'nx-a000001': mkNode('nx-a000001'),
      'nx-b000001': mkNode('nx-b000001'),
    }
    const { newNodes } = reIdSubtree(nodes, 'nx-root0001')
    const ids = Object.keys(newNodes)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('does not modify nodes outside the target subtree', () => {
    const nodes: Record<string, NxNode> = {
      'nx-root0001': mkNode('nx-root0001', ['nx-sec00001']),
      'nx-sec00001': mkNode('nx-sec00001'),
      'nx-unrelated': mkNode('nx-unrelated'),
    }
    const { newNodes } = reIdSubtree(nodes, 'nx-sec00001')
    expect(newNodes['nx-unrelated']).toBeUndefined()
    expect(newNodes['nx-root0001']).toBeUndefined()
  })

  it('returns the old→new ID mapping', () => {
    const nodes: Record<string, NxNode> = {
      'nx-root0001': mkNode('nx-root0001'),
    }
    const { idMap, newRootId } = reIdSubtree(nodes, 'nx-root0001')
    expect(idMap.get('nx-root0001')).toBe(newRootId)
  })
})
