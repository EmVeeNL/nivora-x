import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DndProvider } from '@/canvas/dnd/DndProvider'
import { useDocumentStore } from '@/document/store'
import type { DocumentTree } from '@/document/schema/types'
import { registerElement, _clearRegistry } from '@/elements/registry'
import type { ElementDefinition } from '@/elements/types'
import { NavigatorPanel } from '@/shell/left/navigator/NavigatorPanel'

const NoopRender = () => null

function def(): ElementDefinition {
  return {
    type: 'section',
    label: 'Section',
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
      b: {
        id: 'b',
        type: 'section',
        props: {},
        children: [],
        overrides: {},
        meta: { name: 'Nested' },
      },
    },
  }
}

beforeEach(() => {
  _clearRegistry()
  registerElement(def())
  useDocumentStore.setState({
    tree: tree(),
    selectedId: null,
    isDirty: false,
    past: [],
    future: [],
    _lastCoalesceKey: null,
    _lastCoalesceTime: 0,
  })
})

function renderNavigator() {
  return render(
    <DndProvider>
      <NavigatorPanel />
    </DndProvider>,
  )
}

describe('navigator node actions', () => {
  it('renames a node through updateMeta', async () => {
    renderNavigator()
    await userEvent.dblClick(screen.getByText('Hero'))
    const input = screen.getByDisplayValue('Hero')
    await userEvent.clear(input)
    await userEvent.type(input, 'Intro{Enter}')

    expect(useDocumentStore.getState().tree!.nodes['a']!.meta.name).toBe('Intro')
  })

  it('duplicates a node subtree adjacent to the original', async () => {
    renderNavigator()
    await userEvent.click(screen.getAllByLabelText('Duplicate node')[0]!)

    const state = useDocumentStore.getState()
    const rootChildren = state.tree!.nodes['root']!.children
    expect(rootChildren).toHaveLength(2)
    const duplicateId = rootChildren[1]!
    expect(duplicateId).not.toBe('a')
    expect(state.tree!.nodes[duplicateId]!.children).toHaveLength(1)
    expect(state.selectedId).toBe(duplicateId)
  })

  it('deletes a node subtree and clears descendant selection', async () => {
    useDocumentStore.setState({ selectedId: 'b' })
    renderNavigator()
    await userEvent.click(screen.getAllByLabelText('Delete node')[0]!)

    const state = useDocumentStore.getState()
    expect(state.tree!.nodes['a']).toBeUndefined()
    expect(state.tree!.nodes['b']).toBeUndefined()
    expect(state.selectedId).toBeNull()
  })

  it('does not duplicate or delete locked nodes', async () => {
    const locked = tree()
    locked.nodes['a'] = { ...locked.nodes['a']!, meta: { name: 'Hero', locked: true } }
    useDocumentStore.setState({ tree: locked })
    renderNavigator()

    await userEvent.click(screen.getAllByLabelText('Duplicate node')[0]!)
    await userEvent.click(screen.getAllByLabelText('Delete node')[0]!)

    expect(useDocumentStore.getState().tree!.nodes['a']).toBeDefined()
    expect(useDocumentStore.getState().tree!.nodes['root']!.children).toEqual(['a'])
  })
})
