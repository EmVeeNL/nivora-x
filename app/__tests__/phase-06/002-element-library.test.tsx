import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { registerElement, _clearRegistry } from '@/elements/registry'
import type { ElementDefinition, ElementRenderProps } from '@/elements/types'

// We test the panel in isolation — stub out dnd-kit's useDraggable
vi.mock('@dnd-kit/core', () => ({
  useDraggable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: () => undefined,
    isDragging: false,
  }),
  DndContext: ({ children }: { children: React.ReactNode }) => children,
}))

import { ElementLibraryPanel } from '@/shell/left/library/ElementLibraryPanel'
import React from 'react'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const NoopRender = (_props: ElementRenderProps) => null

const mkDef = (type: string, category: string, label: string): ElementDefinition => ({
  type,
  label,
  icon: 'tabler:circle',
  category,
  defaultProps: {},
  nesting: { acceptsChildren: false },
  render: NoopRender,
})

beforeEach(() => {
  _clearRegistry()
})

describe('ElementLibraryPanel', () => {
  it('shows only the first registered category open by default', () => {
    registerElement(mkDef('section', 'Layout', 'Section'))
    registerElement(mkDef('text', 'Content', 'Text'))
    render(React.createElement(ElementLibraryPanel))
    expect(screen.getByText('Section')).toBeInTheDocument()
    expect(screen.queryByText('Text')).not.toBeInTheDocument()
  })

  it('groups elements by category', () => {
    registerElement(mkDef('section', 'Layout', 'Section'))
    registerElement(mkDef('container', 'Layout', 'Container'))
    registerElement(mkDef('text', 'Content', 'Text'))
    render(React.createElement(ElementLibraryPanel))
    expect(screen.getByText('Layout')).toBeInTheDocument()
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('filters by search query', async () => {
    registerElement(mkDef('section', 'Layout', 'Section'))
    registerElement(mkDef('text', 'Content', 'Text'))
    render(React.createElement(ElementLibraryPanel))

    const input = screen.getByRole('searchbox')
    await userEvent.type(input, 'text')
    expect(screen.queryByText('Section')).not.toBeInTheDocument()
    expect(screen.getByText('Text')).toBeInTheDocument()
  })

  it('expands and collapses category groups', async () => {
    registerElement(mkDef('section', 'Layout', 'Section'))
    registerElement(mkDef('text', 'Content', 'Text'))
    render(React.createElement(ElementLibraryPanel))

    const content = screen.getByRole('button', { name: /content/i })
    await userEvent.click(content)
    expect(screen.getByText('Text')).toBeInTheDocument()

    const layout = screen.getByRole('button', { name: /layout/i })
    await userEvent.click(layout)
    expect(screen.queryByText('Section')).not.toBeInTheDocument()
  })

  it('shows empty state when search matches nothing', async () => {
    registerElement(mkDef('section', 'Layout', 'Section'))
    render(React.createElement(ElementLibraryPanel))

    const input = screen.getByRole('searchbox')
    await userEvent.type(input, 'xyz-nomatch')
    expect(screen.getByText('No elements found')).toBeInTheDocument()
  })

  it('each element renders a draggable card', () => {
    registerElement(mkDef('section', 'Layout', 'Section'))
    render(React.createElement(ElementLibraryPanel))
    expect(screen.getByTestId('element-card-section')).toBeInTheDocument()
  })

  it('auto-discovers newly registered elements without panel code changes', () => {
    registerElement(mkDef('new-thing', 'Custom', 'New Thing'))
    render(React.createElement(ElementLibraryPanel))
    expect(screen.getByText('New Thing')).toBeInTheDocument()
  })
})

// Suppress "React imported but unused" warning
void React
