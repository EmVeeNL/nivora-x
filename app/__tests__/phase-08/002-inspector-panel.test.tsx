import { describe, it, expect, beforeEach } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { InspectorPanel } from '@/inspector/InspectorPanel'
import { useDocumentStore } from '@/document/store'
import { useUiStore } from '@/state/uiStore'
import { registerElement, _clearRegistry } from '@/elements/registry'
import { headingDefinition } from '@/elements/definitions/heading'
import type { DocumentTree } from '@/document/schema/types'

function tree(locked = false): DocumentTree {
  return {
    rootId: 'root',
    nodes: {
      root: {
        id: 'root',
        type: '__root__',
        props: {},
        children: ['heading'],
        overrides: {},
        meta: {},
      },
      heading: {
        id: 'heading',
        type: 'heading',
        props: { text: 'Hello', level: 2 },
        children: [],
        overrides: {},
        meta: locked ? { locked: true } : {},
      },
    },
  }
}

beforeEach(() => {
  _clearRegistry()
  registerElement(headingDefinition)
  useDocumentStore.setState({
    tree: tree(),
    documentMeta: { title: 'Home' },
    selectedId: 'heading',
    isDirty: false,
    past: [],
    future: [],
    _lastCoalesceKey: null,
    _lastCoalesceTime: 0,
  })
  useUiStore.setState({
    activeInspectorTab: 'block',
    openSections: { 'heading-content': true, typography: true },
  })
})

describe('InspectorPanel', () => {
  it('renders Page, Settings, and Style tabs', () => {
    render(<InspectorPanel />)
    expect(screen.getByRole('tab', { name: 'Page' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Settings' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Style' })).toBeInTheDocument()
  })

  it('shows selected element block controls', () => {
    render(<InspectorPanel />)
    expect(screen.getByLabelText('Text')).toHaveValue('Hello')
    expect(screen.getByLabelText('Level')).toBeInTheDocument()
  })

  it('shows empty state without a selection', () => {
    useDocumentStore.setState({ selectedId: null })
    render(<InspectorPanel />)
    expect(screen.getByText(/Select an element to edit settings controls/i)).toBeInTheDocument()
  })

  it('disables controls for locked nodes', () => {
    useDocumentStore.setState({ tree: tree(true) })
    render(<InspectorPanel />)
    expect(screen.getByLabelText('Text')).toBeDisabled()
    expect(screen.getByText(/This element is locked/i)).toBeInTheDocument()
  })

  it('page tab edits document metadata independently of selection', async () => {
    render(<InspectorPanel />)
    await userEvent.click(screen.getByRole('tab', { name: 'Page' }))
    await userEvent.clear(screen.getByLabelText('Page title'))
    await userEvent.type(screen.getByLabelText('Page title'), 'About')
    expect(useDocumentStore.getState().documentMeta['title']).toBe('About')
  })

  it('inspector style controls write to the responsive base slot', async () => {
    render(<InspectorPanel />)
    await userEvent.click(screen.getByRole('tab', { name: 'Style' }))

    fireEvent.change(screen.getByLabelText('Font Size'), { target: { value: '32' } })

    expect(useDocumentStore.getState().tree!.nodes['heading']!.props['fontSize']).toEqual({
      base: { value: 32, unit: 'px' },
    })
  })
})
