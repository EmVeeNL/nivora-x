import type React from 'react'
import type { NxNode, ResponsiveBreakpoint } from '@/document/schema/types'
import type { ShadowValue } from '@/inspector/controls/types'
import { isSpacingValue, isUnitValue, unitToCss } from '@/inspector/controls/valueUnits'

export type ActiveStyleBreakpoint = 'base' | ResponsiveBreakpoint

const STYLE_PROPS = [
  'display',
  'flexDirection',
  'alignItems',
  'justifyContent',
  'gap',
  'margin',
  'padding',
  'width',
  'height',
  'minHeight',
  'maxWidth',
  'fontFamily',
  'fontSize',
  'fontWeight',
  'lineHeight',
  'color',
  'backgroundColor',
  'borderStyle',
  'borderWidth',
  'borderColor',
  'borderRadius',
  'boxShadow',
] as const

function resolveValue(value: unknown, breakpoint: ActiveStyleBreakpoint): unknown {
  if (value && typeof value === 'object' && 'base' in value) {
    const responsive = value as Record<string, unknown>
    return breakpoint === 'base'
      ? responsive['base']
      : (responsive[breakpoint] ?? responsive['base'])
  }
  return value
}

function isShadowValue(v: unknown): v is ShadowValue {
  return typeof v === 'object' && v !== null && 'offsetX' in v && 'offsetY' in v && 'blur' in v
}

function shadowToCss(v: ShadowValue): string {
  const parts: string[] = []
  if (v.inset) parts.push('inset')
  parts.push(unitToCss(v.offsetX))
  parts.push(unitToCss(v.offsetY))
  parts.push(unitToCss(v.blur))
  parts.push(unitToCss(v.spread))
  parts.push(v.color || 'rgba(0,0,0,0.2)')
  return parts.join(' ')
}

function toCssValue(value: unknown): string | number | undefined {
  if (isUnitValue(value)) return unitToCss(value)
  if (isShadowValue(value)) return shadowToCss(value)
  if (typeof value === 'string') return value !== '' ? value : undefined
  if (typeof value === 'number') return value
  return undefined
}

function applySpacing(
  result: React.CSSProperties,
  prop: 'margin' | 'padding',
  value: unknown,
): void {
  if (!isSpacingValue(value)) return
  result[`${prop}Top`] = unitToCss(value.top)
  result[`${prop}Right`] = unitToCss(value.right)
  result[`${prop}Bottom`] = unitToCss(value.bottom)
  result[`${prop}Left`] = unitToCss(value.left)
}

export function resolveNodeStyles(
  node: NxNode,
  breakpoint: ActiveStyleBreakpoint = 'base',
): React.CSSProperties {
  const result: React.CSSProperties = {}

  for (const prop of STYLE_PROPS) {
    const value = resolveValue(node.props[prop], breakpoint)
    if (prop === 'margin' || prop === 'padding') {
      applySpacing(result, prop, value)
      continue
    }

    const cssValue = toCssValue(value)
    if (cssValue !== undefined) {
      const cssResult = result as Record<string, string | number>
      cssResult[prop] = cssValue
    }
  }

  return result
}
