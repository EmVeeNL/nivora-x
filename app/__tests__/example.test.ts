import { describe, it, expect } from 'vitest'

describe('example unit test', () => {
  it('adds numbers', () => {
    expect(1 + 1).toBe(2)
  })

  it('truthy/falsy', () => {
    expect('nivorax').toBeTruthy()
    expect('').toBeFalsy()
  })
})
