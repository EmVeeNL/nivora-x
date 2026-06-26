import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { InspectorPanel } from '@/inspector/InspectorPanel'
import { useDocumentStore } from '@/document/store'
import { useUiStore } from '@/state/uiStore'
import { registerElement, _clearRegistry } from '@/elements/registry'
import { headingDefinition } from '@/elements/definitions/heading'
import { unitValue } from '@/inspector/controls/valueUnits'
import { makeTokenRef } from '@/tokens/model'

function tree() {
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
        props: { text: 'Hello', level: 2 },
        children: [],
        overrides: {},
        meta: {},
      },
    },
  }
}

describe('phase 12 — border and shadow controls', () => {
  beforeEach(() => {
    _clearRegistry()
    registerElement(headingDefinition)
    useDocumentStore.setState({
      tree: tree(),
      documentMeta: {},
      selectedId: 'heading',
      isDirty: false,
      autosaveStatus: 'idle',
      past: [],
      future: [],
      _lastCoalesceKey: null,
      _lastCoalesceTime: 0,
    })
    useUiStore.setState({
      activeInspectorTab: 'inspector',
      activeBreakpoint: 'desktop',
      activeStyleState: 'default',
      openSections: {
        identity: false,
        layout: false,
        spacing: false,
        size: false,
        typography: false,
        background: false,
        border: true,
        shadow: true,
        visibility: false,
      },
    })
  })

  it('writes per-side border width values', () => {
    render(<InspectorPanel />)

    fireEvent.change(screen.getByTestId('border-width-input'), { target: { value: '8' } })

    expect(useDocumentStore.getState().tree!.nodes['heading']!.props['borderWidth']).toEqual({
      base: {
        top: unitValue(8),
        right: unitValue(1),
        bottom: unitValue(1),
        left: unitValue(1),
      },
    })
  })

  it('writes per-corner border radius values', () => {
    render(<InspectorPanel />)

    fireEvent.click(screen.getByLabelText('Adjust selected border radius corners'))
    const slider = screen.getByRole('slider')

    for (let index = 0; index < 12; index += 1) {
      fireEvent.keyDown(slider, { key: 'ArrowRight' })
    }

    expect(useDocumentStore.getState().tree!.nodes['heading']!.props['borderRadius']).toEqual({
      base: {
        topLeft: unitValue(12),
        topRight: unitValue(0),
        bottomRight: unitValue(0),
        bottomLeft: unitValue(0),
      },
    })
  })

  it('supports token refs for box shadow', () => {
    useDocumentStore
      .getState()
      .updateProps('heading', { boxShadow: makeTokenRef('effect-shadow-md') })
    render(<InspectorPanel />)

    expect(
      screen
        .getAllByTestId('token-picker')
        .some((node) => (node as HTMLSelectElement).value === 'effect-shadow-md'),
    ).toBe(true)
  })
})
