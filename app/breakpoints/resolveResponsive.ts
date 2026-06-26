import {
  findBreakpoint,
  isDesktopBreakpoint,
  type BreakpointConfig,
  type BreakpointId,
} from './config'
import { STYLE_STATES, type StyleState } from '@/document/schema/types'

export function isResponsiveObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && 'base' in value)
}

export function isStyleStateObject(value: unknown): value is Partial<Record<StyleState, unknown>> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false

  const keys = Object.keys(value)
  return keys.length > 0 && keys.every((key) => STYLE_STATES.includes(key as StyleState))
}

export function getStateValue(value: unknown, state: StyleState): unknown {
  if (!isStyleStateObject(value)) {
    return state === 'default' ? value : undefined
  }

  if (state !== 'default' && value[state] !== undefined) {
    return value[state]
  }

  return value.default
}

function cascadeIdsUntil(
  breakpoints: BreakpointConfig[],
  activeBreakpoint: BreakpointId,
): BreakpointId[] {
  if (isDesktopBreakpoint(activeBreakpoint)) return []

  const active = findBreakpoint(breakpoints, activeBreakpoint)
  if (!active) return [activeBreakpoint]

  return breakpoints
    .filter((breakpoint) => breakpoint.id !== 'desktop' && breakpoint.width >= active.width)
    .map((breakpoint) => breakpoint.id)
}

export function hasResponsiveOverride(value: unknown, breakpoint: BreakpointId): boolean {
  return isResponsiveObject(value) && breakpoint in value
}

export function hasResponsiveStyleOverride(
  value: unknown,
  state: StyleState,
  breakpoint: BreakpointId,
): boolean {
  return hasResponsiveOverride(getStateValue(value, state), breakpoint)
}

export function resolveResponsiveValue<T>(
  value: unknown,
  activeBreakpoint: BreakpointId,
  breakpoints: BreakpointConfig[],
  fallback: T,
): T {
  if (!isResponsiveObject(value)) {
    return (value as T | undefined) ?? fallback
  }

  let resolved = (value['base'] as T | undefined) ?? fallback
  for (const breakpointId of cascadeIdsUntil(breakpoints, activeBreakpoint)) {
    if (breakpointId in value) {
      resolved = (value[breakpointId] as T | undefined) ?? resolved
    }
  }
  return resolved
}

export function resolveResponsiveStyleValue<T>(
  value: unknown,
  state: StyleState,
  activeBreakpoint: BreakpointId,
  breakpoints: BreakpointConfig[],
  fallback: T,
): T {
  const stateValue = getStateValue(value, state)
  if (stateValue === undefined && state !== 'default') {
    return resolveResponsiveStyleValue(value, 'default', activeBreakpoint, breakpoints, fallback)
  }

  return resolveResponsiveValue(stateValue, activeBreakpoint, breakpoints, fallback)
}

export function getInheritedResponsiveValue<T>(
  value: unknown,
  activeBreakpoint: BreakpointId,
  breakpoints: BreakpointConfig[],
  fallback: T,
): T {
  if (isDesktopBreakpoint(activeBreakpoint)) {
    return resolveResponsiveValue(value, 'desktop', breakpoints, fallback)
  }

  const cascade = cascadeIdsUntil(breakpoints, activeBreakpoint)
  const inheritedBreakpoint = cascade[cascade.length - 2] ?? 'desktop'
  return resolveResponsiveValue(value, inheritedBreakpoint, breakpoints, fallback)
}

export function getInheritedResponsiveStyleValue<T>(
  value: unknown,
  state: StyleState,
  activeBreakpoint: BreakpointId,
  breakpoints: BreakpointConfig[],
  fallback: T,
): T {
  if (isDesktopBreakpoint(activeBreakpoint)) {
    return resolveResponsiveStyleValue(value, state, 'desktop', breakpoints, fallback)
  }

  const cascade = cascadeIdsUntil(breakpoints, activeBreakpoint)
  const inheritedBreakpoint = cascade[cascade.length - 2] ?? 'desktop'
  return resolveResponsiveStyleValue(value, state, inheritedBreakpoint, breakpoints, fallback)
}
