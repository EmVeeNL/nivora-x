/** Breakpoints that support responsive overrides (desktop/base is always the default). */
export type ResponsiveBreakpoint = string

/** Supported interaction states for style editing and CSS emission. */
export const STYLE_STATES = ['default', 'hover', 'focus', 'active'] as const

export type StyleState = (typeof STYLE_STATES)[number]

/**
 * A typed value that can vary per breakpoint.
 * `base` is the desktop default; breakpoints are optional overrides.
 */
export type ResponsiveValue<T> = { base: T } & {
  [K in ResponsiveBreakpoint]?: T
}

/**
 * A style value can optionally branch by interaction state.
 * The `default` state intentionally stays optional so legacy documents can keep
 * the pre-Phase-12 shape and remain valid without migration.
 */
export type StatefulStyleValue<T> = Partial<Record<StyleState, ResponsiveValue<T> | T>>

/** Authoring metadata attached to a node — not rendered on the front end. */
export interface NodeMeta {
  name?: string
  visible?: boolean
  locked?: boolean
}

/**
 * A single node in the editor tree.
 * `props` is an open map until Phase 05 introduces per-type schemas.
 * `overrides` holds breakpoint-specific partial prop overrides.
 */
export interface NxNode {
  id: string
  type: string
  props: Record<string, unknown>
  children: string[]
  overrides: { [K in ResponsiveBreakpoint]?: Record<string, unknown> }
  meta: NodeMeta
}

/** The complete node tree for one page. */
export interface DocumentTree {
  rootId: string
  nodes: Record<string, NxNode>
}

/**
 * The versioned document envelope.
 * Matches the shape written by Phase 02's PHP Envelope::to_json().
 */
export interface DocumentEnvelope {
  version: number
  tree: DocumentTree
  meta: Record<string, unknown>
}

/**
 * Wire format returned by the REST API.
 * tree is null for posts that have not been edited in NivoraX yet.
 */
export interface ApiEnvelope {
  version: number
  tree: DocumentTree | null
  meta: Record<string, unknown>
}
