import { describe, it, expect, beforeEach } from 'vitest'
import { registerElement, _clearRegistry } from '@/elements/registry'
import type { ElementDefinition, ElementRenderProps } from '@/elements/types'
import { useDocumentStore } from '@/document/store'
import type { DocumentTree } from '@/document/schema/types'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const NoopRender = (_props: ElementRenderProps) => null

const mkDef = (type: string, acceptsChildren = true): ElementDefinition => ({
  type,
  label: type,
  icon: 'tabler:circle',
  category: 'Test',
  defaultProps: {},
  nesting: { acceptsChildren },
  render: NoopRender,
})

function makeTree(): DocumentTree {
  return {
    rootId: 'root',
    nodes: {
      root: {
        id: 'root',
        type: 'root',
        props: {},
        children: ['a', 'b', 'c'],
        overrides: {},
        meta: {},
      },
      a: { id: 'a', type: 'section', props: {}, children: ['child-a'], overrides: {}, meta: {} },
      b: { id: 'b', type: 'section', props: {}, children: [], overrides: {}, meta: {} },
      c: { id: 'c', type: 'section', props: {}, children: [], overrides: {}, meta: {} },
      'child-a': {
        id: 'child-a',
        type: 'section',
        props: {},
        children: [],
        overrides: {},
        meta: {},
      },
    },
  }
}

beforeEach(() => {
  _clearRegistry()
  registerElement(mkDef('section'))
  useDocumentStore.setState({
    tree: makeTree(),
    selectedId: null,
    isDirty: false,
    past: [],
    future: [],
    _lastCoalesceKey: null,
    _lastCoalesceTime: 0,
  })
})

describe('moveNode via store (Phase 04 op)', () => {
  it('reorders a node among siblings', () => {
    const store = useDocumentStore.getState()
    store.moveNode('c', 'root', 0) // move 'c' to first position
    const children = useDocumentStore.getState().tree!.nodes['root']!.children
    expect(children[0]).toBe('c')
  })

  it('re-nests a node into a different container', () => {
    const store = useDocumentStore.getState()
    store.moveNode('b', 'a', 0) // move 'b' inside 'a'
    const newState = useDocumentStore.getState().tree!
    expect(newState.nodes['a']!.children).toContain('b')
    expect(newState.nodes['root']!.children).not.toContain('b')
  })

  it('rejects moving a node into its own descendant', () => {
    const store = useDocumentStore.getState()
    const result = store.moveNode('a', 'child-a', 0)
    expect(result).toBe(false)
    // 'child-a' should still be inside 'a'
    expect(useDocumentStore.getState().tree!.nodes['a']!.children).toContain('child-a')
  })

  it('move is undoable', () => {
    const store = useDocumentStore.getState()
    store.moveNode('c', 'root', 0)
    const afterMove = useDocumentStore.getState().tree!.nodes['root']!.children
    expect(afterMove[0]).toBe('c')

    store.undo()
    const afterUndo = useDocumentStore.getState().tree!.nodes['root']!.children
    expect(afterUndo[2]).toBe('c') // back to original last position
  })

  it('selection follows the moved node', () => {
    const store = useDocumentStore.getState()
    store.selectNode('b')
    store.moveNode('b', 'a', 0)
    useDocumentStore.getState().selectNode('b')
    expect(useDocumentStore.getState().selectedId).toBe('b')
  })
})
