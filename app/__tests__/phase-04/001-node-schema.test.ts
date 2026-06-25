import { describe, it, expect } from 'vitest'
import type {
  NxNode,
  DocumentTree,
  DocumentEnvelope,
  ResponsiveValue,
  ApiEnvelope,
} from '@/document/schema/types'
import { SCHEMA_VERSION, RESPONSIVE_BREAKPOINTS } from '@/document/schema/constants'

describe('NxNode shape', () => {
  it('accepts all required fields with full metadata and overrides', () => {
    const node: NxNode = {
      id: 'nx-abc12345',
      type: 'section',
      props: { background: '#fff', padding: 32 },
      children: ['nx-child1', 'nx-child2'],
      overrides: {
        tablet: { padding: 16 },
        mobile: { padding: 8 },
      },
      meta: { name: 'Hero Section', visible: true, locked: false },
    }
    expect(node.id).toBe('nx-abc12345')
    expect(node.type).toBe('section')
    expect(node.children).toHaveLength(2)
    expect(node.overrides.tablet?.padding).toBe(16)
    expect(node.overrides.mobile?.padding).toBe(8)
    expect(node.meta.name).toBe('Hero Section')
  })

  it('accepts empty overrides and meta (minimal node)', () => {
    const node: NxNode = {
      id: 'nx-root0001',
      type: 'body',
      props: {},
      children: [],
      overrides: {},
      meta: {},
    }
    expect(node.overrides).toEqual({})
    expect(node.meta).toEqual({})
  })

  it('allows only some breakpoints in overrides', () => {
    const node: NxNode = {
      id: 'nx-x1',
      type: 'text',
      props: { fontSize: 18 },
      children: [],
      overrides: { tablet: { fontSize: 14 } },
      meta: {},
    }
    expect(node.overrides.tablet?.fontSize).toBe(14)
    expect(node.overrides.mobile).toBeUndefined()
  })
})

describe('DocumentTree shape', () => {
  it('contains rootId and nodes map', () => {
    const tree: DocumentTree = {
      rootId: 'nx-root0001',
      nodes: {
        'nx-root0001': {
          id: 'nx-root0001',
          type: 'body',
          props: {},
          children: ['nx-sec001'],
          overrides: {},
          meta: {},
        },
        'nx-sec001': {
          id: 'nx-sec001',
          type: 'section',
          props: {},
          children: [],
          overrides: {},
          meta: { name: 'Hero' },
        },
      },
    }
    expect(tree.rootId).toBe('nx-root0001')
    expect(Object.keys(tree.nodes)).toHaveLength(2)
    expect(tree.nodes['nx-sec001']?.meta.name).toBe('Hero')
  })
})

describe('DocumentEnvelope shape', () => {
  it('carries version, tree, and meta — matching Phase 02 PHP contract', () => {
    const envelope: DocumentEnvelope = {
      version: 1,
      tree: {
        rootId: 'nx-root0001',
        nodes: {
          'nx-root0001': {
            id: 'nx-root0001',
            type: 'body',
            props: {},
            children: [],
            overrides: {},
            meta: {},
          },
        },
      },
      meta: { title: 'Home' },
    }
    expect(envelope.version).toBe(1)
    expect(envelope.tree.rootId).toBe('nx-root0001')
    expect(envelope.meta).toEqual({ title: 'Home' })

    // JSON keys must match the PHP Envelope shape exactly
    const wire = JSON.parse(JSON.stringify(envelope)) as Record<string, unknown>
    expect(Object.keys(wire).sort()).toEqual(['meta', 'tree', 'version'])
  })
})

describe('ApiEnvelope', () => {
  it('allows null tree for posts with no saved document', () => {
    const apiEnv: ApiEnvelope = { version: 1, tree: null, meta: {} }
    expect(apiEnv.tree).toBeNull()
  })

  it('allows a full tree', () => {
    const apiEnv: ApiEnvelope = {
      version: 1,
      tree: {
        rootId: 'nx-root0001',
        nodes: {
          'nx-root0001': {
            id: 'nx-root0001',
            type: 'body',
            props: {},
            children: [],
            overrides: {},
            meta: {},
          },
        },
      },
      meta: {},
    }
    expect(apiEnv.tree?.rootId).toBe('nx-root0001')
  })
})

describe('ResponsiveValue', () => {
  it('requires a base value and allows optional breakpoint overrides', () => {
    const fontSize: ResponsiveValue<number> = { base: 18, tablet: 14 }
    expect(fontSize.base).toBe(18)
    expect(fontSize.tablet).toBe(14)
    expect(fontSize.mobile).toBeUndefined()
  })
})

describe('Schema constants', () => {
  it('SCHEMA_VERSION is 1', () => {
    expect(SCHEMA_VERSION).toBe(1)
  })

  it('RESPONSIVE_BREAKPOINTS contains tablet and mobile only', () => {
    expect(RESPONSIVE_BREAKPOINTS).toContain('tablet')
    expect(RESPONSIVE_BREAKPOINTS).toContain('mobile')
    expect(RESPONSIVE_BREAKPOINTS).toHaveLength(2)
  })
})
