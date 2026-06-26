import {
  CSS_UNITS,
  type CornerUnitValue,
  type CssUnit,
  type SideColorValue,
  type SideUnitValue,
  type SpacingValue,
  type UnitValue,
} from './types'

export const DEFAULT_UNIT: CssUnit = 'px'

export function isCssUnit(value: unknown): value is CssUnit {
  return typeof value === 'string' && (CSS_UNITS as readonly string[]).includes(value)
}

export function unitValue(value = 0, unit: CssUnit = DEFAULT_UNIT): UnitValue {
  return { value, unit }
}

export function isUnitValue(value: unknown): value is UnitValue {
  if (!value || typeof value !== 'object') return false
  const record = value as Record<string, unknown>
  return typeof record['value'] === 'number' && isCssUnit(record['unit'])
}

export function normalizeUnitValue(value: unknown, fallback: UnitValue = unitValue()): UnitValue {
  return isUnitValue(value) ? value : fallback
}

export function unitToCss(value: UnitValue): string {
  return `${String(value.value)}${value.unit}`
}

export function spacingValue(value: UnitValue = unitValue()): SpacingValue {
  return { top: value, right: value, bottom: value, left: value }
}

export function sideUnitValue(value: UnitValue = unitValue()): SideUnitValue {
  return { top: value, right: value, bottom: value, left: value }
}

export function sideColorValue(value = ''): SideColorValue {
  return { top: value, right: value, bottom: value, left: value }
}

export function cornerUnitValue(value: UnitValue = unitValue()): CornerUnitValue {
  return { topLeft: value, topRight: value, bottomRight: value, bottomLeft: value }
}

export function isSpacingValue(value: unknown): value is SpacingValue {
  if (!value || typeof value !== 'object') return false
  const record = value as Record<string, unknown>
  return (
    isUnitValue(record['top']) &&
    isUnitValue(record['right']) &&
    isUnitValue(record['bottom']) &&
    isUnitValue(record['left'])
  )
}

export function normalizeSpacingValue(
  value: unknown,
  fallback: SpacingValue = spacingValue(),
): SpacingValue {
  return isSpacingValue(value) ? value : fallback
}

export function isSideUnitValue(value: unknown): value is SideUnitValue {
  if (!value || typeof value !== 'object') return false
  const record = value as Record<string, unknown>
  return (
    isUnitValue(record['top']) &&
    isUnitValue(record['right']) &&
    isUnitValue(record['bottom']) &&
    isUnitValue(record['left'])
  )
}

export function normalizeSideUnitValue(
  value: unknown,
  fallback: SideUnitValue = sideUnitValue(),
): SideUnitValue {
  return isSideUnitValue(value) ? value : fallback
}

export function isSideColorValue(value: unknown): value is SideColorValue {
  if (!value || typeof value !== 'object') return false
  const record = value as Record<string, unknown>
  return (
    typeof record['top'] === 'string' &&
    typeof record['right'] === 'string' &&
    typeof record['bottom'] === 'string' &&
    typeof record['left'] === 'string'
  )
}

export function normalizeSideColorValue(
  value: unknown,
  fallback: SideColorValue = sideColorValue(),
): SideColorValue {
  return isSideColorValue(value) ? value : fallback
}

export function isCornerUnitValue(value: unknown): value is CornerUnitValue {
  if (!value || typeof value !== 'object') return false
  const record = value as Record<string, unknown>
  return (
    isUnitValue(record['topLeft']) &&
    isUnitValue(record['topRight']) &&
    isUnitValue(record['bottomRight']) &&
    isUnitValue(record['bottomLeft'])
  )
}

export function normalizeCornerUnitValue(
  value: unknown,
  fallback: CornerUnitValue = cornerUnitValue(),
): CornerUnitValue {
  return isCornerUnitValue(value) ? value : fallback
}
