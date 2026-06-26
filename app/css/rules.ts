/**
 * Canonical CSS generation rules — the single contract shared by the JS
 * generator (editor live) and the PHP generator (front-end cached).
 *
 * Both generators MUST follow these rules identically so that fixtures can
 * verify their outputs are equal.
 *
 * RULES
 * -----
 * 1. Scoping: each node emits CSS under the selector `.nivorax-{id}`.
 * 2. Cascade direction: desktop-first. The base rule covers desktop.
 *    Narrower breakpoints emit `@media (max-width: {width}px)` rules.
 * 3. Only props with a concrete value are emitted (no empty declarations).
 * 4. Output is deterministic: props follow STYLE_PROP_ORDER; breakpoints
 *    follow descending-width order matching the configured breakpoint list.
 * 5. Token references resolve to concrete values before emission
 *    (token manager is Phase 11; for now, values are always concrete).
 * 6. Spacing values (margin / padding) expand to the four longhand props.
 * 7. Unit values serialise as `{value}{unit}` (e.g. `24px`, `1.5rem`).
 * 8. Shadow values serialise as `{inset?} {offsetX} {offsetY} {blur} {spread} {color}`.
 */

import type {
  CornerUnitValue,
  CssUnit,
  SideColorValue,
  SideUnitValue,
  UnitValue,
  SpacingValue,
  ShadowValue,
} from '@/inspector/controls/types'
import {
  isCornerUnitValue,
  isSideColorValue,
  isSideUnitValue,
  isUnitValue,
  isSpacingValue,
  unitToCss,
} from '@/inspector/controls/valueUnits'

// ---------------------------------------------------------------------------
// Style prop ordering (rule 4)
// ---------------------------------------------------------------------------

export const STYLE_PROP_ORDER = [
  'display',
  'flexDirection',
  'alignItems',
  'justifyContent',
  'gap',
  'width',
  'height',
  'minHeight',
  'maxWidth',
  'margin',
  'padding',
  'fontFamily',
  'fontSize',
  'fontWeight',
  'lineHeight',
  'color',
  'backgroundColor',
  'backgroundImage',
  'backgroundPosition',
  'backgroundSize',
  'backgroundRepeat',
  'borderStyle',
  'borderWidth',
  'borderColor',
  'borderRadius',
  'boxShadow',
] as const

export type StyleProp = (typeof STYLE_PROP_ORDER)[number]

// ---------------------------------------------------------------------------
// CSS property name map (camelCase → kebab-case, rule 1)
// ---------------------------------------------------------------------------

export const CSS_PROP_MAP: Readonly<Record<string, string>> = {
  display: 'display',
  flexDirection: 'flex-direction',
  alignItems: 'align-items',
  justifyContent: 'justify-content',
  gap: 'gap',
  width: 'width',
  height: 'height',
  minHeight: 'min-height',
  maxWidth: 'max-width',
  marginTop: 'margin-top',
  marginRight: 'margin-right',
  marginBottom: 'margin-bottom',
  marginLeft: 'margin-left',
  paddingTop: 'padding-top',
  paddingRight: 'padding-right',
  paddingBottom: 'padding-bottom',
  paddingLeft: 'padding-left',
  fontFamily: 'font-family',
  fontSize: 'font-size',
  fontWeight: 'font-weight',
  lineHeight: 'line-height',
  color: 'color',
  backgroundColor: 'background-color',
  backgroundImage: 'background-image',
  backgroundPosition: 'background-position',
  backgroundSize: 'background-size',
  backgroundRepeat: 'background-repeat',
  borderStyle: 'border-style',
  borderWidth: 'border-width',
  borderColor: 'border-color',
  borderRadius: 'border-radius',
  boxShadow: 'box-shadow',
} as const

function normalizeBackgroundImage(value: string): string {
  const trimmed = value.trim()
  if (trimmed === '') return trimmed

  const cssFunctionPrefixes = ['url(', 'linear-gradient(', 'radial-gradient(', 'conic-gradient(']
  if (cssFunctionPrefixes.some((prefix) => trimmed.startsWith(prefix))) {
    return trimmed
  }

  return `url("${trimmed.replace(/"/g, '\\"')}")`
}

