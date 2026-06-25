import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DndProvider } from '@/canvas/dnd/DndProvider'
import { isHidden, isLocked, canInteract } from '@/document/canInteract'
import { useDocumentStore } from '@/document/store'
import type { DocumentTree, NxNode } from '@/document/schema/types'
import { registerElement, _clearRegistry } from '@/elements/registry'
import type { ElementDefinition } from '@/elements/types'
import { NavigatorPanel } from '@/shell/left/navigator/NavigatorPanel'

const NoopRender = () => null

const node = (meta: NxNode['meta'] = {}): NxNode => ({
  id: 'node',
  type: 'section',
  props: {},
  children: [],
  overrides: {},
  meta,
})

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

function tree(meta: NxNode['meta'] = {}): DocumentTree {
  return {
    rootId: 'root',
    nodes: {
      root: {
        id: 'root',
        type: '__root__',
        props: {},
        children: ['node'],
        overrides: {},
        meta: {},
      },
      node: node(meta),
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

describe('visibility and lock metadata', () => {
  it('exposes shared interaction helpers', () => {
    expect(isHidden(node({ visible: false }))).toBe(true)
    expect(isLocked(node({ locked: true }))).toBe(true)
    expect(canInteract(node())).toBe(true)
    expect(canInteract(node({ visible: false }))).toBe(false)
    expect(canInteract(node({ locked: true }))).toBe(false)
  })

  it('updates metadata through an undoable store action', () => {
    useDocumentStore.getState().updateMeta('node', { visible: false })
    expect(useDocumentStore.getState().tree!.nodes['node']!.meta.visible).toBe(false)
    expect(useDocumentStore.getState().past).toHaveLength(1)

    useDocumentStore.getState().undo()
    expect(useDocumentStore.getState().tree!.nodes['node']!.meta.visible).toBeUndefined()
  })

  it('toggles visibility and lock from the navigator', async () => {
    render(
      <DndProvider>
        <NavigatorPanel />
      </DndProvider>,
    )

    await userEvent.click(screen.getByLabelText('Hide node'))
    expect(useDocumentStore.getState().tree!.nodes['node']!.meta.visible).toBe(false)

    await userEvent.click(screen.getByLabelText('Lock node'))
    expect(useDocumentStore.getState().tree!.nodes['node']!.meta.locked).toBe(true)
  })

  it('does not select hidden nodes from the navigator', async () => {
    useDocumentStore.setState({ tree: tree({ visible: false }) })
    render(
      <DndProvider>
        <NavigatorPanel />
      </DndProvider>,
    )

    await userEvent.click(screen.getByText('Section'))
    expect(useDocumentStore.getState().selectedId).toBeNull()
  })
})
