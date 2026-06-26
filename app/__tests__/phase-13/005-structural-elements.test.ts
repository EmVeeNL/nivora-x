import { describe, expect, it } from 'vitest'
import { contentSlotDefinition } from '@/elements/definitions/content-slot'
import { postLoopDefinition } from '@/elements/definitions/post-loop'
import { registerStarterElements } from '@/elements/definitions'
import { getElementDefinition, hasElement } from '@/elements/registry'

describe('structural template elements', () => {
  it('defines a leaf content slot', () => {
    expect(contentSlotDefinition.type).toBe('content-slot')
    expect(contentSlotDefinition.nesting.acceptsChildren).toBe(false)
    expect(contentSlotDefinition.category).toBe('Theme')
  })

  it('defines a post loop that accepts a loop-item subtree', () => {
    expect(postLoopDefinition.type).toBe('post-loop')
    expect(postLoopDefinition.nesting.acceptsChildren).toBe(true)
  })

  it('registers both with the starter set', () => {
    registerStarterElements()
    expect(hasElement('content-slot')).toBe(true)
    expect(hasElement('post-loop')).toBe(true)
    expect(getElementDefinition('post-loop').label).toBe('Post Loop')
  })
})
