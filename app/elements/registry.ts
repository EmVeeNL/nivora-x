import type { ElementDefinition, ElementRenderProps } from './types'
import React from 'react'

const _registry = new Map<string, ElementDefinition>()

/**
 * Register an element definition.
 * Duplicate registration replaces the prior entry (last-write-wins, deterministic).
 */
export function registerElement(def: ElementDefinition): void {
  _registry.set(def.type, def)
}

/**
 * Look up a definition by type.
 * Returns the safe fallback placeholder for unknown types — never throws.
 */
export function getElementDefinition(type: string): ElementDefinition {
  return _registry.get(type) ?? FALLBACK_DEFINITION
}

/** Returns true if a type has an explicit registration. */
export function hasElement(type: string): boolean {
  return _registry.has(type)
}

/** List all registered type strings. */
export function listElementTypes(): string[] {
  return Array.from(_registry.keys())
}

/** List all registered element definitions (ordered by registration). */
export function listElementDefinitions(): ElementDefinition[] {
  return Array.from(_registry.values())
}

/** Remove all registrations. Intended for use in tests only. */
export function _clearRegistry(): void {
  _registry.clear()
}

// ---------------------------------------------------------------------------
// Fallback (safe placeholder for unknown types)
// ---------------------------------------------------------------------------

function UnknownElement({ node, 'data-node-id': nodeId, className }: ElementRenderProps) {
  return React.createElement(
    'div',
    {
      'data-node-id': nodeId,
      className,
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 40,
        padding: '8px 12px',
        border: '2px dashed #f59e0b',
        borderRadius: 4,
        color: '#92400e',
        fontSize: 12,
        fontFamily: 'ui-monospace, monospace',
        background: '#fef3c7',
      },
    },
    `Unknown element: ${node.type}`,
  )
}

const FALLBACK_DEFINITION: ElementDefinition = {
  type: '__unknown__',
  label: 'Unknown Element',
  icon: 'tabler:help-circle',
  category: '',
  defaultProps: {},
  nesting: { acceptsChildren: false },
  render: UnknownElement,
}
