import { describe, it, expect, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { _clearRegistry, getElementDefinition, hasElement } from '@/elements/registry'
import { registerStarterElements } from '@/elements/definitions'
import { useDocumentStore } from '@/document/store'
import { generateId } from '@/document/ids'
import type { NxNode, DocumentTree } from '@/document/schema/types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mkNode = (id: string, type: string, extra?: Partial<NxNode>): NxNode => ({
  id,
  type,
  props: {},
  children: [],
  overrides: {},
  meta: {},
  ...extra,
})

const mkTree = (nodes: NxNode[]): DocumentTree => {
  const root = nodes[0]!
  return {
    rootId: root.id,
    nodes: Object.fromEntries(nodes.map((n) => [n.id, n])),
  }
}

beforeEach(() => {
  _clearRegistry()
  registerStarterElements()
  useDocumentStore.setState({
    tree: null,
    selectedId: null,
    isDirty: false,
    past: [],
    future: [],
    _lastCoalesceKey: null,
    _lastCoalesceTime: 0,
  })
})

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

describe('starter element registration', () => {
  it('section, container, heading, text are all registered', () => {
    expect(hasElement('section')).toBe(true)
    expect(hasElement('container')).toBe(true)
    expect(hasElement('heading')).toBe(true)
    expect(hasElement('text')).toBe(true)
  })

  it('each definition has a label, icon, and render component', () => {
    for (const type of ['section', 'container', 'heading', 'text']) {
      const def = getElementDefinition(type)
      expect(def.label).toBeTruthy()
      expect(def.icon).toBeTruthy()
      expect(typeof def.render).toBe('function')
    }
  })
})

// ---------------------------------------------------------------------------
// Nesting rules
// ---------------------------------------------------------------------------

describe('nesting rules', () => {
  it('section and container accept children', () => {
    expect(getElementDefinition('section').nesting.acceptsChildren).toBe(true)
    expect(getElementDefinition('container').nesting.acceptsChildren).toBe(true)
  })

  it('heading and text are leaves (no children)', () => {
    expect(getElementDefinition('heading').nesting.acceptsChildren).toBe(false)
    expect(getElementDefinition('text').nesting.acceptsChildren).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Default props
// ---------------------------------------------------------------------------

describe('default props', () => {
  it('heading has text and level defaults', () => {
    const def = getElementDefinition('heading')
    expect(def.defaultProps['text']).toBe('Heading')
    expect(def.defaultProps['level']).toBe(2)
  })

  it('text has text default', () => {
    const def = getElementDefinition('text')
    expect(def.defaultProps['text']).toBe('Text block')
  })
})

// ---------------------------------------------------------------------------
// Store nesting guards
// ---------------------------------------------------------------------------

describe('store nesting guard — insert', () => {
  it('allows inserting a container into a section', () => {
    const rootId = 'nx-root00001'
    const sectionId = generateId()
    const root = mkNode(rootId, 'body', { children: [sectionId] })
    const section = mkNode(sectionId, 'section')
    useDocumentStore.getState().setTree(mkTree([root, section]))

    const container = mkNode(generateId(), 'container')
    useDocumentStore.getState().insertNode(container, sectionId)

    const tree = useDocumentStore.getState().tree!
    expect(tree.nodes[sectionId]!.children).toContain(container.id)
  })

  it('blocks inserting a child node under a heading', () => {
    const rootId = 'nx-root00001'
    const headingId = generateId()
    const root = mkNode(rootId, 'body', { children: [headingId] })
    const heading = mkNode(headingId, 'heading')
    useDocumentStore.getState().setTree(mkTree([root, heading]))

    const child = mkNode(generateId(), 'text')
    useDocumentStore.getState().insertNode(child, headingId)

    const tree = useDocumentStore.getState().tree!
    expect(tree.nodes[headingId]!.children).toHaveLength(0)
  })

  it('blocks inserting a child node under a text element', () => {
    const rootId = 'nx-root00001'
    const textId = generateId()
    const root = mkNode(rootId, 'body', { children: [textId] })
    const textNode = mkNode(textId, 'text')
    useDocumentStore.getState().setTree(mkTree([root, textNode]))

    const child = mkNode(generateId(), 'heading')
    useDocumentStore.getState().insertNode(child, textId)

    const tree = useDocumentStore.getState().tree!
    expect(tree.nodes[textId]!.children).toHaveLength(0)
  })
})

describe('store nesting guard — move', () => {
  it('blocks moving a node into a heading', () => {
    const rootId = 'nx-root00001'
    const sectionId = generateId()
    const headingId = generateId()
    const textId = generateId()
    const root = mkNode(rootId, 'body', { children: [sectionId] })
    const section = mkNode(sectionId, 'section', { children: [headingId, textId] })
    const heading = mkNode(headingId, 'heading')
    const textNode = mkNode(textId, 'text')
    useDocumentStore.getState().setTree(mkTree([root, section, heading, textNode]))

    const moved = useDocumentStore.getState().moveNode(textId, headingId, 0)

    expect(moved).toBe(false)
    const tree = useDocumentStore.getState().tree!
    expect(tree.nodes[headingId]!.children).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------
// Render output
// ---------------------------------------------------------------------------

describe('element render output', () => {
  const node = (type: string, props?: Record<string, unknown>): NxNode => ({
    id: 'nx-test00001',
    type,
    props: props ?? {},
    children: [],
    overrides: {},
    meta: {},
  })

  it('heading renders the text prop as heading content', () => {
    const def = getElementDefinition('heading')
    const Render = def.render
    const { getByText } = render(
      <Render
        node={node('heading', { text: 'My Heading', level: 1 })}
        data-node-id="nx-test00001"
      />,
    )
    expect(getByText('My Heading')).toBeInTheDocument()
  })

  it('text renders the text prop as paragraph content', () => {
    const def = getElementDefinition('text')
    const Render = def.render
    const { getByText } = render(
      <Render node={node('text', { text: 'Hello paragraph' })} data-node-id="nx-test00001" />,
    )
    expect(getByText('Hello paragraph')).toBeInTheDocument()
  })

  it('element roots carry data-node-id attribute', () => {
    const def = getElementDefinition('section')
    const Render = def.render
    const { container } = render(<Render node={node('section')} data-node-id="nx-section001" />)
    expect(container.querySelector('[data-node-id="nx-section001"]')).toBeTruthy()
  })
})
