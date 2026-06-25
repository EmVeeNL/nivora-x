import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { ControlRenderer } from '@/inspector/controls/ControlRenderer'
import { useDocumentStore } from '@/document/store'
import { useUiStore } from '@/state/uiStore'
import { unitValue } from '@/inspector/controls/valueUnits'
import type { ControlSectionSchema } from '@/inspector/controls/types'
import type { DocumentTree, NxNode } from '@/document/schema/types'

const schema: ControlSectionSchema[] = [
  {
    id: 'typography',
    title: 'Typography',
    controls: [
      {
        id: 'font-size',
        type: 'unit',
        label: 'Font Size',
        prop: 'fontSize',
        valueScope: 'style',
        defaultValue: unitValue(16),
      },
    ],
  },
]

const BREAKPOINTS = [
  { id: 'desktop', label: 'Desktop', width: 1440, direction: 'max' as const, builtin: true },
  { id: 'laptop', label: 'Laptop', width: 1024, direction: 'max' as const, builtin: false },
  { id: 'tablet', label: 'Tablet', width: 768, direction: 'max' as const, builtin: true },
  { id: 'mobile', label: 'Mobile', width: 375, direction: 'max' as const, builtin: true },
]

function node(props: Record<string, unknown>): NxNode {
  return { id: 'node', type: 'heading', props, children: [], overrides: {}, meta: {} }
}

function tree(n: NxNode): DocumentTree {
  return {
    rootId: 'root',
    nodes: {
      root: {
        id: 'root',
        type: '__root__',
        props: {},
        children: ['node'],
        overrides: {},
        meta: {},
      },
      node: n,
    },
  }
}

beforeEach(() => {
  useUiStore.setState({
    breakpoints: BREAKPOINTS,
    activeBreakpoint: 'mobile',
    openSections: { typography: true },
  })
})

describe('responsive control adornment', () => {
  it('shows inherited state when the active breakpoint has no override', () => {
    useDocumentStore.setState({
      tree: tree(node({ fontSize: { base: unitValue(20), laptop: unitValue(18) } })),
      documentMeta: {},
      selectedId: 'node',
      isDirty: false,
      past: [],
      future: [],
      _lastCoalesceKey: null,
      _lastCoalesceTime: 0,
    })

    render(
      <ControlRenderer node={useDocumentStore.getState().tree!.nodes['node']!} sections={schema} />,
    )

    expect(screen.getByText('Inherited')).toBeInTheDocument()
    expect(screen.getByLabelText('Create mobile override')).toBeInTheDocument()
  })

  it('shows overridden state when the active breakpoint has an override', () => {
    useDocumentStore.setState({
      tree: tree(node({ fontSize: { base: unitValue(20), mobile: unitValue(14) } })),
      documentMeta: {},
      selectedId: 'node',
      isDirty: false,
      past: [],
      future: [],
      _lastCoalesceKey: null,
      _lastCoalesceTime: 0,
    })

    render(
      <ControlRenderer node={useDocumentStore.getState().tree!.nodes['node']!} sections={schema} />,
    )

    expect(screen.getByText('Overridden')).toBeInTheDocument()
    expect(screen.getByLabelText('Reset mobile to inherited value')).toBeInTheDocument()
  })

  it('reset removes the active breakpoint override and falls back to inherited value', () => {
    useDocumentStore.setState({
      tree: tree(
        node({
          fontSize: { base: unitValue(20), laptop: unitValue(18), mobile: unitValue(14) },
        }),
      ),
      documentMeta: {},
      selectedId: 'node',
      isDirty: false,
      past: [],
      future: [],
      _lastCoalesceKey: null,
      _lastCoalesceTime: 0,
    })

    const { rerender } = render(
      <ControlRenderer node={useDocumentStore.getState().tree!.nodes['node']!} sections={schema} />,
    )

    fireEvent.click(screen.getByLabelText('Reset mobile to inherited value'))

    rerender(
      <ControlRenderer node={useDocumentStore.getState().tree!.nodes['node']!} sections={schema} />,
    )

    expect(useDocumentStore.getState().tree!.nodes['node']!.props['fontSize']).toEqual({
      base: unitValue(20),
      laptop: unitValue(18),
    })
    expect(screen.getByText('Inherited')).toBeInTheDocument()
  })

  it('indicator updates when the active breakpoint changes', () => {
    useDocumentStore.setState({
      tree: tree(node({ fontSize: { base: unitValue(20), laptop: unitValue(18) } })),
      documentMeta: {},
      selectedId: 'node',
      isDirty: false,
      past: [],
      future: [],
      _lastCoalesceKey: null,
      _lastCoalesceTime: 0,
    })

    const { rerender } = render(
      <ControlRenderer node={useDocumentStore.getState().tree!.nodes['node']!} sections={schema} />,
    )

    expect(screen.getByText('Inherited')).toBeInTheDocument()

    useUiStore.setState({ activeBreakpoint: 'laptop' })
    rerender(
      <ControlRenderer node={useDocumentStore.getState().tree!.nodes['node']!} sections={schema} />,
    )

    expect(screen.getByText('Overridden')).toBeInTheDocument()
  })
})
