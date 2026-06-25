import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DndProvider } from '@/canvas/dnd/DndProvider'
import { useDocumentStore } from '@/document/store'
import type { DocumentTree } from '@/document/schema/types'
import { registerElement, _clearRegistry } from '@/elements/registry'
import type { ElementDefinition } from '@/elements/types'
import { useUiStore } from '@/state/uiStore'
import { NavigatorPanel } from '@/shell/left/navigator/NavigatorPanel'

const NoopRender = () => null

function def(type: string): ElementDefinition {
  return {
    type,
    label: type,
    icon: 'tabler:section',
    category: 'Test',
    defaultProps: {},
    nesting: { acceptsChildren: true },
    render: NoopRender,
  }
}

function tree(): DocumentTree {
  return {
    rootId: 'root',
    nodes: {
      root: { id: 'root', type: '__root__', props: {}, children: ['a'], overrides: {}, meta: {} },
      a: {
        id: 'a',
        type: 'section',
        props: {},
        children: ['b'],
        overrides: {},
        meta: { name: 'Hero' },
      },
      b: { id: 'b', type: 'section', props: {}, children: [], overrides: {}, meta: {} },
    },
  }
}

function renderNavigator() {
  return render(
    <DndProvider>
      <NavigatorPanel />
    </DndProvider>,
  )
}

beforeEach(() => {
  _clearRegistry()
  registerElement(def('section'))
  useDocumentStore.setState({
    tree: tree(),
    selectedId: null,
    isDirty: false,
    past: [],
    future: [],
    _lastCoalesceKey: null,
    _lastCoalesceTime: 0,
  })
  useUiStore.setState({ navigatorCollapsed: {}, hoveredId: null })
})

describe('NavigatorPanel', () => {
  it('renders the live document tree', () => {
    renderNavigator()
    expect(screen.getByText('Hero')).toBeInTheDocument()
    expect(screen.getByText('section')).toBeInTheDocument()
  })

  it('selects an interactable node from the tree', async () => {
    renderNavigator()
    await userEvent.click(screen.getByText('Hero'))
    expect(useDocumentStore.getState().selectedId).toBe('a')
  })

  it('collapses and expands children through uiStore', async () => {
    renderNavigator()
    await userEvent.click(screen.getByLabelText('Collapse'))
    expect(screen.queryByText('section')).not.toBeInTheDocument()
    expect(useUiStore.getState().navigatorCollapsed['a']).toBe(true)

    await userEvent.click(screen.getByLabelText('Expand'))
    expect(screen.getByText('section')).toBeInTheDocument()
  })

  it('auto-expands ancestors of the selected node', () => {
    useUiStore.setState({ navigatorCollapsed: { a: true } })
    useDocumentStore.setState({ selectedId: 'b' })
    renderNavigator()
    expect(screen.getByText('section')).toBeInTheDocument()
    expect(useUiStore.getState().navigatorCollapsed['a']).toBeUndefined()
  })
})
