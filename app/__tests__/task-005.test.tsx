import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { CanvasFrame } from '@/canvas/CanvasFrame'
import { useUiStore, BREAKPOINT_WIDTHS } from '@/state/uiStore'

beforeEach(() => {
  useUiStore.setState({ activeBreakpoint: 'desktop' })
})

// ---------------------------------------------------------------------------
// CanvasFrame — iframe scaffold
// ---------------------------------------------------------------------------
describe('CanvasFrame', () => {
  it('renders a canvas-chrome wrapper', () => {
    render(<CanvasFrame />)
    expect(screen.getByTestId('canvas-chrome')).toBeInTheDocument()
  })

  it('renders the canvas iframe', () => {
    render(<CanvasFrame />)
    expect(screen.getByTestId('canvas-iframe')).toBeInTheDocument()
  })

  it('iframe has an accessible title', () => {
    render(<CanvasFrame />)
    expect(screen.getByTitle('NivoraX canvas')).toBeInTheDocument()
  })

  it('iframe has sandbox attribute for style isolation', () => {
    render(<CanvasFrame />)
    const iframe = screen.getByTestId('canvas-iframe')
    expect(iframe).toHaveAttribute('sandbox')
  })

  it('defaults to desktop width (1440px) as inline style', () => {
    render(<CanvasFrame />)
    const iframe = screen.getByTestId('canvas-iframe')
    expect(iframe.style.width).toBe(`${String(BREAKPOINT_WIDTHS.desktop)}px`)
  })

  it('reflects tablet breakpoint width (768px) when store is set to tablet', () => {
    useUiStore.setState({ activeBreakpoint: 'tablet' })
    render(<CanvasFrame />)
    const iframe = screen.getByTestId('canvas-iframe')
    expect(iframe.style.width).toBe(`${String(BREAKPOINT_WIDTHS.tablet)}px`)
  })

  it('reflects mobile breakpoint width (375px) when store is set to mobile', () => {
    useUiStore.setState({ activeBreakpoint: 'mobile' })
    render(<CanvasFrame />)
    const iframe = screen.getByTestId('canvas-iframe')
    expect(iframe.style.width).toBe(`${String(BREAKPOINT_WIDTHS.mobile)}px`)
  })

  it('does not carry Tailwind/editor class names inside the iframe', () => {
    render(<CanvasFrame />)
    const iframe = screen.getByTestId('canvas-iframe')
    // Editor Tailwind classes must not appear on the iframe element itself
    expect(iframe.className).not.toContain('bg-background')
    expect(iframe.className).not.toContain('text-foreground')
  })
})
