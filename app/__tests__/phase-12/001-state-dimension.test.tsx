import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { resolveResponsiveStyleValue } from '@/breakpoints/resolveResponsive'
import { CanvasRenderer } from '@/canvas/CanvasRenderer'
import { useDocumentStore } from '@/document/store'
import type { DocumentTree } from '@/document/schema/types'
import { registerElement, _clearRegistry } from '@/elements/registry'
import { headingDefinition } from '@/elements/definitions/heading'
import { InspectorPanel } from '@/inspector/InspectorPanel'
import { unitValue } from '@/inspector/controls/valueUnits'
import { useUiStore } from '@/state/uiStore'

const BREAKPOINTS = [
  { id: 'desktop', label: 'Desktop', width: 1440, direction: 'max' as const, builtin: true },
  { id: 'tablet', label: 'Tablet', width: 768, direction: 'max' as const, builtin: true },
  { id: 'mobile', label: 'Mobile', width: 375, direction: 'max' as const, builtin: true },
]

function makeTree(props: Record<string, unknown>): DocumentTree {
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
        props: {
          text: 'Hello state',
          level: 2,
          ...props,
        },
        children: [],
        overrides: {},
        meta: {},
      },
    },
  }
}

describe('phase 12 — state dimension', () => {
  beforeEach(() => {
    _clearRegistry()
    registerElement(headingDefinition)
    useDocumentStore.setState({
      tree: null,
      documentMeta: {},
      selectedId: null,
      isDirty: false,
      autosaveStatus: 'idle',
      past: [],
      future: [],
      _lastCoalesceKey: null,
      _lastCoalesceTime: 0,
    })
    useUiStore.setState({
      breakpoints: BREAKPOINTS,
      activeBreakpoint: 'desktop',
      activeStyleState: 'default',
      activeInspectorTab: 'inspector',
      openSections: { typography: true },
    })
  })

  it('falls back to default state when the selected state is absent', () => {
    const value = {
      default: {
        base: unitValue(20),
        mobile: unitValue(16),
      },
    }

    expect(
      resolveResponsiveStyleValue(value, 'hover', 'desktop', BREAKPOINTS, unitValue(0)),
    ).toEqual(unitValue(20))
    expect(
      resolveResponsiveStyleValue(value, 'hover', 'mobile', BREAKPOINTS, unitValue(0)),
    ).toEqual(unitValue(16))
  })

  it('routes control edits into the active interaction state', () => {
    useDocumentStore.setState({
      tree: makeTree({ fontSize: { base: unitValue(16) } }),
      documentMeta: {},
      selectedId: 'heading',
      isDirty: false,
      autosaveStatus: 'idle',
      past: [],
      future: [],
      _lastCoalesceKey: null,
      _lastCoalesceTime: 0,
    })

    render(<InspectorPanel />)

    fireEvent.click(screen.getByTestId('state-switcher-hover'))
    fireEvent.change(screen.getByLabelText('Font Size'), { target: { value: '32' } })

    expect(useUiStore.getState().activeStyleState).toBe('hover')
    expect(useDocumentStore.getState().tree!.nodes['heading']!.props['fontSize']).toEqual({
      default: { base: unitValue(16) },
      hover: { base: unitValue(32) },
    })
  })

  it('previews the active editing state in the canvas render', () => {
    useDocumentStore.setState({
      tree: makeTree({
        color: {
          default: { base: 'rgb(255, 0, 0)' },
          hover: { base: 'rgb(0, 0, 255)' },
        },
      }),
      documentMeta: {},
      selectedId: 'heading',
      isDirty: false,
      autosaveStatus: 'idle',
      past: [],
      future: [],
      _lastCoalesceKey: null,
      _lastCoalesceTime: 0,
    })
    useUiStore.setState({ activeStyleState: 'hover' })

    render(<CanvasRenderer />)

    expect(screen.getByText('Hello state')).toHaveStyle({ color: 'rgb(0, 0, 255)' })
  })
})
