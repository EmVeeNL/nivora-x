import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { EditorLayout } from '@/shell/EditorLayout'
import { useUiStore, type Breakpoint } from '@/state/uiStore'

// Reset store to initial values before each test.
beforeEach(() => {
  useUiStore.setState({
    leftPanelOpen: true,
    rightPanelOpen: true,
    activeBreakpoint: 'desktop',
    activeInspectorTab: 'style',
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
})

// ---------------------------------------------------------------------------
// EditorLayout — five regions
// ---------------------------------------------------------------------------
describe('EditorLayout', () => {
  it('renders all five regions', () => {
    render(<EditorLayout />)
    expect(screen.getByTestId('region-toolbar')).toBeInTheDocument()
    expect(screen.getByTestId('region-left')).toBeInTheDocument()
    expect(screen.getByTestId('region-canvas')).toBeInTheDocument()
    expect(screen.getByTestId('region-right')).toBeInTheDocument()
    expect(screen.getByTestId('region-breadcrumb')).toBeInTheDocument()
  })

  it('left panel is open (w-60) by default', () => {
    render(<EditorLayout />)
    expect(screen.getByTestId('region-left').className).toContain('w-60')
  })

  it('right panel is open (w-72) by default', () => {
    render(<EditorLayout />)
    expect(screen.getByTestId('region-right').className).toContain('w-72')
  })

  it('left panel collapses to w-10 (showing re-expand button) when leftPanelOpen is false', () => {
    useUiStore.setState({ leftPanelOpen: false })
    render(<EditorLayout />)
    expect(screen.getByTestId('region-left').className).toContain('w-10')
  })

  it('right panel collapses to w-10 (showing re-expand button) when rightPanelOpen is false', () => {
    useUiStore.setState({ rightPanelOpen: false })
    render(<EditorLayout />)
    expect(screen.getByTestId('region-right').className).toContain('w-10')
  })

  it('canvas region always renders regardless of panel state', () => {
    useUiStore.setState({ leftPanelOpen: false, rightPanelOpen: false })
    render(<EditorLayout />)
    expect(screen.getByTestId('region-canvas')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// uiStore — defaults
// ---------------------------------------------------------------------------
describe('uiStore defaults', () => {
  it('has both panels open', () => {
    const { leftPanelOpen, rightPanelOpen } = useUiStore.getState()
    expect(leftPanelOpen).toBe(true)
    expect(rightPanelOpen).toBe(true)
  })

  it('defaults to desktop breakpoint', () => {
    expect(useUiStore.getState().activeBreakpoint).toBe('desktop')
  })

  it('defaults to style inspector tab', () => {
    expect(useUiStore.getState().activeInspectorTab).toBe('style')
  })

  it('initialises layout and spacing sections as open', () => {
    const { openSections } = useUiStore.getState()
    expect(openSections['layout']).toBe(true)
    expect(openSections['spacing']).toBe(true)
  })

  it('initialises remaining sections as closed', () => {
    const { openSections } = useUiStore.getState()
    expect(openSections['size']).toBe(false)
    expect(openSections['typography']).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// uiStore — actions
// ---------------------------------------------------------------------------
describe('uiStore actions', () => {
  it('toggleLeftPanel flips panel visibility', () => {
    useUiStore.getState().toggleLeftPanel()
    expect(useUiStore.getState().leftPanelOpen).toBe(false)
    useUiStore.getState().toggleLeftPanel()
    expect(useUiStore.getState().leftPanelOpen).toBe(true)
  })

  it('toggleRightPanel flips panel visibility', () => {
    useUiStore.getState().toggleRightPanel()
    expect(useUiStore.getState().rightPanelOpen).toBe(false)
  })

  it('setBreakpoint updates the active breakpoint', () => {
    const breakpoints: Breakpoint[] = ['tablet', 'mobile', 'desktop']
    for (const bp of breakpoints) {
      useUiStore.getState().setBreakpoint(bp)
      expect(useUiStore.getState().activeBreakpoint).toBe(bp)
    }
  })

  it('setInspectorTab updates the active tab', () => {
    useUiStore.getState().setInspectorTab('settings')
    expect(useUiStore.getState().activeInspectorTab).toBe('settings')
  })

  it('toggleSection flips an existing section', () => {
    useUiStore.getState().toggleSection('layout')
    expect(useUiStore.getState().openSections['layout']).toBe(false)
    useUiStore.getState().toggleSection('layout')
    expect(useUiStore.getState().openSections['layout']).toBe(true)
  })

  it('toggleSection treats an unknown section as initially closed', () => {
    useUiStore.getState().toggleSection('newSection')
    expect(useUiStore.getState().openSections['newSection']).toBe(true)
  })

  it('setSectionOpen sets a section to a specific state', () => {
    useUiStore.getState().setSectionOpen('layout', false)
    expect(useUiStore.getState().openSections['layout']).toBe(false)
    useUiStore.getState().setSectionOpen('layout', true)
    expect(useUiStore.getState().openSections['layout']).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// uiStore — isolation from document state
// ---------------------------------------------------------------------------
describe('uiStore isolation', () => {
  it('contains no document-related keys', () => {
    const state = useUiStore.getState()
    const docKeys = ['document', 'nodes', 'selectedNode', 'selectedId', 'history']
    for (const key of docKeys) {
      expect(state).not.toHaveProperty(key)
    }
  })
})
