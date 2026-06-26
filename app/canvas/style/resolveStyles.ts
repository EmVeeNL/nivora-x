import type React from 'react'
import type { NxNode, StyleState } from '@/document/schema/types'
import type { ShadowValue } from '@/inspector/controls/types'
import {
  isCornerUnitValue,
  isSideColorValue,
  isSideUnitValue,
  isSpacingValue,
  isUnitValue,
  unitToCss,
} from '@/inspector/controls/valueUnits'
import type { BreakpointConfig, BreakpointId } from '@/breakpoints/config'
import { resolveResponsiveStyleValue } from '@/breakpoints/resolveResponsive'
import { useUiStore } from '@/state/uiStore'

export type ActiveStyleBreakpoint = BreakpointId

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

function resolveValue(
  value: unknown,
  state: StyleState,
  breakpoint: ActiveStyleBreakpoint,
  breakpoints: BreakpointConfig[],
): unknown {
  return resolveResponsiveStyleValue(value, state, breakpoint, breakpoints, undefined)
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

function normalizeBackgroundImage(value: string): string | undefined {
  const trimmed = value.trim()
  if (trimmed === '') return undefined

  const cssFunctionPrefixes = ['url(', 'linear-gradient(', 'radial-gradient(', 'conic-gradient(']
  if (cssFunctionPrefixes.some((prefix) => trimmed.startsWith(prefix))) {
    return trimmed
  }

  return `url("${trimmed.replace(/"/g, '\\"')}")`
}

function toCssValue(
  prop: (typeof STYLE_PROPS)[number],
  value: unknown,
): string | number | undefined {
  if (isUnitValue(value)) return unitToCss(value)
  if (isShadowValue(value)) return shadowToCss(value)
  if (prop === 'backgroundImage' && typeof value === 'string')
    return normalizeBackgroundImage(value)
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

function applyBorderSides(
  result: React.CSSProperties,
  prop: 'borderWidth' | 'borderColor',
  value: unknown,
): void {
  if (prop === 'borderWidth') {
    if (!isSideUnitValue(value)) return
    result.borderTopWidth = unitToCss(value.top)
    result.borderRightWidth = unitToCss(value.right)
    result.borderBottomWidth = unitToCss(value.bottom)
    result.borderLeftWidth = unitToCss(value.left)
    return
  }

  if (!isSideColorValue(value)) return
  result.borderTopColor = value.top
  result.borderRightColor = value.right
  result.borderBottomColor = value.bottom
  result.borderLeftColor = value.left
}

function applyBorderRadius(result: React.CSSProperties, value: unknown): void {
  if (!isCornerUnitValue(value)) return
  result.borderTopLeftRadius = unitToCss(value.topLeft)
  result.borderTopRightRadius = unitToCss(value.topRight)
  result.borderBottomRightRadius = unitToCss(value.bottomRight)
  result.borderBottomLeftRadius = unitToCss(value.bottomLeft)
}

export function resolveHiddenAtBreakpoint(
  node: NxNode,
  breakpoint: ActiveStyleBreakpoint,
  breakpoints: BreakpointConfig[] = useUiStore.getState().breakpoints,
  state: StyleState = useUiStore.getState().activeStyleState,
): boolean {
  const raw = node.props['hidden']
  if (raw === null || raw === undefined) return false
  if (typeof raw === 'boolean') return raw
  const val = resolveResponsiveStyleValue<boolean>(raw, state, breakpoint, breakpoints, false)
  return val === true
}

export function resolveNodeStyles(
  node: NxNode,
  breakpoint: ActiveStyleBreakpoint = 'desktop',
  breakpoints: BreakpointConfig[] = useUiStore.getState().breakpoints,
  state: StyleState = useUiStore.getState().activeStyleState,
): React.CSSProperties {
  const result: React.CSSProperties = {}

  for (const prop of STYLE_PROPS) {
    const value = resolveValue(node.props[prop], state, breakpoint, breakpoints)
    if (prop === 'margin' || prop === 'padding') {
      applySpacing(result, prop, value)
      continue
    }

    if (prop === 'borderWidth' || prop === 'borderColor') {
      applyBorderSides(result, prop, value)
      continue
    }

    if (prop === 'borderRadius') {
      applyBorderRadius(result, value)
      continue
    }

    const cssValue = toCssValue(prop, value)
    if (cssValue !== undefined) {
      const cssResult = result as Record<string, string | number>
      cssResult[prop] = cssValue
    }
  }

  return result
}
