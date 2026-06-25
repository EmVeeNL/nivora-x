import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { BreadcrumbBar } from '@/shell/BreadcrumbBar'
import { useDocumentStore } from '@/document/store'
import { registerElement, _clearRegistry } from '@/elements/registry'
import { headingDefinition } from '@/elements/definitions/heading'
import { sectionDefinition } from '@/elements/definitions/section'

// ---------------------------------------------------------------------------
// BreadcrumbBar — dynamic breadcrumb from document tree
// ---------------------------------------------------------------------------

beforeEach(() => {
  _clearRegistry()
  registerElement(sectionDefinition)
  registerElement(headingDefinition)

  // Tree: root → section ('Body') → heading ('Heading')
  useDocumentStore.setState({
    tree: {
      rootId: 'root',
      nodes: {
        root: {
          id: 'root',
          type: '__root__',
          props: {},
          children: ['section'],
          overrides: {},
          meta: { name: 'Body' },
        },
        section: {
          id: 'section',
          type: 'section',
          props: {},
          children: ['heading'],
          overrides: {},
          meta: { name: 'Hero Section' },
        },
        heading: {
          id: 'heading',
          type: 'heading',
          props: { text: 'Hello', level: 1 },
          children: [],
          overrides: {},
          meta: { name: 'Hero Heading' },
        },
      },
    },
    selectedId: 'heading',
    documentMeta: {},
    isDirty: false,
    past: [],
    future: [],
    _lastCoalesceKey: null,
    _lastCoalesceTime: 0,
  })
})

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
