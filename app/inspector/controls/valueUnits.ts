import { CSS_UNITS, type CssUnit, type SpacingValue, type UnitValue } from './types'

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
