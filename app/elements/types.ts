import type React from 'react'
import type { NxNode } from '@/document/schema/types'
import type { ElementControlSchema } from '@/inspector/controls/types'

/** Props passed to every element's React render component. */
export interface ElementRenderProps {
  node: NxNode
  children?: React.ReactNode
  /** Canvas data attribute — must be placed on the element's root DOM node. */
  'data-node-id': string
  /**
   * Scoped CSS class — `nivorax-{nodeId}`. The generated CSS targets this
   * selector instead of inline styles (Phase 10+). Elements must spread it
   * onto their root DOM node so `generateCss()` rules apply.
   */
  className?: string
  /**
   * Editor-resolved inline styles. Kept for element-component structural
   * defaults; user-set styles now come via injected generated CSS (Phase 10).
   */
  style?: React.CSSProperties
}

/** Nesting constraints for an element type. */
export interface NestingRules {
  /** Whether this element can hold child nodes. */
  acceptsChildren: boolean
  /**
   * Restricts which element types are allowed as direct children.
   * When undefined (and acceptsChildren is true), any registered type is accepted.
   */
  allowedChildTypes?: string[]
}

/** One configurable field shown in the insert config modal. */
export interface InsertConfigField {
  id: string
  label: string
  /** Key in defaultProps where this value is stored. */
  prop: string
  type: 'number' | 'select'
  defaultValue: unknown
  min?: number
  max?: number
  step?: number
  options?: Array<{ label: string; value: string }>
}

/** If set on an ElementDefinition, the editor shows a config modal before inserting. */
export interface InsertConfig {
  title: string
  fields: InsertConfigField[]
}

/**
 * Full definition of a NivoraX element type — the extensibility seam.
 * One definition per type; register via registerElement() in registry.ts.
 *
 * Parity slots (phpRender, controlSchema) are typed but optional so
 * Phase 08 and Phase 10 can fill them without changing existing registrations.
 */
export interface ElementDefinition {
  type: string
  label: string
  /** Iconify icon ID (e.g. 'tabler:section') used in the element library and navigator. */
  icon: string
  /** Library category (e.g. 'Layout', 'Content'). Used to group elements in the palette. */
  category: string
  defaultProps: Record<string, unknown>
  nesting: NestingRules
  render: React.ComponentType<ElementRenderProps>
  /** If set, the editor shows a config modal before inserting this element. */
  insertConfig?: InsertConfig
  /** Phase 10 slot: PHP-side render function. Unimplemented until Phase 10. */
  phpRender?: unknown
  /** Phase 08 slot: inspector control descriptors. Unimplemented until Phase 08. */
  controlSchema?: ElementControlSchema
}
