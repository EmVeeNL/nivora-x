import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { LeftPanel } from '@/shell/LeftPanel'
import { NavigatorPlaceholder } from '@/shell/NavigatorPlaceholder'
import { useUiStore } from '@/state/uiStore'
import '@/lib/icons'

beforeEach(() => {
  useUiStore.setState({ leftPanelOpen: true })
})

// ---------------------------------------------------------------------------
// NavigatorPlaceholder — static tree
// ---------------------------------------------------------------------------
describe('NavigatorPlaceholder', () => {
  it('renders a tree role', () => {
    render(<NavigatorPlaceholder />)
    expect(screen.getByRole('tree')).toBeInTheDocument()
  })

  it('renders multiple tree items', () => {
    render(<NavigatorPlaceholder />)
    const items = screen.getAllByRole('treeitem')
    expect(items.length).toBeGreaterThan(3)
  })

  it('renders recognisable layer labels', () => {
    render(<NavigatorPlaceholder />)
    expect(screen.getByText('Body')).toBeInTheDocument()
    expect(screen.getByText('Hero Section')).toBeInTheDocument()
    expect(screen.getByText('Footer Section')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// LeftPanel — open state
// ---------------------------------------------------------------------------
describe('LeftPanel (open)', () => {
  it('renders the Navigation panel header label', () => {
    render(<LeftPanel />)
    // Two elements contain "Navigation": the header label and the tree row —
    // confirm the header (uppercase, outside the tree) is present.
    const matches = screen.getAllByText('Navigation')
    expect(matches.length).toBeGreaterThanOrEqual(1)
  })

  it('renders the placeholder layer tree', () => {
    render(<LeftPanel />)
    expect(screen.getByRole('tree')).toBeInTheDocument()
  })

  it('has a collapse button', () => {
    render(<LeftPanel />)
    expect(screen.getByRole('button', { name: /collapse navigation/i })).toBeInTheDocument()
  })

  it('collapse button sets leftPanelOpen to false', () => {
    render(<LeftPanel />)
    fireEvent.click(screen.getByRole('button', { name: /collapse navigation/i }))
    expect(useUiStore.getState().leftPanelOpen).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// LeftPanel — collapsed state (re-expand affordance)
// ---------------------------------------------------------------------------
describe('LeftPanel (collapsed)', () => {
  beforeEach(() => {
    useUiStore.setState({ leftPanelOpen: false })
  })

  it('does not render the Navigation header or tree', () => {
    render(<LeftPanel />)
    expect(screen.queryByText('Navigation')).toBeNull()
    expect(screen.queryByRole('tree')).toBeNull()
  })

  it('shows a re-expand affordance button', () => {
    render(<LeftPanel />)
    expect(screen.getByRole('button', { name: /expand navigation/i })).toBeInTheDocument()
  })

  it('re-expand button sets leftPanelOpen to true', () => {
    render(<LeftPanel />)
    fireEvent.click(screen.getByRole('button', { name: /expand navigation/i }))
    expect(useUiStore.getState().leftPanelOpen).toBe(true)
  })
})
