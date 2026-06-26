import { describe, expect, it } from 'vitest'
import {
  extractPartRefs,
  hasCycleFrom,
  wouldCreateCycle,
  PART_ELEMENT_TYPE,
  type TemplateRefGraph,
} from '@/templates/cycleCheck'
import { partDefinition } from '@/elements/definitions/part'
import { registerStarterElements } from '@/elements/definitions'
import { getElementDefinition, hasElement } from '@/elements/registry'
import type { DocumentTree, NxNode } from '@/document/schema/types'

function node(partial: Partial<NxNode> & Pick<NxNode, 'id' | 'type'>): NxNode {
  return {
    props: {},
    children: [],
    overrides: {},
    meta: {},
    ...partial,
  }
}

function treeWithParts(ids: number[]): DocumentTree {
  const nodes: Record<string, NxNode> = {
    root: node({ id: 'root', type: 'section', children: ids.map((_, i) => `p${i}`) }),
  }
  ids.forEach((id, i) => {
    nodes[`p${i}`] = node({ id: `p${i}`, type: PART_ELEMENT_TYPE, props: { templateId: id } })
  })
  return { rootId: 'root', nodes }
}

describe('part reference extraction', () => {
  it('collects template ids from part nodes, de-duplicated', () => {
    expect(extractPartRefs(treeWithParts([5, 7, 5])).sort()).toEqual([5, 7])
  })

  it('ignores parts with a missing or invalid id', () => {
    const tree = treeWithParts([0, -3])
    tree.nodes.p2 = node({ id: 'p2', type: PART_ELEMENT_TYPE, props: { templateId: 'x' } })
    expect(extractPartRefs(tree)).toEqual([])
  })

  it('returns an empty list for an empty tree', () => {
    expect(extractPartRefs(null)).toEqual([])
    expect(extractPartRefs(undefined)).toEqual([])
  })
})

describe('cycle detection', () => {
  it('flags a direct self-reference', () => {
    expect(wouldCreateCycle({}, 5, 5)).toBe(true)
  })

  it('flags a transitive cycle (A->B, B->C, then C->A)', () => {
    const graph: TemplateRefGraph = { 1: [2], 2: [3] }
    expect(wouldCreateCycle(graph, 3, 1)).toBe(true)
  })

  it('allows a non-cyclic edge', () => {
    const graph: TemplateRefGraph = { 1: [2], 2: [3] }
    expect(wouldCreateCycle(graph, 1, 4)).toBe(false)
  })

  it('detects an existing cycle in the graph', () => {
    expect(hasCycleFrom({ 1: [2], 2: [1] }, 1)).toBe(true)
    expect(hasCycleFrom({ 1: [2], 2: [3] }, 1)).toBe(false)
  })
})

describe('part element definition', () => {
  it('uses the shared part element type and a templateId prop', () => {
    expect(partDefinition.type).toBe(PART_ELEMENT_TYPE)
    expect(partDefinition.defaultProps).toEqual({ templateId: 0 })
    expect(partDefinition.nesting.acceptsChildren).toBe(false)
  })

  it('registers in the element registry with the starter set', () => {
    registerStarterElements()
    expect(hasElement(PART_ELEMENT_TYPE)).toBe(true)
    expect(getElementDefinition(PART_ELEMENT_TYPE).label).toBe('Template Part')
  })
})
