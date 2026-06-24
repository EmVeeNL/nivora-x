import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'
import { Button } from '@/lib/ui/button'
import { EditorApp } from '@/EditorApp'

// ---------------------------------------------------------------------------
// cn() utility
// ---------------------------------------------------------------------------
describe('cn()', () => {
  it('merges class strings', () => {
    expect(cn('a', 'b')).toBe('a b')
  })

  it('resolves Tailwind conflicts — last token wins', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4')
  })

  it('filters falsy values', () => {
    expect(cn('a', false, null, undefined, 'b')).toBe('a b')
  })

  it('handles conditional objects', () => {
    expect(cn({ foo: true, bar: false })).toBe('foo')
  })
})

// ---------------------------------------------------------------------------
// Button (ShadCN primitive)
// ---------------------------------------------------------------------------
describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('applies the default variant class', () => {
    render(<Button>Save</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('bg-primary')
  })

  it('applies the ghost variant class', () => {
    render(<Button variant="ghost">Ghost</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('hover:bg-accent')
  })

  it('applies the icon size class', () => {
    render(
      <Button size="icon" aria-label="icon">
        X
      </Button>,
    )
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('h-8 w-8')
  })

  it('forwards extra props to the button element', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('renders as a child component when asChild is true', () => {
    render(
      <Button asChild>
        <a href="#">Link</a>
      </Button>,
    )
    expect(screen.getByRole('link', { name: /link/i })).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// EditorApp — mount smoke test
// ---------------------------------------------------------------------------
describe('EditorApp', () => {
  it('renders without crashing', () => {
    const { container } = render(<EditorApp />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders a root element with the nivorax-editor class', () => {
    const { container } = render(<EditorApp />)
    const root = container.firstElementChild
    expect(root?.classList.contains('nivorax-editor')).toBe(true)
  })

  it('does not render the old Phase 02 placeholder', () => {
    render(<EditorApp />)
    expect(document.getElementById('nivorax-editor-placeholder')).toBeNull()
  })
})
