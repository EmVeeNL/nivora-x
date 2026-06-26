import { describe, it, expect } from 'vitest'
import { generateCss, generateNodeCssString } from '@/css/generate'
import {
  propToDeclarations,
  toCssString,
  expandBorderRadius,
  expandBorderSides,
  expandSpacing,
} from '@/css/rules'
import type { DocumentTree, NxNode } from '@/document/schema/types'
import type { BreakpointConfig } from '@/breakpoints/config'

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

const BREAKPOINTS: BreakpointConfig[] = [
  { id: 'desktop', label: 'Desktop', width: 1440, direction: 'max', builtin: true },
  { id: 'tablet', label: 'Tablet', width: 768, direction: 'max', builtin: true },
  { id: 'mobile', label: 'Mobile', width: 375, direction: 'max', builtin: true },
]

function makeNode(id: string, props: Record<string, unknown> = {}): NxNode {
  return {
    id,
    type: 'section',
    props,
    children: [],
    overrides: {},
    meta: {},
  }
}

function makeTree(nodes: NxNode[], rootId?: string): DocumentTree {
  const nodeMap: Record<string, NxNode> = {}
  for (const n of nodes) nodeMap[n.id] = n
  return {
    rootId: rootId ?? nodes[0]?.id ?? 'root',
    nodes: nodeMap,
  }
}

// ---------------------------------------------------------------------------
// rules.ts — value serialisation
// ---------------------------------------------------------------------------

describe('toCssString', () => {
  it('serialises plain strings', () => {
    expect(toCssString('block')).toBe('block')
    expect(toCssString('inherit')).toBe('inherit')
  })

  it('serialises unit values', () => {
    expect(toCssString({ value: 24, unit: 'px' })).toBe('24px')
    expect(toCssString({ value: 1.5, unit: 'rem' })).toBe('1.5rem')
  })

  it('serialises shadow values', () => {
    const shadow = {
      offsetX: { value: 0, unit: 'px' as const },
      offsetY: { value: 2, unit: 'px' as const },
      blur: { value: 4, unit: 'px' as const },
      spread: { value: 0, unit: 'px' as const },
      color: 'rgba(0,0,0,0.2)',
      inset: false,
    }
    expect(toCssString(shadow)).toBe('0px 2px 4px 0px rgba(0,0,0,0.2)')
  })

  it('returns undefined for null, undefined, and empty string', () => {
    expect(toCssString(null)).toBeUndefined()
    expect(toCssString(undefined)).toBeUndefined()
    expect(toCssString('')).toBeUndefined()
  })
})

describe('expandSpacing', () => {
  it('expands a SpacingValue to four longhand declarations', () => {
    const spacing = {
      top: { value: 10, unit: 'px' as const },
      right: { value: 20, unit: 'px' as const },
      bottom: { value: 10, unit: 'px' as const },
      left: { value: 20, unit: 'px' as const },
    }
    const result = expandSpacing('padding', spacing)
    expect(result).toEqual([
      ['padding-top', '10px'],
      ['padding-right', '20px'],
      ['padding-bottom', '10px'],
      ['padding-left', '20px'],
    ])
  })

  it('returns empty array for non-spacing values', () => {
    expect(expandSpacing('margin', 'auto')).toEqual([])
    expect(expandSpacing('padding', null)).toEqual([])
  })
})

describe('border expansion helpers', () => {
  it('expands per-side border widths to longhands', () => {
    const result = expandBorderSides('borderWidth', {
      top: { value: 1, unit: 'px' as const },
      right: { value: 2, unit: 'px' as const },
      bottom: { value: 3, unit: 'px' as const },
      left: { value: 4, unit: 'px' as const },
    })
    expect(result).toEqual([
      ['border-top-width', '1px'],
      ['border-right-width', '2px'],
      ['border-bottom-width', '3px'],
      ['border-left-width', '4px'],
    ])
  })

  it('expands per-corner border radius values to longhands', () => {
    const result = expandBorderRadius({
      topLeft: { value: 8, unit: 'px' as const },
      topRight: { value: 6, unit: 'px' as const },
      bottomRight: { value: 4, unit: 'px' as const },
      bottomLeft: { value: 2, unit: 'px' as const },
    })
    expect(result).toEqual([
      ['border-top-left-radius', '8px'],
      ['border-top-right-radius', '6px'],
      ['border-bottom-right-radius', '4px'],
      ['border-bottom-left-radius', '2px'],
    ])
  })
})

