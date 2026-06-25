import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { CanvasFrame } from '@/canvas/CanvasFrame'
import { DndProvider } from '@/canvas/dnd/DndProvider'
import { useUiStore } from '@/state/uiStore'
import { getBreakpointWidth } from '@/breakpoints/config'

const renderFrame = () =>
  render(
    <DndProvider>
      <CanvasFrame />
    </DndProvider>,
  )

beforeEach(() => {
  useUiStore.setState({ activeBreakpoint: 'desktop' })
})

// ---------------------------------------------------------------------------
// CanvasFrame — iframe scaffold
// ---------------------------------------------------------------------------
describe('CanvasFrame', () => {
  it('renders a canvas-chrome wrapper', () => {
    renderFrame()
    expect(screen.getByTestId('canvas-chrome')).toBeInTheDocument()
  })

  it('renders the canvas iframe', () => {
    renderFrame()
    expect(screen.getByTestId('canvas-iframe')).toBeInTheDocument()
  })

  it('iframe has an accessible title', () => {
    renderFrame()
    expect(screen.getByTitle('NivoraX canvas')).toBeInTheDocument()
  })

  it('iframe has sandbox attribute for style isolation', () => {
    renderFrame()
    const iframe = screen.getByTestId('canvas-iframe')
    expect(iframe).toHaveAttribute('sandbox')
  })

  it('defaults to desktop width (1440px) as inline style', () => {
    renderFrame()
    const iframe = screen.getByTestId('canvas-iframe')
    expect(iframe.style.width).toBe(`${String(getBreakpointWidth('desktop'))}px`)
  })

  it('reflects tablet breakpoint width (768px) when store is set to tablet', () => {
    useUiStore.setState({ activeBreakpoint: 'tablet' })
    renderFrame()
    const iframe = screen.getByTestId('canvas-iframe')
    expect(iframe.style.width).toBe(`${String(getBreakpointWidth('tablet'))}px`)
  })

  it('reflects mobile breakpoint width (375px) when store is set to mobile', () => {
    useUiStore.setState({ activeBreakpoint: 'mobile' })
    renderFrame()
    const iframe = screen.getByTestId('canvas-iframe')
    expect(iframe.style.width).toBe(`${String(getBreakpointWidth('mobile'))}px`)
  })

  it('does not carry Tailwind/editor class names inside the iframe', () => {
    renderFrame()
    const iframe = screen.getByTestId('canvas-iframe')
    // Editor Tailwind classes must not appear on the iframe element itself
    expect(iframe.className).not.toContain('bg-background')
    expect(iframe.className).not.toContain('text-foreground')
  })
})
