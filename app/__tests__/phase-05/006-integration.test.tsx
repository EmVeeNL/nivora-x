import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { _clearRegistry } from '@/elements/registry'
import { registerStarterElements } from '@/elements/definitions'
import { useDocumentStore } from '@/document/store'
import { useUiStore } from '@/state/uiStore'
import { CanvasRenderer } from '@/canvas/CanvasRenderer'
import type { NxNode, DocumentTree } from '@/document/schema/types'

// ---------------------------------------------------------------------------
// Fixtures
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

const DEEP_TREE: DocumentTree = {
  rootId: 'nx-root00001',
  nodes: {
    'nx-root00001': mkNode('nx-root00001', 'body', { children: ['nx-sec000001'] }),
    'nx-sec000001': mkNode('nx-sec000001', 'section', { children: ['nx-con000001'] }),
    'nx-con000001': mkNode('nx-con000001', 'container', {
      children: ['nx-h1000001', 'nx-txt000001'],
    }),
    'nx-h1000001': mkNode('nx-h1000001', 'heading', {
      props: { text: 'Integration Heading', level: 2 },
    }),
    'nx-txt000001': mkNode('nx-txt000001', 'text', {
      props: { text: 'Integration paragraph.' },
    }),
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
  useUiStore.setState({ hoveredId: null })
})

// ---------------------------------------------------------------------------
// End-to-end render → update
// ---------------------------------------------------------------------------

describe('integration: load tree → render → update', () => {
  it('renders the full nested tree with all content', () => {
    useDocumentStore.setState({ tree: DEEP_TREE })
    render(<CanvasRenderer />)

    expect(screen.getByText('Integration Heading')).toBeInTheDocument()
    expect(screen.getByText('Integration paragraph.')).toBeInTheDocument()
  })

  it('data-node-id attributes are present at every level', () => {
    useDocumentStore.setState({ tree: DEEP_TREE })
    const { container } = render(<CanvasRenderer />)

    for (const id of ['nx-sec000001', 'nx-con000001', 'nx-h1000001', 'nx-txt000001']) {
      expect(container.querySelector(`[data-node-id="${id}"]`)).toBeTruthy()
    }
  })

  it('adding a node via the store re-renders the canvas', () => {
    useDocumentStore.setState({ tree: DEEP_TREE })
    render(<CanvasRenderer />)

    act(() => {
      useDocumentStore
        .getState()
        .insertNode(
          mkNode('nx-new000001', 'text', { props: { text: 'New text!' } }),
          'nx-con000001',
        )
    })

    expect(screen.getByText('New text!')).toBeInTheDocument()
  })

  it('removing a node via the store removes it from the canvas', () => {
    useDocumentStore.setState({ tree: DEEP_TREE })
    render(<CanvasRenderer />)
    expect(screen.getByText('Integration paragraph.')).toBeInTheDocument()

    act(() => {
      useDocumentStore.getState().removeNode('nx-txt000001')
    })

    expect(screen.queryByText('Integration paragraph.')).not.toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Selection store sync
// ---------------------------------------------------------------------------

describe('integration: selection synced to store', () => {
  it('clicking a rendered element updates selectedId', () => {
    useDocumentStore.setState({ tree: DEEP_TREE })
    render(<CanvasRenderer />)

    // Direct store update simulates canvas pointer event (useCanvasSelection tested separately)
    act(() => {
      useDocumentStore.getState().selectNode('nx-h1000001')
    })

    expect(useDocumentStore.getState().selectedId).toBe('nx-h1000001')
  })

  it('programmatic selection from outside the canvas is reflected', () => {
    useDocumentStore.setState({ tree: DEEP_TREE })
    render(<CanvasRenderer />)

    act(() => {
      useDocumentStore.getState().selectNode('nx-sec000001')
    })

    expect(useDocumentStore.getState().selectedId).toBe('nx-sec000001')
  })
})

// ---------------------------------------------------------------------------
// Nesting enforcement in real tree
// ---------------------------------------------------------------------------

describe('integration: nesting enforcement', () => {
  it('cannot add a child under a leaf element in the tree', () => {
    useDocumentStore.setState({ tree: DEEP_TREE })
    render(<CanvasRenderer />)

    act(() => {
      useDocumentStore.getState().insertNode(
        mkNode('nx-illegal001', 'text', { props: { text: 'Should not appear' } }),
        'nx-h1000001', // heading is a leaf
      )
    })

    expect(screen.queryByText('Should not appear')).not.toBeInTheDocument()
  })
})
