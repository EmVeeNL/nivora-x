import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { EditorLayout } from '@/shell/EditorLayout'
import { CanvasFrame } from '@/canvas/CanvasFrame'
import { NavigatorPlaceholder } from '@/shell/NavigatorPlaceholder'
import { DndProvider } from '@/canvas/dnd/DndProvider'
import { useUiStore } from '@/state/uiStore'
import { registerLeftPanel, _clearLeftPanelRegistry } from '@/shell/left/leftPanelRegistry'
import { registerElement, _clearRegistry } from '@/elements/registry'
import { sectionDefinition } from '@/elements/definitions/section'
import { useDocumentStore } from '@/document/store'
import type { DocumentTree } from '@/document/schema/types'
import '@/lib/icons'

const renderLayout = () =>
  render(
    <DndProvider>
      <EditorLayout />
    </DndProvider>,
  )
const renderFrame = () =>
  render(
    <DndProvider>
      <CanvasFrame />
    </DndProvider>,
  )

beforeEach(() => {
  _clearLeftPanelRegistry()
  _clearRegistry()
  registerLeftPanel({
    id: 'navigator',
    label: 'Navigator',
    icon: 'tabler:layers-subtract',
    component: NavigatorPlaceholder,
  })
  useUiStore.setState({
    activeLeftPanel: 'navigator',
    rightPanelOpen: true,
    activeBreakpoint: 'desktop',
    activeInspectorTab: 'inspector',
    openSections: {
      layout: true,
      spacing: true,
      size: false,
      typography: false,
      position: false,
      border: false,
      effects: false,
    },
  })
  registerElement(sectionDefinition)
  const tree: DocumentTree = {
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
        props: {},
        children: [],
        overrides: {},
        meta: {},
      },
    },
  }
  useDocumentStore.setState({
    tree,
    documentMeta: {},
    selectedId: 'section',
    isDirty: false,
    past: [],
    future: [],
    _lastCoalesceKey: null,
    _lastCoalesceTime: 0,
  })
})

// ---------------------------------------------------------------------------
// Shell integration — all regions assembled
// ---------------------------------------------------------------------------
describe('EditorLayout — full shell integration', () => {
  it('renders all shell regions simultaneously', () => {
    renderLayout()
    expect(screen.getByTestId('region-toolbar')).toBeInTheDocument()
    expect(screen.getByTestId('region-activity-bar')).toBeInTheDocument()
    expect(screen.getByTestId('region-left')).toBeInTheDocument()
    expect(screen.getByTestId('region-canvas')).toBeInTheDocument()
    expect(screen.getByTestId('region-right')).toBeInTheDocument()
    expect(screen.getByTestId('region-breadcrumb')).toBeInTheDocument()
  })

  it('activity bar navigator button collapses left panel and canvas persists', () => {
    renderLayout()
    fireEvent.click(screen.getByRole('button', { name: /navigator/i }))
    expect(useUiStore.getState().activeLeftPanel).toBeNull()
    expect(screen.getByTestId('region-canvas')).toBeInTheDocument()
  })

  it('right panel toggle and canvas coexist', () => {
    renderLayout()
    fireEvent.click(screen.getByRole('button', { name: /collapse inspector/i }))
    expect(useUiStore.getState().rightPanelOpen).toBe(false)
    expect(screen.getByTestId('region-canvas')).toBeInTheDocument()
  })

  it('breakpoint buttons are reachable in the toolbar region', () => {
    renderLayout()
    const toolbar = screen.getByTestId('region-toolbar')
    expect(toolbar.querySelector('[aria-label="Tablet"]')).toBeTruthy()
  })

  it('breadcrumb is in the footer region', () => {
    renderLayout()
    const footer = screen.getByTestId('region-breadcrumb')
    expect(footer.querySelector('nav')).toBeTruthy()
  })
})

// ---------------------------------------------------------------------------
// CanvasFrame — breakpoint label
// ---------------------------------------------------------------------------
describe('CanvasFrame breakpoint label', () => {
  it('shows "Desktop" label by default', () => {
    renderFrame()
    expect(screen.getByTestId('canvas-breakpoint-label').textContent).toContain('Desktop')
  })

  it('shows the desktop pixel width in the label', () => {
    renderFrame()
    expect(screen.getByTestId('canvas-breakpoint-label').textContent).toContain('1440')
  })

  it('updates label when breakpoint changes to tablet', () => {
    useUiStore.setState({ activeBreakpoint: 'tablet' })
    renderFrame()
    const label = screen.getByTestId('canvas-breakpoint-label')
    expect(label.textContent).toContain('Tablet')
    expect(label.textContent).toContain('768')
  })

  it('updates label when breakpoint changes to mobile', () => {
    useUiStore.setState({ activeBreakpoint: 'mobile' })
    renderFrame()
    const label = screen.getByTestId('canvas-breakpoint-label')
    expect(label.textContent).toContain('Mobile')
    expect(label.textContent).toContain('375')
  })

  it('label has aria-live so screen readers announce breakpoint changes', () => {
    renderFrame()
    expect(screen.getByTestId('canvas-breakpoint-label')).toHaveAttribute('aria-live', 'polite')
  })
})

// ---------------------------------------------------------------------------
// NavigatorPlaceholder — element indicators + selected state
// ---------------------------------------------------------------------------
describe('NavigatorPlaceholder — polish', () => {
  it('marks the hero section item as selected', () => {
    render(<NavigatorPlaceholder />)
    const selected = screen
      .getAllByRole('treeitem')
      .find((el) => el.getAttribute('aria-selected') === 'true')
    expect(selected).toBeTruthy()
  })

  it('selected item is the Hero Section', () => {
    render(<NavigatorPlaceholder />)
    const selected = screen
      .getAllByRole('treeitem')
      .find((el) => el.getAttribute('aria-selected') === 'true')
    expect(selected?.textContent).toContain('Hero Section')
  })

  it('non-selected items do not carry aria-selected="true"', () => {
    render(<NavigatorPlaceholder />)
    const items = screen.getAllByRole('treeitem')
    const wronglySelected = items.filter(
      (el) =>
        el.getAttribute('aria-selected') === 'true' &&
        !String(el.textContent).includes('Hero Section'),
    )
    expect(wronglySelected).toHaveLength(0)
  })

  it('renders all layer items including nested ones', () => {
    render(<NavigatorPlaceholder />)
    expect(screen.getByText('Body')).toBeInTheDocument()
    expect(screen.getByText('CTA Button')).toBeInTheDocument()
    expect(screen.getByText('Footer Section')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// RightPanel — layout section uses button-group controls
// ---------------------------------------------------------------------------
describe('RightPanel Layout section controls', () => {
  it('layout section shows Direction control', () => {
    renderLayout()
    expect(screen.getByText('Direction')).toBeInTheDocument()
  })

  it('layout section shows Align control', () => {
    renderLayout()
    expect(screen.getByText('Align')).toBeInTheDocument()
  })

  it('layout section shows Justify control', () => {
    renderLayout()
    expect(screen.getByText('Justify')).toBeInTheDocument()
  })
})
