import type { DesignToken, TokenMode } from './model'
import { DEFAULT_MODE } from './model'
import { toCssString } from '@/css/rules'

function tokenValueToCss(token: DesignToken, modeId?: string): string {
  const v =
    modeId && modeId !== DEFAULT_MODE.id ? (token.modeValues?.[modeId] ?? token.value) : token.value
  return toCssString(v) ?? ''
}

/**
 * Emit the full `:root` CSS custom property block for a token set,
 * plus optional per-mode override blocks.
 *
 * - Default values → `:root { --nx-{id}: {value}; }`
 * - Per-mode overrides → `[data-nx-mode="{id}"] { --nx-{id}: {override}; }`
 */
export function tokensToCssVars(tokens: DesignToken[], modes?: TokenMode[]): string {
  if (tokens.length === 0) return ''

  // Default / base values
  const rootVars = tokens
    .map((t) => {
      const v = tokenValueToCss(t)
      return v ? `--nx-${t.id}:${v}` : null
    })
    .filter((s): s is string => s !== null)
    .join(';')

  let out = rootVars ? `:root{${rootVars}}` : ''

  // Per-mode override blocks
  if (modes) {
    for (const mode of modes) {
      if (mode.id === DEFAULT_MODE.id) continue

      const modeVars = tokens
        .map((t) => {
          const override = t.modeValues?.[mode.id]
          if (override === undefined) return null
          const v = toCssString(override) ?? ''
          return v ? `--nx-${t.id}:${v}` : null
        })
        .filter((s): s is string => s !== null)
        .join(';')

      if (modeVars) {
        out += `[data-nx-mode="${mode.id}"]{${modeVars}}`
      }
    }
  }

  return out
}