// ---------------------------------------------------------------------------
// Value serialisation helpers (rules 6, 7, 8)
// ---------------------------------------------------------------------------

function isShadowValue(v: unknown): v is ShadowValue {
  return (
    typeof v === 'object' &&
    v !== null &&
    'offsetX' in v &&
    'offsetY' in v &&
    'blur' in v &&
    'spread' in v
  )
}

export function shadowValueToCss(v: ShadowValue): string {
  const parts: string[] = []
  if (v.inset) parts.push('inset')
  parts.push(unitToCss(v.offsetX))
  parts.push(unitToCss(v.offsetY))
  parts.push(unitToCss(v.blur))
  parts.push(unitToCss(v.spread))
  parts.push(v.color || 'rgba(0,0,0,0.2)')
  return parts.join(' ')
}

/**
 * Serialise a single style value to a CSS string.
 * Returns undefined when the value is absent or cannot be serialised.
 */
export function toCssString(value: unknown): string | undefined {
  if (value === null || value === undefined || value === '') return undefined
  if (isUnitValue(value)) return unitToCss(value)
  if (isShadowValue(value)) return shadowValueToCss(value)
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
  return undefined
}

/**
 * Expand a spacing value to four longhand CSS declarations.
 * Returns an array of `[cssProp, cssValue]` tuples, or empty if invalid.
 */
export function expandSpacing(prop: 'margin' | 'padding', value: unknown): Array<[string, string]> {
  if (!isSpacingValue(value)) return []
  return [
    [`${prop}-top`, unitToCss(value.top)],
    [`${prop}-right`, unitToCss(value.right)],
    [`${prop}-bottom`, unitToCss(value.bottom)],
    [`${prop}-left`, unitToCss(value.left)],
  ]
}

export function expandBorderSides(
  prop: 'borderWidth' | 'borderColor',
  value: unknown,
): Array<[string, string]> {
  if (prop === 'borderWidth') {
    if (!isSideUnitValue(value)) return []
    const sides: Array<keyof SideUnitValue> = ['top', 'right', 'bottom', 'left']
    return sides.map((side) => [`border-${side}-width`, unitToCss(value[side])])
  }

  if (!isSideColorValue(value)) return []
  const sides: Array<keyof SideColorValue> = ['top', 'right', 'bottom', 'left']
  return sides.map((side) => [`border-${side}-color`, value[side]])
}

export function expandBorderRadius(value: unknown): Array<[string, string]> {
  if (!isCornerUnitValue(value)) return []

  const corners: Array<[keyof CornerUnitValue, string]> = [
    ['topLeft', 'border-top-left-radius'],
    ['topRight', 'border-top-right-radius'],
    ['bottomRight', 'border-bottom-right-radius'],
    ['bottomLeft', 'border-bottom-left-radius'],
  ]

  return corners.map(([corner, cssProp]) => [cssProp, unitToCss(value[corner])])
}

/**
 * Convert a single style prop + value to CSS declarations.
 * Handles spacing expansion (rule 6) and value serialisation (rules 7–8).
 * Returns an array of `[cssProp, cssValue]` tuples.
 */
export function propToDeclarations(prop: StyleProp, value: unknown): Array<[string, string]> {
  if (value === null || value === undefined) return []

  if (prop === 'margin' || prop === 'padding') {
    const expanded = expandSpacing(prop, value)
    if (expanded.length) return expanded
    return []
  }

  if (prop === 'borderWidth' || prop === 'borderColor') {
    const expanded = expandBorderSides(prop, value)
    if (expanded.length) return expanded
  }

  if (prop === 'borderRadius') {
    const expanded = expandBorderRadius(value)
    if (expanded.length) return expanded
  }

  if (prop === 'backgroundImage') {
    if (typeof value !== 'string' || value.trim() === '') return []
    const cssProp = CSS_PROP_MAP[prop]
    if (!cssProp) return []
    return [[cssProp, normalizeBackgroundImage(value)]]
  }

  const cssValue = toCssString(value)
  if (cssValue === undefined) return []

  const cssProp = CSS_PROP_MAP[prop]
  if (!cssProp) return []

  return [[cssProp, cssValue]]
}

// Re-export CSS_UNITS for PHP-side reference.
export type { CssUnit, UnitValue, SpacingValue, ShadowValue }
