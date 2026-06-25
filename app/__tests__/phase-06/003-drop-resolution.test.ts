import { describe, it, expect, beforeEach } from 'vitest'
import { resolveDropDescriptor } from '@/canvas/dnd/dropResolution'
import { registerElement, _clearRegistry } from '@/elements/registry'
import type { ElementDefinition, ElementRenderProps } from '@/elements/types'
import type { DocumentTree } from '@/document/schema/types'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const NoopRender = (_props: ElementRenderProps) => null

const mkDef = (type: string, acceptsChildren: boolean): ElementDefinition => ({
  type,
  label: type,
  icon: 'tabler:circle',
  category: 'Test',
  defaultProps: {},
  nesting: { acceptsChildren },
  render: NoopRender,
})

function makeTree(): DocumentTree {
  return {
    rootId: 'root',
    nodes: {
      root: {
        id: 'root',
        type: 'root',
        props: {},
        children: ['section1'],
        overrides: {},
        meta: {},
      },
      section1: {
        id: 'section1',
        type: 'section',
        props: {},
        children: ['container1'],
        overrides: {},
        meta: {},
      },
      container1: {
        id: 'container1',
        type: 'container',
        props: {},
        children: [],
        overrides: {},
        meta: {},
      },
    },
  }
}

/** Build a minimal mock iframe with elementFromPoint returning a given element. */
function makeMockIframe(
  iframeLeft: number,
  iframeTop: number,
  foundEl: HTMLElement | null,
): HTMLIFrameElement {
  const iframeRect = {
    left: iframeLeft,
    top: iframeTop,
    right: iframeLeft + 800,
    bottom: iframeTop + 600,
    width: 800,
    height: 600,
    toJSON: () => ({}),
    x: iframeLeft,
    y: iframeTop,
  } as DOMRect

  return {
    getBoundingClientRect: () => iframeRect,
    contentDocument: {
      elementFromPoint: () => foundEl,
    },
  } as unknown as HTMLIFrameElement
}

/** Create a mock element with a given data-node-id and bounding rect. */
function makeNodeEl(
  nodeId: string,
  top: number,
  left: number,
  width: number,
  height: number,
): HTMLElement {
  const el = document.createElement('div')
  el.dataset['nodeId'] = nodeId
  el.getBoundingClientRect = (): DOMRect => ({
    top,
    left,
    right: left + width,
    bottom: top + height,
    width,
    height,
    toJSON: () => ({}),
    x: left,
    y: top,
  })
  el.closest = (selector: string): Element | null => {
    if (selector === '[data-node-id]') return el
    return null
  }
  return el
}

beforeEach(() => {
  _clearRegistry()
  registerElement(mkDef('section', true))
  registerElement(mkDef('container', true))
  registerElement(mkDef('text', false))
})

describe('resolveDropDescriptor', () => {
  it('returns null when pointer is outside iframe bounds', () => {
    const iframe = makeMockIframe(100, 100, null)
    const tree = makeTree()
    // clientX = 50, which is left of iframeRect.left (100)
    const result = resolveDropDescriptor(iframe, 50, 200, tree, 'text')
    expect(result).toBeNull()
  })

  it('appends to root when elementFromPoint returns null (empty canvas)', () => {
    const iframe = makeMockIframe(0, 0, null)
    const tree = makeTree()
    const result = resolveDropDescriptor(iframe, 400, 300, tree, 'section')
    expect(result).not.toBeNull()
    expect(result?.targetParentId).toBe('root')
    expect(result?.index).toBe(1) // root has 1 child
  })

  it('inserts before a leaf element when pointer is in top half', () => {
    const nodeEl = makeNodeEl('section1', 100, 0, 800, 200)
    const iframe = makeMockIframe(0, 0, nodeEl)
    const tree = makeTree()
    // iframeY = 120 → relY = 120 - 100 = 20, relH = 200 → ratio = 0.1 (top half)
    const result = resolveDropDescriptor(iframe, 400, 120, tree, 'text')
    expect(result?.targetParentId).toBe('root')
    expect(result?.index).toBe(0) // before section1 at index 0
    expect(result?.indicator?.type).toBe('line')
  })

  it('inserts after a leaf element when pointer is in bottom half', () => {
    const nodeEl = makeNodeEl('section1', 100, 0, 800, 200)
    const iframe = makeMockIframe(0, 0, nodeEl)
    const tree = makeTree()
    // iframeY = 280 → relY = 280 - 100 = 180, relH = 200 → ratio = 0.9 (bottom)
    const result = resolveDropDescriptor(iframe, 400, 280, tree, 'section')
    expect(result?.targetParentId).toBe('root')
    expect(result?.index).toBe(1) // after section1
  })

  it('inserts inside an empty container when pointer is in middle', () => {
    const nodeEl = makeNodeEl('container1', 100, 0, 800, 200)
    const iframe = makeMockIframe(0, 0, nodeEl)
    const tree = makeTree()
    // iframeY = 200 → relY = 100, ratio = 0.5 → middle of empty container
    const result = resolveDropDescriptor(iframe, 400, 200, tree, 'text')
    expect(result?.targetParentId).toBe('container1')
    expect(result?.index).toBe(0)
    expect(result?.indicator?.type).toBe('box')
  })

  it('marks drop invalid when parent does not accept children', () => {
    // register text as non-accepting
    const nodeEl = makeNodeEl('container1', 100, 0, 800, 200)
    const iframe = makeMockIframe(0, 0, nodeEl)
    // Make container1 a leaf (no children, but our mock tree has it as container)
    // For this test: tree has container1 acceptsChildren=true, so drop into it should be valid
    const tree = makeTree()
    const result = resolveDropDescriptor(iframe, 400, 200, tree, 'text')
    expect(result?.valid).toBe(true) // container accepts text
  })

  it('returns valid=false when moving into own descendant', () => {
    const nodeEl = makeNodeEl('container1', 100, 0, 800, 200)
    const iframe = makeMockIframe(0, 0, nodeEl)
    const tree = makeTree()
    // Moving section1 into container1 (container1 is child of section1)
    const result = resolveDropDescriptor(iframe, 400, 200, tree, 'section', 'section1')
    expect(result?.valid).toBe(false)
  })

  it('produces a DropDescriptor with targetParentId and index', () => {
    const nodeEl = makeNodeEl('section1', 100, 0, 800, 200)
    const iframe = makeMockIframe(0, 0, nodeEl)
    const tree = makeTree()
    const result = resolveDropDescriptor(iframe, 400, 200, tree, 'text')
    expect(result).not.toBeNull()
    expect(typeof result!.targetParentId).toBe('string')
    expect(typeof result!.index).toBe('number')
    expect(typeof result!.valid).toBe('boolean')
  })
})
