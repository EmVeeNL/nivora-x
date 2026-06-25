import {
  findBreakpoint,
  isDesktopBreakpoint,
  type BreakpointConfig,
  type BreakpointId,
} from './config'

function isResponsiveObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && 'base' in value)
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
