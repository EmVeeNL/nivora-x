import { describe, it, expect } from 'vitest'
import { tokensToCssVars } from '@/tokens/cssVars'
import { generateCss } from '@/css/generate'
import { makeTokenRef } from '@/tokens/model'
import type { DesignToken } from '@/tokens/model'
import type { DocumentTree } from '@/document/schema/types'
import type { BreakpointConfig } from '@/breakpoints/config'

const BREAKPOINTS: BreakpointConfig[] = [
  { id: 'desktop', label: 'Desktop', width: 9999, icon: 'monitor' },
]

function makeTree(props: Record<string, unknown>): DocumentTree {
  return {
    rootId: 'root',
    nodes: {
      root: { id: 'root', type: '__root__', props: {}, overrides: {}, children: ['n1'] },
      n1: { id: 'n1', type: 'section', props, overrides: {}, children: [] },
    },
  }
}

const TOKENS: DesignToken[] = [
  { id: 'color-primary', group: 'color', name: 'Primary', value: '#3b82f6' },
  { id: 'spacing-md', group: 'spacing', name: 'Medium', value: { value: 16, unit: 'px' } },
  { id: 'font-sans', group: 'typography', name: 'Sans', value: 'system-ui, sans-serif' },
]

// ---------------------------------------------------------------------------
// tokensToCssVars
// ---------------------------------------------------------------------------

describe('tokensToCssVars', () => {
  it('emits a :root block with one variable per token', () => {
    const css = tokensToCssVars(TOKENS)
    expect(css).toContain(':root{')
    expect(css).toContain('--nx-color-primary:#3b82f6')
    expect(css).toContain('--nx-spacing-md:16px')
    expect(css).toContain('--nx-font-sans:system-ui, sans-serif')
  })

  it('returns an empty string for an empty token list', () => {
    expect(tokensToCssVars([])).toBe('')
  })

  it('uses the token id (not name) as the variable name', () => {
    const css = tokensToCssVars([
      { id: 'my-token', group: 'color', name: 'My Token', value: '#fff' },
    ])
    expect(css).toContain('--nx-my-token:#fff')
    expect(css).not.toContain('--nx-My Token')
  })
})

// ---------------------------------------------------------------------------
// generateCss — token variable block
// ---------------------------------------------------------------------------

describe('generateCss with tokens', () => {
  it('prepends the :root variables block when tokens are supplied', () => {
    const tree = makeTree({ color: '#111' })
    const css = generateCss(tree, BREAKPOINTS, TOKENS)
    expect(css.startsWith(':root{')).toBe(true)
    expect(css).toContain('--nx-color-primary:#3b82f6')
  })

  it('does not emit a :root block when no tokens are supplied', () => {
    const tree = makeTree({ color: '#111' })
    const css = generateCss(tree, BREAKPOINTS)
    expect(css).not.toContain(':root{')
  })

  it('resolves a color token reference to var(--nx-{id})', () => {
    const tree = makeTree({ color: makeTokenRef('color-primary') })
    const css = generateCss(tree, BREAKPOINTS, TOKENS)
    expect(css).toContain('color:var(--nx-color-primary)')
  })

  it('keeps raw values as-is when no token ref is used', () => {
    const tree = makeTree({ color: '#ff0000' })
    const css = generateCss(tree, BREAKPOINTS, TOKENS)
    expect(css).toContain('color:#ff0000')
    expect(css).not.toContain('var(')
  })

  it('resolves a responsive token reference at a breakpoint override', () => {
    const tree: DocumentTree = {
      rootId: 'root',
      nodes: {
        root: { id: 'root', type: '__root__', props: {}, overrides: {}, children: ['n1'] },
        n1: {
          id: 'n1',
          type: 'section',
          props: { color: { base: '#000', tablet: makeTokenRef('color-primary') } },
          overrides: {},
          children: [],
        },
      },
    }
    const bps: BreakpointConfig[] = [
      { id: 'desktop', label: 'Desktop', width: 9999, icon: 'monitor' },
      { id: 'tablet', label: 'Tablet', width: 768, icon: 'tablet' },
    ]
    const css = generateCss(tree, bps, TOKENS)
    expect(css).toContain('@media (max-width:768px){')
    expect(css).toContain('color:var(--nx-color-primary)')
  })

  it('output is deterministic (same input → same output)', () => {
    const tree = makeTree({ color: makeTokenRef('color-primary'), backgroundColor: '#fff' })
    const a = generateCss(tree, BREAKPOINTS, TOKENS)
    const b = generateCss(tree, BREAKPOINTS, TOKENS)
    expect(a).toBe(b)
  })
})
