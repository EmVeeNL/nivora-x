import { describe, it, expect } from 'vitest'
import { validateNode, validateTree, validateEnvelope } from '@/document/schema/validate'
import { serialize, deserialize, SerializationError } from '@/document/schema/serialize'
import type { DocumentEnvelope } from '@/document/schema/types'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const VALID_NODE = {
  id: 'nx-root0001',
  type: 'body',
  props: {},
  children: [],
  overrides: {},
  meta: {},
}

const VALID_TREE = {
  rootId: 'nx-root0001',
  nodes: { 'nx-root0001': VALID_NODE },
}

const VALID_ENVELOPE: DocumentEnvelope = {
  version: 1,
  tree: VALID_TREE,
  meta: { title: 'Home' },
}

// ---------------------------------------------------------------------------
// validateNode
// ---------------------------------------------------------------------------

describe('validateNode', () => {
  it('passes for a valid node', () => {
    const r = validateNode(VALID_NODE, 'nx-root0001')
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.value.type).toBe('body')
  })

  it('fails when node is not an object', () => {
    const r = validateNode('not-an-object', 'nx-x')
    expect(r.ok).toBe(false)
    expect(r.errors.length).toBeGreaterThan(0)
  })

  it('fails when id is missing', () => {
    const r = validateNode({ ...VALID_NODE, id: '' }, 'nx-root0001')
    expect(r.ok).toBe(false)
    expect(r.errors.some((e) => e.field.includes('id'))).toBe(true)
  })

  it('fails when type is missing', () => {
    const r = validateNode({ ...VALID_NODE, type: undefined }, 'nx-root0001')
    expect(r.ok).toBe(false)
    expect(r.errors.some((e) => e.field.includes('type'))).toBe(true)
  })

  it('fails when props is an array instead of object', () => {
    const r = validateNode({ ...VALID_NODE, props: [1, 2] }, 'nx-root0001')
    expect(r.ok).toBe(false)
    expect(r.errors.some((e) => e.field.includes('props'))).toBe(true)
  })

  it('fails when children contains a non-string', () => {
    const r = validateNode({ ...VALID_NODE, children: [42] }, 'nx-root0001')
    expect(r.ok).toBe(false)
    expect(r.errors.some((e) => e.field.includes('children'))).toBe(true)
  })

  it('fails when overrides is missing', () => {
    const r = validateNode({ ...VALID_NODE, overrides: null }, 'nx-root0001')
    expect(r.ok).toBe(false)
    expect(r.errors.some((e) => e.field.includes('overrides'))).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// validateTree
// ---------------------------------------------------------------------------

describe('validateTree', () => {
  it('passes for a valid tree', () => {
    const r = validateTree(VALID_TREE)
    expect(r.ok).toBe(true)
  })

  it('fails when tree is not an object', () => {
    expect(validateTree(null).ok).toBe(false)
    expect(validateTree(42).ok).toBe(false)
  })

  it('fails when rootId is empty', () => {
    const r = validateTree({ ...VALID_TREE, rootId: '' })
    expect(r.ok).toBe(false)
    expect(r.errors.some((e) => e.field === 'tree.rootId')).toBe(true)
  })

  it('fails when nodes is not an object', () => {
    const r = validateTree({ rootId: 'nx-root0001', nodes: null })
    expect(r.ok).toBe(false)
    expect(r.errors.some((e) => e.field === 'tree.nodes')).toBe(true)
  })

  it('fails when rootId does not exist in nodes', () => {
    const r = validateTree({ rootId: 'nx-missing', nodes: { 'nx-root0001': VALID_NODE } })
    expect(r.ok).toBe(false)
    expect(r.errors.some((e) => e.message.includes('does not exist'))).toBe(true)
  })

  it('propagates node validation errors', () => {
    const r = validateTree({
      rootId: 'nx-bad',
      nodes: { 'nx-bad': { ...VALID_NODE, id: 'nx-bad', type: '' } },
    })
    expect(r.ok).toBe(false)
    expect(r.errors.some((e) => e.field.includes('type'))).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// validateEnvelope
// ---------------------------------------------------------------------------

describe('validateEnvelope', () => {
  it('passes for a valid envelope', () => {
    const r = validateEnvelope(VALID_ENVELOPE)
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.value.version).toBe(1)
  })

  it('fails when envelope is not an object', () => {
    expect(validateEnvelope('string').ok).toBe(false)
  })

  it('fails when version is not an integer', () => {
    const r = validateEnvelope({ ...VALID_ENVELOPE, version: '1' })
    expect(r.ok).toBe(false)
    expect(r.errors.some((e) => e.field === 'version')).toBe(true)
  })

  it('fails when meta is an array', () => {
    const r = validateEnvelope({ ...VALID_ENVELOPE, meta: [] })
    expect(r.ok).toBe(false)
    expect(r.errors.some((e) => e.field === 'meta')).toBe(true)
  })

  it('propagates tree validation errors', () => {
    const r = validateEnvelope({ ...VALID_ENVELOPE, tree: null })
    expect(r.ok).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// serialize / deserialize — round-trip
// ---------------------------------------------------------------------------

describe('serialize / deserialize', () => {
  it('round-trips a valid envelope losslessly', () => {
    const json = serialize(VALID_ENVELOPE)
    const restored = deserialize(json)
    expect(restored).toEqual(VALID_ENVELOPE)
  })

  it('serialize returns a compact JSON string', () => {
    const json = serialize(VALID_ENVELOPE)
    expect(typeof json).toBe('string')
    expect(json).toContain('"version":1')
    expect(json).toContain('"rootId"')
  })

  it('deserialize throws SerializationError on invalid JSON', () => {
    expect(() => deserialize('{broken json')).toThrow(SerializationError)
  })

  it('deserialize throws SerializationError when validation fails', () => {
    const bad = JSON.stringify({ version: 1, tree: null, meta: {} })
    expect(() => deserialize(bad)).toThrow(SerializationError)
  })

  it('SerializationError includes validation error details', () => {
    const bad = JSON.stringify({ version: 'wrong', tree: VALID_TREE, meta: {} })
    try {
      deserialize(bad)
      expect.fail('should have thrown')
    } catch (err) {
      expect(err).toBeInstanceOf(SerializationError)
      const se = err as SerializationError
      expect(se.validationErrors.length).toBeGreaterThan(0)
    }
  })

  it('round-trip preserves unknown extra fields (pass-through)', () => {
    const withExtra = { ...VALID_ENVELOPE, _extra: 'preserved' }
    const json = JSON.stringify(withExtra)
    const restored = deserialize(json) as typeof withExtra
    expect(restored._extra).toBe('preserved')
  })
})
