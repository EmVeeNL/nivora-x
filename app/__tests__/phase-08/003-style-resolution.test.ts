import { describe, it, expect } from 'vitest'
import { resolveNodeStyles } from '@/canvas/style/resolveStyles'
import {
  cornerUnitValue,
  sideColorValue,
  sideUnitValue,
  spacingValue,
  unitValue,
} from '@/inspector/controls/valueUnits'
import type { NxNode } from '@/document/schema/types'

function node(props: Record<string, unknown>): NxNode {
  return { id: 'node', type: 'section', props, children: [], overrides: {}, meta: {} }
}

describe('resolveNodeStyles', () => {
  it('converts unit values to CSS strings', () => {
    const styles = resolveNodeStyles(node({ width: unitValue(50, '%'), gap: unitValue(12) }))
    expect(styles.width).toBe('50%')
    expect(styles.gap).toBe('12px')
  })

  it('expands spacing values to side-specific CSS properties', () => {
    const styles = resolveNodeStyles(node({ padding: spacingValue(unitValue(8)) }))
    expect(styles.paddingTop).toBe('8px')
    expect(styles.paddingRight).toBe('8px')
  })

  it('resolves responsive base values for desktop', () => {
    const styles = resolveNodeStyles(
      node({ fontSize: { base: unitValue(16), mobile: unitValue(14) } }),
    )
    expect(styles.fontSize).toBe('16px')
  })

  it('resolves active breakpoint overrides when available', () => {
    const styles = resolveNodeStyles(
      node({ fontSize: { base: unitValue(16), mobile: unitValue(14) } }),
      'mobile',
    )
    expect(styles.fontSize).toBe('14px')
  })

  it('normalizes plain background image URLs into css url(...) values', () => {
    const styles = resolveNodeStyles(node({ backgroundImage: 'https://example.com/hero.jpg' }))
    expect(styles.backgroundImage).toBe('url("https://example.com/hero.jpg")')
  })

  it('keeps gradient background images as raw css functions', () => {
    const styles = resolveNodeStyles(
      node({ backgroundImage: 'linear-gradient(180deg, #111111 0%, #ffffff 100%)' }),
    )
    expect(styles.backgroundImage).toBe('linear-gradient(180deg, #111111 0%, #ffffff 100%)')
  })

  it('expands per-side border widths and colors', () => {
    const styles = resolveNodeStyles(
      node({
        borderWidth: sideUnitValue(unitValue(2)),
        borderColor: sideColorValue('#111111'),
      }),
    )
    expect(styles.borderTopWidth).toBe('2px')
    expect(styles.borderLeftColor).toBe('#111111')
  })

  it('expands per-corner border radius values', () => {
    const corners = cornerUnitValue(unitValue(0))
    corners.topLeft = unitValue(12)
    const styles = resolveNodeStyles(node({ borderRadius: corners }))
    expect(styles.borderTopLeftRadius).toBe('12px')
    expect(styles.borderBottomRightRadius).toBe('0px')
  })
})
