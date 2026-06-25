import { describe, it, expect, beforeEach } from 'vitest'
import { registerElement, _clearRegistry } from '@/elements/registry'
import type { ElementDefinition, ElementRenderProps } from '@/elements/types'
import { useDocumentStore } from '@/document/store'
import type { DocumentTree } from '@/document/schema/types'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const NoopRender = (_props: ElementRenderProps) => null

const mkDef = (type: string, acceptsChildren = false): ElementDefinition => ({
  type,
  label: type,
  icon: 'tabler:circle',
  category: 'Test',
  defaultProps: { text: `${type} default` },
  nesting: { acceptsChildren },
  render: NoopRender,
})

function makeTree(): DocumentTree {
  return {
    rootId: 'root',
    nodes: {
      root: { id: 'root', type: 'root', props: {}, children: [], overrides: {}, meta: {} },
    },
  }
}

beforeEach(() => {
  _clearRegistry()
  registerElement(mkDef('section', true))
  registerElement(mkDef('text', false))
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

describe('insertNode via store (Phase 04 op)', () => {
  it('inserts a new element with default props at the resolved position', () => {
    const store = useDocumentStore.getState()
    const sectionDef = mkDef('section', true)
    registerElement(sectionDef)

    const node = {
      id: 'nx-test00001',
      type: 'section',
      props: { ...sectionDef.defaultProps },
      children: [],
      overrides: {},
      meta: {},
    }

    store.insertNode(node, 'root', 0)

    const tree = useDocumentStore.getState().tree!
    expect(tree.nodes['nx-test00001']).toBeDefined()
    expect(tree.nodes['root']!.children).toContain('nx-test00001')
    expect(tree.nodes['nx-test00001']!.props['text']).toBe('section default')
  })

  it('insertion is undoable', () => {
    const store = useDocumentStore.getState()
    const node = {
      id: 'nx-test00002',
      type: 'text',
      props: {},
      children: [],
      overrides: {},
      meta: {},
    }

    store.insertNode(node, 'root', 0)
    expect(useDocumentStore.getState().tree!.nodes['nx-test00002']).toBeDefined()

    store.undo()
    expect(useDocumentStore.getState().tree!.nodes['nx-test00002']).toBeUndefined()
  })

  it('refuses to insert into a non-accepting parent', () => {
    const store = useDocumentStore.getState()
    // text does not accept children — inserting into it should be rejected
    const textNode = {
      id: 'nx-textnode1',
      type: 'text',
      props: {},
      children: [],
      overrides: {},
      meta: {},
    }
    store.insertNode(textNode, 'root', 0)

    const childNode = {
      id: 'nx-childnode1',
      type: 'section',
      props: {},
      children: [],
      overrides: {},
      meta: {},
    }
    store.insertNode(childNode, 'nx-textnode1', 0) // should be rejected

    const tree = useDocumentStore.getState().tree!
    expect(tree.nodes['nx-textnode1']!.children).toHaveLength(0)
  })

  it('selection follows the inserted node', () => {
    const store = useDocumentStore.getState()
    const node = {
      id: 'nx-sel00001',
      type: 'section',
      props: {},
      children: [],
      overrides: {},
      meta: {},
    }
    store.insertNode(node, 'root', 0)
    store.selectNode(node.id)
    expect(useDocumentStore.getState().selectedId).toBe('nx-sel00001')
  })
})
