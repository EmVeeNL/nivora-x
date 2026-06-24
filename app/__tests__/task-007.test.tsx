import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { BreadcrumbBar } from '@/shell/BreadcrumbBar'

// ---------------------------------------------------------------------------
// BreadcrumbBar — static breadcrumb placeholder
// ---------------------------------------------------------------------------
describe('BreadcrumbBar', () => {
  it('renders a breadcrumb nav landmark', () => {
    render(<BreadcrumbBar />)
    expect(screen.getByRole('navigation', { name: /breadcrumb/i })).toBeInTheDocument()
  })

  it('renders the root crumb "Body"', () => {
    render(<BreadcrumbBar />)
    expect(screen.getByText('Body')).toBeInTheDocument()
  })

  it('renders intermediate crumbs', () => {
    render(<BreadcrumbBar />)
    expect(screen.getByText('Page Wrapper')).toBeInTheDocument()
    expect(screen.getByText('Hero Section')).toBeInTheDocument()
  })

  it('marks the last crumb with aria-current="location"', () => {
    render(<BreadcrumbBar />)
    const lastCrumb = screen.getByRole('button', { name: 'Hero Heading' })
    expect(lastCrumb).toHaveAttribute('aria-current', 'location')
  })

  it('non-terminal crumbs do not carry aria-current', () => {
    render(<BreadcrumbBar />)
    const rootCrumb = screen.getByRole('button', { name: 'Body' })
    expect(rootCrumb).not.toHaveAttribute('aria-current')
  })

  it('renders more than one crumb (is a path, not a single element)', () => {
    render(<BreadcrumbBar />)
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(1)
  })
})
