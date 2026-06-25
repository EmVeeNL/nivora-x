import type { UnitValue, ShadowValue } from '@/inspector/controls/types'

// ---------------------------------------------------------------------------
// Token type system
// ---------------------------------------------------------------------------

export type TokenGroup = 'color' | 'typography' | 'spacing' | 'effect'

/**
 * The concrete value stored on a token.
 * - color  → CSS color string (e.g. `#3b82f6`)
 * - typography → font-family CSS string, UnitValue (size), or numeric string (weight)
 * - spacing → UnitValue
 * - effect  → UnitValue (radius) or ShadowValue
 */
export type TokenValue = string | UnitValue | ShadowValue

export interface DesignToken {
  id: string
  group: TokenGroup
  name: string
  value: TokenValue
}

// ---------------------------------------------------------------------------
// Token reference (stored in node.props in place of a concrete value)
// ---------------------------------------------------------------------------

/** Sentinel stored on a node's style prop when it references a design token. */
export interface TokenRef {
  __token: string
}

export function isTokenRef(v: unknown): v is TokenRef {
  return (
    typeof v === 'object' &&
    v !== null &&
    '__token' in v &&
    typeof (v as Record<string, unknown>)['__token'] === 'string'
  )
}

export function makeTokenRef(id: string): TokenRef {
  return { __token: id }
}
