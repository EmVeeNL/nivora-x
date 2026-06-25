import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { RightPanel } from '@/shell/RightPanel'
import { InspectorSection, ControlRow } from '@/shell/InspectorSection'
import { InspectorTabs } from '@/shell/InspectorTabs'
import { useUiStore } from '@/state/uiStore'
import '@/lib/icons'

beforeEach(() => {
  useUiStore.setState({
    rightPanelOpen: true,
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
})

// ---------------------------------------------------------------------------
// InspectorSection — collapsible section
// ---------------------------------------------------------------------------
describe('InspectorSection', () => {
  it('renders the section title in a toggle button', () => {
    render(
      <InspectorSection id="layout" title="Layout">
        <span>child content</span>
      </InspectorSection>,
    )
    expect(screen.getByRole('button', { name: /layout/i })).toBeInTheDocument()
  })

  it('shows children when section is open (layout is open by default)', () => {
    render(
      <InspectorSection id="layout" title="Layout">
        <span>child content</span>
      </InspectorSection>,
    )
    expect(screen.getByText('child content')).toBeInTheDocument()
  })

  it('hides children when section is closed (size is closed by default)', () => {
    render(
      <InspectorSection id="size" title="Size">
        <span>hidden content</span>
      </InspectorSection>,
    )
    expect(screen.queryByText('hidden content')).toBeNull()
  })

  it('toggle button has aria-expanded matching open state', () => {
    render(
      <InspectorSection id="layout" title="Layout">
        <span>content</span>
      </InspectorSection>,
    )
    expect(screen.getByRole('button', { name: /layout/i })).toHaveAttribute('aria-expanded', 'true')
  })

  it('clicking toggle calls toggleSection and updates store', () => {
    render(
      <InspectorSection id="layout" title="Layout">
        <span>content</span>
      </InspectorSection>,
    )
    expect(useUiStore.getState().openSections['layout']).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: /layout/i }))
    expect(useUiStore.getState().openSections['layout']).toBe(false)
  })

  it('clicking toggle twice restores the open state', () => {
    render(
      <InspectorSection id="layout" title="Layout">
        <span>content</span>
      </InspectorSection>,
    )
    fireEvent.click(screen.getByRole('button', { name: /layout/i }))
    fireEvent.click(screen.getByRole('button', { name: /layout/i }))
    expect(useUiStore.getState().openSections['layout']).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// ControlRow — placeholder control
// ---------------------------------------------------------------------------
describe('ControlRow', () => {
  it('renders the label', () => {
    render(<ControlRow label="Width" />)
    expect(screen.getByText('Width')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// InspectorTabs — tab bar
// ---------------------------------------------------------------------------
describe('InspectorTabs', () => {
  it('renders a tablist', () => {
    render(<InspectorTabs />)
    expect(screen.getByRole('tablist')).toBeInTheDocument()
  })

  it('renders the default tabs', () => {
    render(<InspectorTabs />)
    expect(screen.getByRole('tab', { name: 'Style' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Settings' })).toBeInTheDocument()
  })

  it('style tab is selected by default', () => {
    render(<InspectorTabs />)
    expect(screen.getByRole('tab', { name: 'Style' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'Settings' })).toHaveAttribute('aria-selected', 'false')
  })

  it('clicking Settings tab updates the store', () => {
    render(<InspectorTabs />)
    fireEvent.click(screen.getByRole('tab', { name: 'Settings' }))
    expect(useUiStore.getState().activeInspectorTab).toBe('block')
  })

  it('clicking Style tab after Settings restores style as active', () => {
    useUiStore.setState({ activeInspectorTab: 'block' })
    render(<InspectorTabs />)
    fireEvent.click(screen.getByRole('tab', { name: 'Style' }))
    expect(useUiStore.getState().activeInspectorTab).toBe('inspector')
  })

  it('renders custom tabs when provided', () => {
    render(<InspectorTabs tabs={[{ id: 'custom', label: 'Custom', icon: '' }]} />)
    expect(screen.getByRole('tab', { name: 'Custom' })).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// RightPanel — open state
// ---------------------------------------------------------------------------
describe('RightPanel (open)', () => {
  it('renders the Inspector header label', () => {
    render(<RightPanel />)
    expect(screen.getAllByText('Inspector')).toHaveLength(1)
  })

  it('renders the tab bar', () => {
    render(<RightPanel />)
    expect(screen.getByRole('tablist')).toBeInTheDocument()
  })

  it('renders phase 08 inspector tabs', () => {
    render(<RightPanel />)
    expect(screen.getByRole('tab', { name: 'Page' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Settings' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Style' })).toBeInTheDocument()
  })

  it('shows empty inspector content until a node is selected', () => {
    render(<RightPanel />)
    expect(screen.getByText('Select an element to edit style controls.')).toBeInTheDocument()
  })

  it('shows page settings when page tab is active', () => {
    useUiStore.setState({ activeInspectorTab: 'page' })
    render(<RightPanel />)
    expect(screen.getByLabelText('Page title')).toBeInTheDocument()
    expect(screen.queryByText('Select an element to edit style controls.')).toBeNull()
  })

  it('has a collapse button', () => {
    render(<RightPanel />)
    expect(screen.getByRole('button', { name: /collapse inspector/i })).toBeInTheDocument()
  })

  it('collapse button sets rightPanelOpen to false', () => {
    render(<RightPanel />)
    fireEvent.click(screen.getByRole('button', { name: /collapse inspector/i }))
    expect(useUiStore.getState().rightPanelOpen).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// RightPanel — collapsed state
// ---------------------------------------------------------------------------
describe('RightPanel (collapsed)', () => {
  beforeEach(() => {
    useUiStore.setState({ rightPanelOpen: false })
  })

  it('does not render the Inspector label or tab bar', () => {
    render(<RightPanel />)
    expect(screen.queryByText('Inspector')).toBeNull()
    expect(screen.queryByRole('tablist')).toBeNull()
  })

  it('shows a re-expand affordance button', () => {
    render(<RightPanel />)
    expect(screen.getByRole('button', { name: /expand inspector/i })).toBeInTheDocument()
  })

  it('re-expand button sets rightPanelOpen to true', () => {
    render(<RightPanel />)
    fireEvent.click(screen.getByRole('button', { name: /expand inspector/i }))
    expect(useUiStore.getState().rightPanelOpen).toBe(true)
  })
})
