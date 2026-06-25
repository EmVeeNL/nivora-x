import { describe, it, expect, beforeEach } from 'vitest'
import React from 'react'
import {
  registerElement,
  getElementDefinition,
  hasElement,
  listElementTypes,
  _clearRegistry,
} from '@/elements/registry'
import type { ElementDefinition, ElementRenderProps } from '@/elements/types'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const NoopRender = (_unused: ElementRenderProps) => null

const mkDef = (type: string): ElementDefinition => ({
  type,
  label: `Label ${type}`,
  icon: 'tabler:circle',
  category: 'Test',
  defaultProps: { foo: 'bar' },
  nesting: { acceptsChildren: true },
  render: NoopRender,
})

beforeEach(() => {
  _clearRegistry()
})

// ---------------------------------------------------------------------------
// Registration & retrieval
// ---------------------------------------------------------------------------

describe('registerElement / getElementDefinition', () => {
  it('returns the registered definition for a known type', () => {
    const def = mkDef('widget')
    registerElement(def)
    expect(getElementDefinition('widget')).toBe(def)
  })

  it('returns the fallback for an unknown type (never throws)', () => {
    const fallback = getElementDefinition('totally-unknown-type')
    expect(fallback).toBeDefined()
    expect(fallback.type).toBe('__unknown__')
    expect(fallback.nesting.acceptsChildren).toBe(false)
  })

  it('duplicate registration replaces the prior entry (last-write-wins)', () => {
    const first = mkDef('widget')
    const second = { ...mkDef('widget'), label: 'Second Widget' }
    registerElement(first)
    registerElement(second)
    expect(getElementDefinition('widget').label).toBe('Second Widget')
  })
})

// ---------------------------------------------------------------------------
// hasElement
// ---------------------------------------------------------------------------

describe('hasElement', () => {
  it('returns true for a registered type', () => {
    registerElement(mkDef('block'))
    expect(hasElement('block')).toBe(true)
  })

  it('returns false for an unregistered type', () => {
    expect(hasElement('ghost')).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// listElementTypes
// ---------------------------------------------------------------------------

describe('listElementTypes', () => {
  it('returns all registered type strings', () => {
    registerElement(mkDef('a'))
    registerElement(mkDef('b'))
    const types = listElementTypes()
    expect(types).toContain('a')
    expect(types).toContain('b')
    expect(types).toHaveLength(2)
  })

  it('returns empty array when registry is empty', () => {
    expect(listElementTypes()).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------
// Fallback render is safe
// ---------------------------------------------------------------------------

describe('fallback definition', () => {
  it('fallback render component is a function (renderable)', () => {
    const fallback = getElementDefinition('nope')
    expect(typeof fallback.render).toBe('function')
  })

  it('fallback exposes parity slots as optional (undefined)', () => {
    const fallback = getElementDefinition('nope')
    expect(fallback.phpRender).toBeUndefined()
    expect(fallback.controlSchema).toBeUndefined()
  })
})

// ---------------------------------------------------------------------------
// Parity slots
// ---------------------------------------------------------------------------

describe('parity slots', () => {
  it('phpRender and controlSchema are optional and can be set', () => {
    const def: ElementDefinition = {
      ...mkDef('rich'),
      phpRender: 'some-php-class',
      controlSchema: {
        block: [
          {
            id: 'content',
            title: 'Content',
            controls: [{ id: 'label', type: 'text', label: 'Label', prop: 'label' }],
          },
        ],
      },
    }
    registerElement(def)
    const retrieved = getElementDefinition('rich')
    expect(retrieved.phpRender).toBe('some-php-class')
    expect(retrieved.controlSchema?.block?.[0]?.controls[0]?.prop).toBe('label')
  })
})

// Suppress "React imported but unused" — it's needed for JSX in sibling files.
void React
