import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { InspectorPanel } from '@/inspector/InspectorPanel'
import { useDocumentStore } from '@/document/store'
import { useUiStore } from '@/state/uiStore'
import { registerElement, _clearRegistry } from '@/elements/registry'
import { headingDefinition } from '@/elements/definitions/heading'
import { resolveNodeStyles } from '@/canvas/style/resolveStyles'
import { unitValue } from '@/inspector/controls/valueUnits'
import type { DocumentTree, NxNode } from '@/document/schema/types'

const BREAKPOINTS = [
  { id: 'desktop', label: 'Desktop', width: 1440, direction: 'max' as const, builtin: true },
  { id: 'laptop', label: 'Laptop', width: 1024, direction: 'max' as const, builtin: false },
  { id: 'tablet', label: 'Tablet', width: 768, direction: 'max' as const, builtin: true },
  { id: 'mobile', label: 'Mobile', width: 375, direction: 'max' as const, builtin: true },
]

function tree(nodeProps: Record<string, unknown>): DocumentTree {
  return {
    rootId: 'root',
    nodes: {
      root: {
        id: 'root',
        type: '__root__',
        props: {},
        children: ['heading'],
        overrides: {},
        meta: {},
      },
      heading: {
        id: 'heading',
        type: 'heading',
        props: nodeProps,
        children: [],
        overrides: {},
        meta: {},
      },
    },
  }
}

function renderStylePanel(props: Record<string, unknown>, breakpoint: string) {
  useDocumentStore.setState({
    tree: tree(props),
    documentMeta: { title: 'Home' },
    selectedId: 'heading',
    isDirty: false,
    past: [],
    future: [],
    _lastCoalesceKey: null,
    _lastCoalesceTime: 0,
  })
  useUiStore.setState({
    activeInspectorTab: 'inspector',
    activeBreakpoint: breakpoint,
    breakpoints: BREAKPOINTS,
    openSections: { typography: true },
  })

  render(<InspectorPanel />)
}

describe('responsive editing', () => {
  beforeEach(() => {
    _clearRegistry()
    registerElement(headingDefinition)
  })

  it('writes desktop edits to the base value', () => {
    renderStylePanel({ text: 'Hello', level: 2, fontSize: { base: unitValue(16) } }, 'desktop')

    fireEvent.change(screen.getByLabelText('Font Size'), { target: { value: '32' } })

    const node = useDocumentStore.getState().tree!.nodes['heading']!
    expect(node.props['fontSize']).toEqual({ base: unitValue(32) })
  })

  it('writes non-desktop edits to the active breakpoint override', () => {
    renderStylePanel({ text: 'Hello', level: 2, fontSize: { base: unitValue(16) } }, 'laptop')

    fireEvent.change(screen.getByLabelText('Font Size'), { target: { value: '24' } })

    const node = useDocumentStore.getState().tree!.nodes['heading']!
    expect(node.props['fontSize']).toEqual({
      base: unitValue(16),
      laptop: unitValue(24),
    })
  })

  it('cascades styles from wider breakpoints down to the active breakpoint', () => {
    const node: NxNode = {
      id: 'node',
      type: 'heading',
      props: {
        fontSize: {
          base: unitValue(20),
          laptop: unitValue(18),
          tablet: unitValue(16),
        },
      },
      children: [],
      overrides: {},
      meta: {},
    }

    const mobileStyles = resolveNodeStyles(node, 'mobile', BREAKPOINTS)
    const tabletStyles = resolveNodeStyles(node, 'tablet', BREAKPOINTS)

    expect(tabletStyles.fontSize).toBe('16px')
    expect(mobileStyles.fontSize).toBe('16px')
  })

  it('falls back to the inherited value when an active-breakpoint override is absent', () => {
    const node: NxNode = {
      id: 'node',
      type: 'heading',
      props: {
        fontSize: {
          base: unitValue(20),
          laptop: unitValue(18),
        },
      },
      children: [],
      overrides: {},
      meta: {},
    }

    const styles = resolveNodeStyles(node, 'mobile', BREAKPOINTS)
    expect(styles.fontSize).toBe('18px')
  })
})
