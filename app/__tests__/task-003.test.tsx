import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { TopToolbar } from '@/shell/TopToolbar'
import { BreakpointSwitcher } from '@/shell/BreakpointSwitcher'
import { useUiStore } from '@/state/uiStore'
import { getBreakpointWidth } from '@/breakpoints/config'
import '@/lib/icons'

beforeEach(() => {
  useUiStore.setState({ activeBreakpoint: 'desktop' })
})

// ---------------------------------------------------------------------------
// TopToolbar layout
// ---------------------------------------------------------------------------
describe('TopToolbar', () => {
  it('renders a page title', () => {
    render(<TopToolbar />)
    expect(screen.getByLabelText('Page title')).toBeInTheDocument()
  })

  it('renders the breakpoint switcher', () => {
    render(<TopToolbar />)
    expect(screen.getByRole('group', { name: /breakpoint/i })).toBeInTheDocument()
  })

  it('renders a Preview button', () => {
    render(<TopToolbar />)
    expect(screen.getByRole('button', { name: /preview/i })).toBeInTheDocument()
  })

  it('renders a Publish button', () => {
    render(<TopToolbar />)
    expect(screen.getByRole('button', { name: /publish/i })).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// BreakpointSwitcher — state binding
// ---------------------------------------------------------------------------
describe('BreakpointSwitcher', () => {
  it('renders buttons for all three breakpoints', () => {
    render(<BreakpointSwitcher />)
    expect(screen.getByRole('button', { name: /desktop/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /tablet/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /mobile/i })).toBeInTheDocument()
  })

  it('desktop button is pressed by default', () => {
    render(<BreakpointSwitcher />)
    expect(screen.getByRole('button', { name: /desktop/i })).toHaveAttribute('aria-pressed', 'true')
  })

  it('tablet and mobile buttons are not pressed by default', () => {
    render(<BreakpointSwitcher />)
    expect(screen.getByRole('button', { name: /tablet/i })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('button', { name: /mobile/i })).toHaveAttribute('aria-pressed', 'false')
  })

  it('clicking a breakpoint button updates the store', () => {
    render(<BreakpointSwitcher />)
    fireEvent.click(screen.getByRole('button', { name: /tablet/i }))
    expect(useUiStore.getState().activeBreakpoint).toBe('tablet')
  })

  it('clicking mobile sets the store to mobile', () => {
    render(<BreakpointSwitcher />)
    fireEvent.click(screen.getByRole('button', { name: /mobile/i }))
    expect(useUiStore.getState().activeBreakpoint).toBe('mobile')
  })

  it('reflects store state — when tablet is active, tablet button is pressed', () => {
    useUiStore.setState({ activeBreakpoint: 'tablet' })
    render(<BreakpointSwitcher />)
    expect(screen.getByRole('button', { name: /tablet/i })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: /desktop/i })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  it('shows the width of the active breakpoint', () => {
    render(<BreakpointSwitcher />)
    expect(screen.getByText(`${String(getBreakpointWidth('desktop'))}px`)).toBeInTheDocument()
  })

  it('width label updates when the breakpoint changes', () => {
    render(<BreakpointSwitcher />)
    fireEvent.click(screen.getByRole('button', { name: /mobile/i }))
    expect(screen.getByText(`${String(getBreakpointWidth('mobile'))}px`)).toBeInTheDocument()
  })
})
