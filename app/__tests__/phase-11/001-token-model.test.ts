import { describe, it, expect, beforeEach } from 'vitest'
import { isTokenRef, makeTokenRef } from '@/tokens/model'
import type { DesignToken } from '@/tokens/model'
import { DEFAULT_TOKENS } from '@/tokens/defaults'
import { useTokenStore } from '@/tokens/store'

// ---------------------------------------------------------------------------
// model.ts — isTokenRef / makeTokenRef
// ---------------------------------------------------------------------------

describe('isTokenRef', () => {
  it('returns true for a valid token reference', () => {
    expect(isTokenRef({ __token: 'color-primary' })).toBe(true)
  })

  it('returns false for a plain string', () => {
    expect(isTokenRef('#ff0000')).toBe(false)
  })

  it('returns false for a UnitValue', () => {
    expect(isTokenRef({ value: 16, unit: 'px' })).toBe(false)
  })

  it('returns false for null', () => {
    expect(isTokenRef(null)).toBe(false)
  })

  it('returns false when __token is not a string', () => {
    expect(isTokenRef({ __token: 42 })).toBe(false)
  })
})

describe('makeTokenRef', () => {
  it('creates a token reference with the given id', () => {
    expect(makeTokenRef('spacing-md')).toEqual({ __token: 'spacing-md' })
  })
})

// ---------------------------------------------------------------------------
// defaults.ts — seeded tokens
// ---------------------------------------------------------------------------

describe('DEFAULT_TOKENS', () => {
  it('contains 19 seeded tokens', () => {
    expect(DEFAULT_TOKENS).toHaveLength(19)
  })

  it('covers all four groups', () => {
    const groups = new Set(DEFAULT_TOKENS.map((t) => t.group))
    expect(groups).toContain('color')
    expect(groups).toContain('typography')
    expect(groups).toContain('spacing')
    expect(groups).toContain('effect')
  })

  it('each token has a unique id', () => {
    const ids = DEFAULT_TOKENS.map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('each token has id, group, name, and value', () => {
    for (const token of DEFAULT_TOKENS) {
      expect(token.id).toBeTruthy()
      expect(token.group).toBeTruthy()
      expect(token.name).toBeTruthy()
      expect(token.value).not.toBeUndefined()
    }
  })
})

// ---------------------------------------------------------------------------
// store.ts — useTokenStore
// ---------------------------------------------------------------------------

describe('useTokenStore', () => {
  beforeEach(() => {
    useTokenStore.setState({ tokens: [...DEFAULT_TOKENS], _loaded: false })
  })

  it('initialises with default tokens', () => {
    expect(useTokenStore.getState().tokens).toHaveLength(19)
  })

  it('setTokens replaces the token list and marks _loaded', () => {
    const custom: DesignToken[] = [
      { id: 'color-test', group: 'color', name: 'Test', value: '#aabbcc' },
    ]
    useTokenStore.getState().setTokens(custom)
    expect(useTokenStore.getState().tokens).toHaveLength(1)
    expect(useTokenStore.getState()._loaded).toBe(true)
  })

  it('upsertToken adds a new token', () => {
    const newToken: DesignToken = { id: 'color-new', group: 'color', name: 'New', value: '#ff0000' }
    useTokenStore.getState().upsertToken(newToken)
    expect(useTokenStore.getState().tokens.find((t) => t.id === 'color-new')).toEqual(newToken)
    expect(useTokenStore.getState().tokens).toHaveLength(20)
  })

  it('upsertToken updates an existing token by id', () => {
    const updated: DesignToken = {
      id: 'color-primary',
      group: 'color',
      name: 'Primary Updated',
      value: '#0000ff',
    }
    useTokenStore.getState().upsertToken(updated)
    const found = useTokenStore.getState().tokens.find((t) => t.id === 'color-primary')
    expect(found?.name).toBe('Primary Updated')
    expect(found?.value).toBe('#0000ff')
    expect(useTokenStore.getState().tokens).toHaveLength(19)
  })

  it('deleteToken removes a token by id', () => {
    useTokenStore.getState().deleteToken('color-primary')
    expect(useTokenStore.getState().tokens.find((t) => t.id === 'color-primary')).toBeUndefined()
    expect(useTokenStore.getState().tokens).toHaveLength(18)
  })

  it('deleteToken is a no-op for an unknown id', () => {
    useTokenStore.getState().deleteToken('does-not-exist')
    expect(useTokenStore.getState().tokens).toHaveLength(19)
  })

  it('getToken returns the token for a known id', () => {
    const token = useTokenStore.getState().getToken('spacing-md')
    expect(token).toBeDefined()
    expect(token?.name).toBe('Medium')
  })

  it('getToken returns undefined for an unknown id', () => {
    expect(useTokenStore.getState().getToken('no-such-token')).toBeUndefined()
  })

  it('getByGroup returns all tokens in the given group', () => {
    const colors = useTokenStore.getState().getByGroup('color')
    expect(colors.length).toBeGreaterThan(0)
    expect(colors.every((t) => t.group === 'color')).toBe(true)
  })
})
