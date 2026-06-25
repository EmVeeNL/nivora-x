import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { _clearRegistry } from '@/elements/registry'
import { registerStarterElements } from '@/elements/definitions'
import { useDocumentStore } from '@/document/store'
import { CanvasRenderer } from '@/canvas/CanvasRenderer'
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

const SECTION_TREE: DocumentTree = {
  rootId: 'nx-root00001',
  nodes: {
    'nx-root00001': mkNode('nx-root00001', 'body', { children: ['nx-sec000001'] }),
    'nx-sec000001': mkNode('nx-sec000001', 'section', { children: ['nx-con000001'] }),
    'nx-con000001': mkNode('nx-con000001', 'container', { children: ['nx-h1000001'] }),
    'nx-h1000001': mkNode('nx-h1000001', 'heading', { props: { text: 'Hello Canvas', level: 1 } }),
  },
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
// Empty state
// ---------------------------------------------------------------------------

describe('CanvasRenderer — empty state', () => {
  it('shows empty state when tree is null', () => {
    render(<CanvasRenderer />)
    expect(screen.getByTestId('canvas-empty-state')).toBeInTheDocument()
  })

  it('shows empty state when root has no children', () => {
    useDocumentStore.setState({
      tree: {
        rootId: 'nx-root00001',
        nodes: { 'nx-root00001': mkNode('nx-root00001', 'body') },
      },
    })
    render(<CanvasRenderer />)
    expect(screen.getByTestId('canvas-empty-state')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Tree rendering
// ---------------------------------------------------------------------------

describe('CanvasRenderer — tree rendering', () => {
  it('renders nested Section → Container → Heading into the DOM', () => {
    useDocumentStore.setState({ tree: SECTION_TREE })
    render(<CanvasRenderer />)
    expect(screen.getByText('Hello Canvas')).toBeInTheDocument()
  })

  it('places data-node-id on rendered elements', () => {
    useDocumentStore.setState({ tree: SECTION_TREE })
    const { container } = render(<CanvasRenderer />)
    expect(container.querySelector('[data-node-id="nx-sec000001"]')).toBeTruthy()
    expect(container.querySelector('[data-node-id="nx-h1000001"]')).toBeTruthy()
  })

  it('renders a safe placeholder for unknown element types', () => {
    useDocumentStore.setState({
      tree: {
        rootId: 'nx-root00001',
        nodes: {
          'nx-root00001': mkNode('nx-root00001', 'body', { children: ['nx-mystery001'] }),
          'nx-mystery001': mkNode('nx-mystery001', 'mystery-widget'),
        },
      },
    })
    render(<CanvasRenderer />)
    expect(screen.getByText(/Unknown element: mystery-widget/)).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Reactivity
// ---------------------------------------------------------------------------

describe('CanvasRenderer — store reactivity', () => {
  it('re-renders when the tree changes', () => {
    useDocumentStore.setState({ tree: SECTION_TREE })
    render(<CanvasRenderer />)
    expect(screen.getByText('Hello Canvas')).toBeInTheDocument()

    // Update the heading text via the store
    act(() => {
      useDocumentStore.getState().updateProps('nx-h1000001', { text: 'Updated!' })
    })
    expect(screen.getByText('Updated!')).toBeInTheDocument()
  })

  it('shows empty state after tree is set to null', () => {
    useDocumentStore.setState({ tree: SECTION_TREE })
    render(<CanvasRenderer />)
    expect(screen.queryByTestId('canvas-empty-state')).not.toBeInTheDocument()

    act(() => {
      useDocumentStore.setState({ tree: null })
    })
    expect(screen.getByTestId('canvas-empty-state')).toBeInTheDocument()
  })
})