describe('propToDeclarations', () => {
  it('maps color to the color CSS property', () => {
    expect(propToDeclarations('color', 'red')).toEqual([['color', 'red']])
  })

  it('maps backgroundColor to background-color', () => {
    expect(propToDeclarations('backgroundColor', '#fff')).toEqual([['background-color', '#fff']])
  })

  it('expands per-side border colors to longhands', () => {
    const result = propToDeclarations('borderColor', {
      top: '#111111',
      right: '#222222',
      bottom: '#333333',
      left: '#444444',
    })
    expect(result).toEqual([
      ['border-top-color', '#111111'],
      ['border-right-color', '#222222'],
      ['border-bottom-color', '#333333'],
      ['border-left-color', '#444444'],
    ])
  })

  it('expands margin SpacingValue to longhands', () => {
    const spacing = {
      top: { value: 8, unit: 'px' as const },
      right: { value: 0, unit: 'px' as const },
      bottom: { value: 8, unit: 'px' as const },
      left: { value: 0, unit: 'px' as const },
    }
    const result = propToDeclarations('margin', spacing)
    expect(result).toHaveLength(4)
    expect(result[0]).toEqual(['margin-top', '8px'])
  })

  it('returns empty for null value', () => {
    expect(propToDeclarations('color', null)).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// generate.ts — CSS generation
// ---------------------------------------------------------------------------

describe('generateCss', () => {
  it('generates a scoped rule for a node with base props', () => {
    const node = makeNode('nx-abc', { color: 'red', display: 'block' })
    const css = generateCss(makeTree([node]), BREAKPOINTS)

    expect(css).toContain('.nivorax-nx-abc{')
    expect(css).toContain('color:red')
    expect(css).toContain('display:block')
  })

  it('generates max-width media queries for responsive overrides', () => {
    const node = makeNode('nx-abc', {
      color: { base: 'black', tablet: 'blue', mobile: 'green' },
    })
    const css = generateCss(makeTree([node]), BREAKPOINTS)

    expect(css).toContain('.nivorax-nx-abc{color:black}')
    expect(css).toContain('@media (max-width:768px){.nivorax-nx-abc{color:blue}}')
    expect(css).toContain('@media (max-width:375px){.nivorax-nx-abc{color:green}}')
  })

  it('normalizes plain background image urls when generating css', () => {
    const node = makeNode('nx-bg', {
      backgroundImage: 'https://example.com/hero.jpg',
      backgroundPosition: 'center center',
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
    })
    const css = generateCss(makeTree([node]), BREAKPOINTS)

    expect(css).toContain(
      '.nivorax-nx-bg{background-image:url("https://example.com/hero.jpg");background-position:center center;background-size:cover;background-repeat:no-repeat}',
    )
  })

  it('keeps gradient background values unchanged when generating css', () => {
    const node = makeNode('nx-gradient', {
      backgroundImage: 'linear-gradient(180deg, #111111 0%, #ffffff 100%)',
    })
    const css = generateCss(makeTree([node]), BREAKPOINTS)

    expect(css).toContain(
      '.nivorax-nx-gradient{background-image:linear-gradient(180deg, #111111 0%, #ffffff 100%)}',
    )
  })

  it('serializes per-side border values and per-corner radius values', () => {
    const node = makeNode('nx-border', {
      borderWidth: {
        top: { value: 1, unit: 'px' as const },
        right: { value: 2, unit: 'px' as const },
        bottom: { value: 3, unit: 'px' as const },
        left: { value: 4, unit: 'px' as const },
      },
      borderColor: {
        top: '#111111',
        right: '#222222',
        bottom: '#333333',
        left: '#444444',
      },
      borderRadius: {
        topLeft: { value: 8, unit: 'px' as const },
        topRight: { value: 6, unit: 'px' as const },
        bottomRight: { value: 4, unit: 'px' as const },
        bottomLeft: { value: 2, unit: 'px' as const },
      },
    })
    const css = generateCss(makeTree([node]), BREAKPOINTS)

    expect(css).toContain('border-top-width:1px')
    expect(css).toContain('border-left-color:#444444')
    expect(css).toContain('border-bottom-left-radius:2px')
  })

  it('emits nothing for a node with no style props', () => {
    const node = makeNode('nx-empty', { text: 'Hello' })
    const css = generateCss(makeTree([node]), BREAKPOINTS)
    expect(css).toBe('')
  })

  it('is deterministic — same input produces identical output', () => {
    const node = makeNode('nx-det', { color: 'red', display: 'flex' })
    const tree = makeTree([node])
    expect(generateCss(tree, BREAKPOINTS)).toBe(generateCss(tree, BREAKPOINTS))
  })

  it('generates rules for multiple nodes', () => {
    const a = makeNode('a', { color: 'red' })
    const b = makeNode('b', { color: 'blue' })
    const css = generateCss(makeTree([a, b]), BREAKPOINTS)

    expect(css).toContain('.nivorax-a{color:red}')
    expect(css).toContain('.nivorax-b{color:blue}')
  })

  it('respects STYLE_PROP_ORDER — display before color', () => {
    const node = makeNode('nx-order', { color: 'red', display: 'flex' })
    const css = generateCss(makeTree([node]), BREAKPOINTS)
    const ruleMatch = css.match(/\.nivorax-nx-order\{([^}]+)\}/)
    expect(ruleMatch).not.toBeNull()
    const declarations = ruleMatch![1]!
    expect(declarations.indexOf('display')).toBeLessThan(declarations.indexOf('color'))
  })

  it('handles node.overrides breakpoint overrides', () => {
    const node: NxNode = {
      ...makeNode('nx-ov', { color: 'black' }),
      overrides: { tablet: { color: 'red' } },
    }
    const css = generateCss(makeTree([node]), BREAKPOINTS)

    expect(css).toContain('@media (max-width:768px){.nivorax-nx-ov{color:red}}')
  })

  it('keeps default-state styles when a prop is wrapped for interaction states', () => {
    const node = makeNode('nx-state', {
      color: {
        default: { base: 'black', mobile: 'green' },
        hover: { base: 'blue' },
      },
    })
    const css = generateCss(makeTree([node]), BREAKPOINTS)

    expect(css).toContain('.nivorax-nx-state{color:black}')
    expect(css).toContain('@media (max-width:375px){.nivorax-nx-state{color:green}}')
    expect(css).not.toContain(':hover')
  })

  it('returns empty string for empty tree', () => {
    expect(generateCss({ rootId: '', nodes: {} }, BREAKPOINTS)).toBe('')
  })
})

describe('generateNodeCssString', () => {
  it('generates CSS for a single node', () => {
    const node = makeNode('nx-single', { color: 'purple' })
    const css = generateNodeCssString(node, BREAKPOINTS)

    expect(css).toContain('.nivorax-nx-single{color:purple}')
  })
})
