import type { DesignToken } from './model'
import { toCssString } from '@/css/rules'

/**
 * Convert a token value (string, UnitValue, or ShadowValue) to a CSS string.
 * Returns an empty string if the value cannot be serialised.
 */
function tokenValueToCss(token: DesignToken): string {
  return toCssString(token.value) ?? ''
}

/**
 * Emit the full `:root` CSS custom property block for a token set.
 * Each token maps to `--nx-{id}: {value}`.
 * Returns an empty string when the token list is empty.
 */
export function tokensToCssVars(tokens: DesignToken[]): string {
  if (tokens.length === 0) return ''
  const vars = tokens
    .map((t) => {
      const v = tokenValueToCss(t)
      return v ? `--nx-${t.id}:${v}` : null
    })
    .filter((s): s is string => s !== null)
    .join(';')
  return vars ? `:root{${vars}}` : ''
}
