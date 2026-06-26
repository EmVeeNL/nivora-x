/**
 * JS CSS generator — editor live path.
 *
 * Converts a DocumentTree + BreakpointConfig list into a scoped CSS string
 * following the canonical rules in `rules.ts`. This is injected into the
 * editor iframe (Task 006) and serves as the reference for the PHP generator
 * verified by the parity fixture harness (Task 007).
 */

import type { DocumentTree, NxNode } from '@/document/schema/types'
import type { BreakpointConfig } from '@/breakpoints/config'
import type { DesignToken } from '@/tokens/model'
import { isTokenRef } from '@/tokens/model'
import { STYLE_PROP_ORDER, propToDeclarations } from './rules'
import { tokensToCssVars } from '@/tokens/cssVars'
import { getStateValue, isResponsiveObject } from '@/breakpoints/resolveResponsive'

// ---------------------------------------------------------------------------
// Token reference resolution
// ---------------------------------------------------------------------------

/**
 * Resolve a style prop value: if it is a TokenRef, return `var(--nx-{id})`.
 * All other values are returned unchanged for normal CSS serialisation.
 */
function resolveTokenRef(value: unknown): unknown {
  if (isTokenRef(value)) return `var(--nx-${value.__token})`
  return value
}

/**
 * Extract the base (desktop) concrete value from a prop.
 * Handles legacy values, responsive objects, and Phase 12 stateful values.
 */
function baseValue(raw: unknown): unknown {
  const defaultStateValue = getStateValue(raw, 'default')
  if (isResponsiveObject(defaultStateValue)) return defaultStateValue['base'] ?? undefined
  return defaultStateValue
}

/**
 * Extract breakpoint-specific override value.
 * Returns undefined when no override is set for the given breakpoint.
 */
function overrideValue(raw: unknown, breakpointId: string): unknown {
  const defaultStateValue = getStateValue(raw, 'default')
  if (!isResponsiveObject(defaultStateValue)) return undefined
  return breakpointId in defaultStateValue ? defaultStateValue[breakpointId] : undefined
}

// ---------------------------------------------------------------------------
// CSS block building
// ---------------------------------------------------------------------------

/**
 * Build a CSS declaration block string from an array of `[prop, value]` tuples.
 * Returns an empty string when there are no declarations.
 */
function buildBlock(declarations: Array<[string, string]>): string {
  if (declarations.length === 0) return ''
  return declarations.map(([p, v]) => `${p}:${v}`).join(';')
}

/**
 * Build the base (desktop) CSS declarations for a node from its props.
 */
function nodeBaseDeclarations(node: NxNode): Array<[string, string]> {
  const declarations: Array<[string, string]> = []
  for (const prop of STYLE_PROP_ORDER) {
    const raw = node.props[prop]
    const value = resolveTokenRef(baseValue(raw))
    declarations.push(...propToDeclarations(prop, value))
  }
  return declarations
}

/**
 * Build override declarations for a node at a specific breakpoint,
 * covering both responsive prop objects and node.overrides.
 */
function nodeOverrideDeclarations(node: NxNode, breakpointId: string): Array<[string, string]> {
  const declarations: Array<[string, string]> = []

  // Responsive style prop objects stored in node.props.
  for (const prop of STYLE_PROP_ORDER) {
    const raw = node.props[prop]
    const value = overrideValue(raw, breakpointId)
    if (value !== undefined) {
      declarations.push(...propToDeclarations(prop, resolveTokenRef(value)))
    }
  }

  // node.overrides[breakpointId] — non-style prop overrides at this breakpoint.
  const bpOverrides = node.overrides[breakpointId]
  if (bpOverrides) {
    for (const prop of STYLE_PROP_ORDER) {
      if (prop in bpOverrides) {
        const value = bpOverrides[prop]
        declarations.push(...propToDeclarations(prop, resolveTokenRef(value)))
      }
    }
  }

  return declarations
}

// ---------------------------------------------------------------------------
// Per-node CSS generation
// ---------------------------------------------------------------------------

interface GeneratedNodeCss {
  base: string
  /** Map of breakpointId → CSS declarations block (no media query wrapper). */
  overrides: Map<string, string>
}

function generateNodeCss(node: NxNode, breakpoints: BreakpointConfig[]): GeneratedNodeCss {
  const selector = `.nivorax-${node.id}`

  const baseDecls = nodeBaseDeclarations(node)
  const base = baseDecls.length ? `${selector}{${buildBlock(baseDecls)}}` : ''

  const overrides = new Map<string, string>()
  // Skip the first breakpoint (desktop/base); it's the base rule.
  for (const bp of breakpoints.slice(1)) {
    const decls = nodeOverrideDeclarations(node, bp.id)
    if (decls.length) {
      overrides.set(bp.id, `${selector}{${buildBlock(decls)}}`)
    }
  }

  return { base, overrides }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generate scoped, deterministic CSS for a full document tree.
 *
 * When `tokens` is supplied, a `:root{--nx-*}` variables block is prepended
 * so token references (`var(--nx-{id})`) cascade correctly.
 *
 * Output order:
 *   0. Token variables block (`:root{…}`) — if tokens provided.
 *   1. Base (desktop) rules — all nodes, in tree depth-first order.
 *   2. Responsive overrides — one `@media (max-width)` block per
 *      breakpoint (narrowest-last so mobile overrides are most specific).
 */
export function generateCss(
  tree: DocumentTree,
  breakpoints: BreakpointConfig[],
  tokens?: DesignToken[],
): string {
  if (Object.keys(tree.nodes).length === 0) return ''

  const nodeIds = Object.keys(tree.nodes)
  const parts: string[] = []
  const mediaBlocks = new Map<string, string[]>()

  if (tokens && tokens.length > 0) {
    const vars = tokensToCssVars(tokens)
    if (vars) parts.push(vars)
  }

  for (const nodeId of nodeIds) {
    const node = tree.nodes[nodeId]
    if (!node) continue

    const { base, overrides } = generateNodeCss(node, breakpoints)
    if (base) parts.push(base)

    for (const [bpId, block] of overrides) {
      const existing = mediaBlocks.get(bpId) ?? []
      existing.push(block)
      mediaBlocks.set(bpId, existing)
    }
  }

  // Emit @media blocks in descending-width order (widest non-desktop first).
  const nonDesktop = breakpoints.slice(1).sort((a, b) => b.width - a.width)
  for (const bp of nonDesktop) {
    const blocks = mediaBlocks.get(bp.id)
    if (blocks && blocks.length) {
      parts.push(`@media (max-width:${bp.width}px){${blocks.join('')}}`)
    }
  }

  return parts.join('')
}

/**
 * Generate CSS for a single node (used by the editor for live preview
 * of the currently selected node).
 */
export function generateNodeCssString(node: NxNode, breakpoints: BreakpointConfig[]): string {
  const { base, overrides } = generateNodeCss(node, breakpoints)
  const parts: string[] = []
  if (base) parts.push(base)

  const nonDesktop = breakpoints.slice(1).sort((a, b) => b.width - a.width)
  for (const bp of nonDesktop) {
    const block = overrides.get(bp.id)
    if (block) {
      parts.push(`@media (max-width:${bp.width}px){${block}}`)
    }
  }

  return parts.join('')
}
