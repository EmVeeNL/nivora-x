import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { DndProvider } from '@/canvas/dnd/DndProvider'
import { EditorLayout } from '@/shell/EditorLayout'
import { useUiStore } from '@/state/uiStore'
import { useDocumentStore } from '@/document/store'
import { registerElement, _clearRegistry } from '@/elements/registry'
import { sectionDefinition } from '@/elements/definitions/section'
import type { DocumentTree } from '@/document/schema/types'
import '@/lib/icons'

function renderLayout() {
  return render(
    <DndProvider>
      <EditorLayout />
    </DndProvider>,
  )
}

function tree(): DocumentTree {
  return {
    rootId: 'root',
    nodes: {
      root: {
        id: 'root',
        type: '__root__',
        props: {},
        children: ['section'],
        overrides: {},
        meta: {},
      },
      section: {
        id: 'section',
        type: 'section',
        props: { htmlId: 'hero' },
        children: [],
        overrides: {},
        meta: { name: 'Hero Section' },
      },
    },
  }
}

beforeEach(() => {
  _clearRegistry()
  registerElement(sectionDefinition)

  useUiStore.setState({
    activeLeftPanel: 'navigator',
    rightPanelOpen: true,
    previewMode: false,
    activeBreakpoint: 'tablet',
    showElementBorders: true,
    hoveredId: null,
    pendingDelete: null,
    pendingInsert: null,
  })

  useDocumentStore.setState({
    tree: tree(),
    documentMeta: { title: 'Home' },
    selectedId: 'section',
    isDirty: false,
    past: [],
    future: [],
    _lastCoalesceKey: null,
    _lastCoalesceTime: 0,
  })
})

describe('Preview mode', () => {
  it('hides editor chrome and renders a clean preview shell', () => {
    useUiStore.setState({ previewMode: true })
    renderLayout()

    expect(screen.getByTestId('preview-mode')).toBeInTheDocument()
    expect(screen.queryByTestId('region-toolbar')).not.toBeInTheDocument()
    expect(screen.queryByTestId('region-activity-bar')).not.toBeInTheDocument()
    expect(screen.queryByTestId('region-left')).not.toBeInTheDocument()
    expect(screen.queryByTestId('region-right')).not.toBeInTheDocument()
    expect(screen.queryByTestId('region-breadcrumb')).not.toBeInTheDocument()
    expect(screen.queryByTestId('canvas-breakpoint-label')).not.toBeInTheDocument()
    expect(screen.queryByTestId('overlay-selection')).not.toBeInTheDocument()
    expect(screen.queryByTestId('element-border')).not.toBeInTheDocument()
    expect(screen.queryByTestId('canvas-drop-overlay')).not.toBeInTheDocument()
  })

  it('shows the active breakpoint width in preview mode', () => {
    useUiStore.setState({ previewMode: true })
    renderLayout()

    expect(screen.getByTestId('preview-breakpoint-label')).toHaveTextContent('Tablet')
    expect(screen.getByTestId('preview-breakpoint-label')).toHaveTextContent('768')
    expect(screen.getByTestId('canvas-iframe')).toHaveStyle({ width: '768px' })
  })

  it('exits preview and restores the editor shell with state intact', async () => {
    useUiStore.setState({ previewMode: true, activeLeftPanel: null, rightPanelOpen: false })
    renderLayout()

    await userEvent.click(screen.getByRole('button', { name: 'Exit preview' }))

    expect(screen.getByTestId('region-toolbar')).toBeInTheDocument()
    expect(useUiStore.getState().activeLeftPanel).toBeNull()
    expect(useUiStore.getState().rightPanelOpen).toBe(false)
    expect(useDocumentStore.getState().selectedId).toBe('section')
  })

  it('is read-only and does not change selection on canvas click', async () => {
    useUiStore.setState({ previewMode: true })
    useDocumentStore.setState({ selectedId: null })
    renderLayout()

    const iframe = screen.getByTestId('canvas-iframe')
    if (!(iframe instanceof HTMLIFrameElement)) {
      throw new Error('Expected canvas iframe')
    }
    await waitFor(() => {
      expect(iframe.contentDocument?.querySelector('[data-node-id="section"]')).toBeTruthy()
    })

    const section = iframe.contentDocument?.querySelector('[data-node-id="section"]') as HTMLElement
    await userEvent.click(section)

    expect(useDocumentStore.getState().selectedId).toBeNull()
  })
})
