import { describe, it, expect } from 'vitest'
import { resolveNodeStyles } from '@/canvas/style/resolveStyles'
import { spacingValue, unitValue } from '@/inspector/controls/valueUnits'
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
})
