import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { LeftPanel } from '@/shell/LeftPanel'
import { ActivityBar } from '@/shell/ActivityBar'
import { NavigatorPlaceholder } from '@/shell/NavigatorPlaceholder'
import { useUiStore } from '@/state/uiStore'
import '@/lib/icons'

beforeEach(() => {
  useUiStore.setState({ activeLeftPanel: 'navigator' })
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
describe('LeftPanel (navigator active)', () => {
  it('renders the Navigation panel header label', () => {
    render(<LeftPanel />)
    const matches = screen.getAllByText('Navigation')
    expect(matches.length).toBeGreaterThanOrEqual(1)
  })

  it('renders the placeholder layer tree', () => {
    render(<LeftPanel />)
    expect(screen.getByRole('tree')).toBeInTheDocument()
  })

  it('does not have a collapse button (activity bar manages visibility)', () => {
    render(<LeftPanel />)
    expect(screen.queryByRole('button', { name: /collapse navigation/i })).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// LeftPanel — no active panel
// ---------------------------------------------------------------------------
describe('LeftPanel (no active panel)', () => {
  beforeEach(() => {
    useUiStore.setState({ activeLeftPanel: null })
  })

  it('renders nothing when no panel is active', () => {
    const { container } = render(<LeftPanel />)
    expect(container.firstChild).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// ActivityBar — panel toggle
// ---------------------------------------------------------------------------
describe('ActivityBar', () => {
  it('renders the Navigator icon button', () => {
    render(<ActivityBar />)
    expect(screen.getByRole('button', { name: /navigator/i })).toBeInTheDocument()
  })

  it('navigator button is aria-pressed when navigator panel is active', () => {
    render(<ActivityBar />)
    expect(screen.getByRole('button', { name: /navigator/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('navigator button is not aria-pressed when navigator panel is not active', () => {
    useUiStore.setState({ activeLeftPanel: null })
    render(<ActivityBar />)
    expect(screen.getByRole('button', { name: /navigator/i })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  it('clicking active navigator button collapses the panel', () => {
    render(<ActivityBar />)
    fireEvent.click(screen.getByRole('button', { name: /navigator/i }))
    expect(useUiStore.getState().activeLeftPanel).toBeNull()
  })

  it('clicking inactive navigator button opens the navigator panel', () => {
    useUiStore.setState({ activeLeftPanel: null })
    render(<ActivityBar />)
    fireEvent.click(screen.getByRole('button', { name: /navigator/i }))
    expect(useUiStore.getState().activeLeftPanel).toBe('navigator')
  })
})
