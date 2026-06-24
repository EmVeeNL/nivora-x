import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useDocumentStore } from '@/document/store'
import { generateId } from '@/document/ids'
import type { DocumentTree, NxNode } from '@/document/schema/types'

const mkNode = (id: string, children: string[] = []): NxNode => ({
  id,
  type: 'section',
  props: {},
  children,
  overrides: {},
  meta: {},
})

const SEED: DocumentTree = {
  rootId: 'nx-root0001',
  nodes: {
    'nx-root0001': mkNode('nx-root0001', ['nx-sec00001']),
    'nx-sec00001': mkNode('nx-sec00001'),
  },
}

beforeEach(() => {
  vi.useFakeTimers()
  useDocumentStore.setState({
    tree: structuredClone(SEED),
    selectedId: null,
    isDirty: false,
    past: [],
    future: [],
    _lastCoalesceKey: null,
    _lastCoalesceTime: 0,
  })
})

afterEach(() => {
  vi.useRealTimers()
})

// ---------------------------------------------------------------------------
// Basic undo/redo
// ---------------------------------------------------------------------------

describe('undo', () => {
  it('reverts the last mutation', () => {
    const node = mkNode(generateId())
    useDocumentStore.getState().insertNode(node, 'nx-sec00001')
    expect(useDocumentStore.getState().tree!.nodes[node.id]).toBeDefined()

    useDocumentStore.getState().undo()
    expect(useDocumentStore.getState().tree!.nodes[node.id]).toBeUndefined()
  })

  it('is a no-op when history is empty', () => {
    const treeBefore = useDocumentStore.getState().tree
    useDocumentStore.getState().undo()
    expect(useDocumentStore.getState().tree).toEqual(treeBefore)
  })

  it('reverts mutations in reverse order', () => {
    const n1 = mkNode(generateId())
    const n2 = mkNode(generateId())
    useDocumentStore.getState().insertNode(n1, 'nx-sec00001')
    useDocumentStore.getState().insertNode(n2, 'nx-sec00001')

    useDocumentStore.getState().undo()
    expect(useDocumentStore.getState().tree!.nodes[n2.id]).toBeUndefined()
    expect(useDocumentStore.getState().tree!.nodes[n1.id]).toBeDefined()

    useDocumentStore.getState().undo()
    expect(useDocumentStore.getState().tree!.nodes[n1.id]).toBeUndefined()
  })
})

describe('redo', () => {
  it('replays an undone mutation', () => {
    const node = mkNode(generateId())
    useDocumentStore.getState().insertNode(node, 'nx-sec00001')
    useDocumentStore.getState().undo()
    expect(useDocumentStore.getState().tree!.nodes[node.id]).toBeUndefined()

    useDocumentStore.getState().redo()
    expect(useDocumentStore.getState().tree!.nodes[node.id]).toBeDefined()
  })

  it('is a no-op when future stack is empty', () => {
    const treeBefore = useDocumentStore.getState().tree
    useDocumentStore.getState().redo()
    expect(useDocumentStore.getState().tree).toEqual(treeBefore)
  })

  it('clears redo stack when a new mutation is applied after undo', () => {
    const n1 = mkNode(generateId())
    const n2 = mkNode(generateId())
    useDocumentStore.getState().insertNode(n1, 'nx-sec00001')
    useDocumentStore.getState().undo()
    expect(useDocumentStore.getState().future).toHaveLength(1)

    // New mutation after undo → redo stack clears
    useDocumentStore.getState().insertNode(n2, 'nx-sec00001')
    expect(useDocumentStore.getState().future).toHaveLength(0)

    // Cannot redo the old undo anymore
    useDocumentStore.getState().redo()
    expect(useDocumentStore.getState().tree!.nodes[n1.id]).toBeUndefined()
  })
})

// ---------------------------------------------------------------------------
// History cap
// ---------------------------------------------------------------------------

describe('history cap (50 entries)', () => {
  it('keeps at most 50 past entries', () => {
    for (let i = 0; i < 60; i++) {
      useDocumentStore.getState().insertNode(mkNode(generateId()), 'nx-sec00001')
    }
    expect(useDocumentStore.getState().past.length).toBeLessThanOrEqual(50)
  })
})

// ---------------------------------------------------------------------------
// Coalescing
// ---------------------------------------------------------------------------

describe('coalescing', () => {
  it('merges rapid same-key edits into one history entry', () => {
    const KEY = 'fontSize-sec00001'
    // 5 rapid updates with the same key — should produce only 1 history entry
    useDocumentStore.getState().updateProps('nx-sec00001', { fontSize: 14 }, undefined, KEY)
    vi.advanceTimersByTime(100)
    useDocumentStore.getState().updateProps('nx-sec00001', { fontSize: 15 }, undefined, KEY)
    vi.advanceTimersByTime(100)
    useDocumentStore.getState().updateProps('nx-sec00001', { fontSize: 16 }, undefined, KEY)
    vi.advanceTimersByTime(100)
    useDocumentStore.getState().updateProps('nx-sec00001', { fontSize: 17 }, undefined, KEY)
    vi.advanceTimersByTime(100)
    useDocumentStore.getState().updateProps('nx-sec00001', { fontSize: 18 }, undefined, KEY)

    expect(useDocumentStore.getState().past).toHaveLength(1)
  })

  it('does not coalesce edits separated by more than COALESCE_MS', () => {
    const KEY = 'fontSize-sec00001'
    useDocumentStore.getState().updateProps('nx-sec00001', { fontSize: 14 }, undefined, KEY)
    vi.advanceTimersByTime(600) // past the 500ms window
    useDocumentStore.getState().updateProps('nx-sec00001', { fontSize: 18 }, undefined, KEY)

    expect(useDocumentStore.getState().past).toHaveLength(2)
  })

  it('does not coalesce edits with different keys', () => {
    useDocumentStore.getState().updateProps('nx-sec00001', { fontSize: 14 }, undefined, 'key-a')
    vi.advanceTimersByTime(100)
    useDocumentStore.getState().updateProps('nx-sec00001', { color: 'red' }, undefined, 'key-b')

    expect(useDocumentStore.getState().past).toHaveLength(2)
  })

  it('undoing a coalesced run reverts to the pre-coalesce state in one step', () => {
    const beforeFontSize = useDocumentStore.getState().tree!.nodes['nx-sec00001']!.props['fontSize']
    const KEY = 'fontSize-sec00001'
    useDocumentStore.getState().updateProps('nx-sec00001', { fontSize: 10 }, undefined, KEY)
    vi.advanceTimersByTime(100)
    useDocumentStore.getState().updateProps('nx-sec00001', { fontSize: 20 }, undefined, KEY)

    useDocumentStore.getState().undo()
    const fontSize = useDocumentStore.getState().tree!.nodes['nx-sec00001']!.props['fontSize']
    expect(fontSize).toBe(beforeFontSize)
  })
})
