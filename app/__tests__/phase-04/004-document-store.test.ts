import { describe, it, expect, beforeEach } from 'vitest'
import { useDocumentStore } from '@/document/store'
import { generateId } from '@/document/ids'
import type { DocumentTree, NxNode } from '@/document/schema/types'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const mkNode = (id: string, children: string[] = []): NxNode => ({
  id,
  type: 'section',
  props: {},
  children,
  overrides: {},
  meta: {},
})

const SEED_TREE: DocumentTree = {
  rootId: 'nx-root0001',
  nodes: {
    'nx-root0001': mkNode('nx-root0001', ['nx-sec00001']),
    'nx-sec00001': mkNode('nx-sec00001', ['nx-txt00001']),
    'nx-txt00001': mkNode('nx-txt00001'),
  },
}

beforeEach(() => {
  useDocumentStore.setState({
    tree: structuredClone(SEED_TREE),
    selectedId: null,
    isDirty: false,
    past: [],
    future: [],
    _lastCoalesceKey: null,
    _lastCoalesceTime: 0,
  })
})

// ---------------------------------------------------------------------------
// setTree
// ---------------------------------------------------------------------------

describe('setTree', () => {
  it('replaces tree and resets history and dirty flag', () => {
    const newTree: DocumentTree = {
      rootId: 'nx-newroot0',
      nodes: { 'nx-newroot0': mkNode('nx-newroot0') },
    }
    useDocumentStore.getState().setTree(newTree)
    const s = useDocumentStore.getState()
    expect(s.tree?.rootId).toBe('nx-newroot0')
    expect(s.isDirty).toBe(false)
    expect(s.past).toHaveLength(0)
    expect(s.future).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------
// selectNode
// ---------------------------------------------------------------------------

describe('selectNode', () => {
  it('sets selectedId', () => {
    useDocumentStore.getState().selectNode('nx-sec00001')
    expect(useDocumentStore.getState().selectedId).toBe('nx-sec00001')
  })

  it('clears selectedId when passed null', () => {
    useDocumentStore.setState({ selectedId: 'nx-sec00001' })
    useDocumentStore.getState().selectNode(null)
    expect(useDocumentStore.getState().selectedId).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// insertNode
// ---------------------------------------------------------------------------

describe('insertNode', () => {
  it('adds node to tree and marks dirty', () => {
    const newNode = mkNode(generateId())
    useDocumentStore.getState().insertNode(newNode, 'nx-sec00001')
    const { tree, isDirty } = useDocumentStore.getState()
    expect(tree!.nodes[newNode.id]).toBeDefined()
    expect(tree!.nodes['nx-sec00001']!.children).toContain(newNode.id)
    expect(isDirty).toBe(true)
  })

  it('inserts at a specific index', () => {
    const newNode = mkNode(generateId())
    useDocumentStore.getState().insertNode(newNode, 'nx-root0001', 0)
    const children = useDocumentStore.getState().tree!.nodes['nx-root0001']!.children
    expect(children[0]).toBe(newNode.id)
  })

  it('pushes to history', () => {
    useDocumentStore.getState().insertNode(mkNode(generateId()), 'nx-sec00001')
    expect(useDocumentStore.getState().past).toHaveLength(1)
  })
})

// ---------------------------------------------------------------------------
// removeNode
// ---------------------------------------------------------------------------

describe('removeNode', () => {
  it('removes node and descendants from tree', () => {
    useDocumentStore.getState().removeNode('nx-sec00001')
    const { tree } = useDocumentStore.getState()
    expect(tree!.nodes['nx-sec00001']).toBeUndefined()
    expect(tree!.nodes['nx-txt00001']).toBeUndefined()
  })

  it('removes node from its parent children list', () => {
    useDocumentStore.getState().removeNode('nx-sec00001')
    const children = useDocumentStore.getState().tree!.nodes['nx-root0001']!.children
    expect(children).not.toContain('nx-sec00001')
  })

  it('clears selectedId when the selected node is removed', () => {
    useDocumentStore.setState({ selectedId: 'nx-sec00001' })
    useDocumentStore.getState().removeNode('nx-sec00001')
    expect(useDocumentStore.getState().selectedId).toBeNull()
  })

  it('pushes to history', () => {
    useDocumentStore.getState().removeNode('nx-sec00001')
    expect(useDocumentStore.getState().past).toHaveLength(1)
  })
})

// ---------------------------------------------------------------------------
// moveNode
// ---------------------------------------------------------------------------

describe('moveNode', () => {
  it('moves a node to a new parent', () => {
    // Add a second section to move into
    const sec2 = mkNode('nx-sec00002')
    useDocumentStore.getState().insertNode(sec2, 'nx-root0001')

    const result = useDocumentStore.getState().moveNode('nx-txt00001', 'nx-sec00002', 0)
    expect(result).toBe(true)

    const { tree } = useDocumentStore.getState()
    expect(tree!.nodes['nx-sec00002']!.children).toContain('nx-txt00001')
    expect(tree!.nodes['nx-sec00001']!.children).not.toContain('nx-txt00001')
  })

  it('returns false when moving a node into its own descendant', () => {
    const result = useDocumentStore.getState().moveNode('nx-root0001', 'nx-sec00001', 0)
    expect(result).toBe(false)
  })

  it('returns false when moving the root', () => {
    const result = useDocumentStore.getState().moveNode('nx-root0001', 'nx-sec00001', 0)
    expect(result).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// updateProps
// ---------------------------------------------------------------------------

describe('updateProps', () => {
  it('merges props into node.props at base breakpoint', () => {
    useDocumentStore.getState().updateProps('nx-sec00001', { background: '#fff' })
    const node = useDocumentStore.getState().tree!.nodes['nx-sec00001']!
    expect(node.props['background']).toBe('#fff')
  })

  it('merges props into node.overrides at a given breakpoint', () => {
    useDocumentStore.getState().updateProps('nx-sec00001', { fontSize: 12 }, 'mobile')
    const node = useDocumentStore.getState().tree!.nodes['nx-sec00001']!
    expect(node.overrides.mobile?.['fontSize']).toBe(12)
  })

  it('does not overwrite other props when merging', () => {
    useDocumentStore.getState().updateProps('nx-sec00001', { color: 'red' })
    useDocumentStore.getState().updateProps('nx-sec00001', { background: 'blue' })
    const node = useDocumentStore.getState().tree!.nodes['nx-sec00001']!
    expect(node.props['color']).toBe('red')
    expect(node.props['background']).toBe('blue')
  })

  it('marks dirty', () => {
    useDocumentStore.getState().updateProps('nx-sec00001', { color: 'red' })
    expect(useDocumentStore.getState().isDirty).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// duplicateNode
// ---------------------------------------------------------------------------

describe('duplicateNode', () => {
  it('returns a new node ID', () => {
    const newId = useDocumentStore.getState().duplicateNode('nx-sec00001')
    expect(newId).toBeTruthy()
    expect(newId).not.toBe('nx-sec00001')
  })

  it('inserts duplicate adjacent to original in parent', () => {
    const newId = useDocumentStore.getState().duplicateNode('nx-sec00001')!
    const children = useDocumentStore.getState().tree!.nodes['nx-root0001']!.children
    const origIdx = children.indexOf('nx-sec00001')
    const newIdx = children.indexOf(newId)
    expect(newIdx).toBe(origIdx + 1)
  })

  it('deep-clones the subtree (text child is also duplicated)', () => {
    const newId = useDocumentStore.getState().duplicateNode('nx-sec00001')!
    const { tree } = useDocumentStore.getState()
    const dupSec = tree!.nodes[newId]!
    expect(dupSec.children).toHaveLength(1)
    const dupChildId = dupSec.children[0]!
    expect(tree!.nodes[dupChildId]).toBeDefined()
    expect(dupChildId).not.toBe('nx-txt00001')
  })

  it('returns null when duplicating root', () => {
    expect(useDocumentStore.getState().duplicateNode('nx-root0001')).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// markClean
// ---------------------------------------------------------------------------

describe('markClean', () => {
  it('sets isDirty to false', () => {
    useDocumentStore.setState({ isDirty: true })
    useDocumentStore.getState().markClean()
    expect(useDocumentStore.getState().isDirty).toBe(false)
  })
})
