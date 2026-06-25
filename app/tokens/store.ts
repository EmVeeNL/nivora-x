import { create } from 'zustand'
import type { DesignToken, TokenGroup } from './model'
import { DEFAULT_TOKENS } from './defaults'
import { getBootstrapData } from '@/lib/bootstrap'

interface TokenState {
  tokens: DesignToken[]
  _loaded: boolean
}

interface TokenActions {
  /** Replace the full token list (e.g. after loading from the server). */
  setTokens(this: void, tokens: DesignToken[]): void
  /** Create or update a single token by id. */
  upsertToken(this: void, token: DesignToken): void
  /** Remove a token by id. */
  deleteToken(this: void, id: string): void
  /** Look up a token by id. */
  getToken(this: void, id: string): DesignToken | undefined
  /** Return all tokens in a given group. */
  getByGroup(this: void, group: TokenGroup): DesignToken[]
  /** Persist the current token list to the server. */
  save(this: void): Promise<void>
}

export const useTokenStore = create<TokenState & TokenActions>()((set, get) => ({
  tokens: DEFAULT_TOKENS,
  _loaded: false,

  setTokens: (tokens) => set({ tokens, _loaded: true }),

  upsertToken: (token) =>
    set((s) => {
      const idx = s.tokens.findIndex((t) => t.id === token.id)
      if (idx >= 0) {
        const next = [...s.tokens]
        next[idx] = token
        return { tokens: next }
      }
      return { tokens: [...s.tokens, token] }
    }),

  deleteToken: (id) => set((s) => ({ tokens: s.tokens.filter((t) => t.id !== id) })),

  getToken: (id) => get().tokens.find((t) => t.id === id),

  getByGroup: (group) => get().tokens.filter((t) => t.group === group),

  save: async () => {
    const bs = getBootstrapData()
    if (!bs || !bs.restRoot || !bs.restNonce) return

    await fetch(`${bs.restRoot}nivorax/v1/tokens`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-WP-Nonce': bs.restNonce,
      },
      body: JSON.stringify({ tokens: get().tokens }),
    })
  },
}))

/**
 * Load tokens from the server and hydrate the store.
 * Call once during editor bootstrap.
 */
export async function loadTokens(): Promise<void> {
  const bs = getBootstrapData()
  if (!bs || !bs.restRoot || !bs.restNonce) return

  try {
    const res = await fetch(`${bs.restRoot}nivorax/v1/tokens`, {
      headers: { 'X-WP-Nonce': bs.restNonce },
    })
    if (!res.ok) return
    const data = (await res.json()) as { tokens?: DesignToken[] }
    if (Array.isArray(data.tokens)) {
      useTokenStore.getState().setTokens(data.tokens)
    }
  } catch {
    // Fall back to defaults already in store.
  }
}
