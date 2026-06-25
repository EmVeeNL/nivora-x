import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { loadDocument, saveDraft, publishDocument } from '@/document/persistence'
import type { DocumentEnvelope } from '@/document/schema/types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const VALID_ENVELOPE: DocumentEnvelope = {
  version: 1,
  tree: {
    rootId: 'nx-root0001',
    nodes: {
      'nx-root0001': {
        id: 'nx-root0001',
        type: 'body',
        props: {},
        children: [],
        overrides: {},
        meta: {},
      },
    },
  },
  meta: {},
}

function mockFetch(body: unknown, ok = true) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok,
      status: ok ? 200 : 500,
      json: () => Promise.resolve(body),
    }),
  )
}

function stubBootstrap() {
  vi.stubGlobal('window', {
    nivoraxBootstrap: {
      postId: 42,
      restRoot: 'https://example.com/wp-json/',
      restNonce: 'test-nonce-xyz',
    },
  })
}

beforeEach(() => {
  stubBootstrap()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

// ---------------------------------------------------------------------------
// loadDocument
// ---------------------------------------------------------------------------

describe('loadDocument', () => {
  it('returns null when the REST API returns tree: null', async () => {
    mockFetch({ version: 1, tree: null, meta: {} })
    const result = await loadDocument(42)
    expect(result).toBeNull()
  })

  it('returns a valid DocumentEnvelope when tree is present', async () => {
    mockFetch(VALID_ENVELOPE)
    const result = await loadDocument(42)
    expect(result?.tree.rootId).toBe('nx-root0001')
  })

  it('sends the WP nonce header', async () => {
    mockFetch(VALID_ENVELOPE)
    await loadDocument(42)
    const [, init] = (vi.mocked(fetch) as ReturnType<typeof vi.fn>).mock.calls[0] as [
      string,
      RequestInit,
    ]
    expect((init.headers as Record<string, string>)['X-WP-Nonce']).toBe('test-nonce-xyz')
  })

  it('throws on HTTP error response', async () => {
    mockFetch({}, false)
    await expect(loadDocument(42)).rejects.toThrow('HTTP 500')
  })

  it('runs migrations on the loaded document (v0 → v1)', async () => {
    mockFetch({ version: 0, tree: VALID_ENVELOPE.tree, meta: {} })
    const result = await loadDocument(42)
    expect(result?.version).toBe(1)
  })
})

// ---------------------------------------------------------------------------
// saveDraft
// ---------------------------------------------------------------------------

describe('saveDraft', () => {
  it('sends a PUT request', async () => {
    mockFetch({ saved: true, version: 1 })
    await saveDraft(42, VALID_ENVELOPE)
    const [, init] = (vi.mocked(fetch) as ReturnType<typeof vi.fn>).mock.calls[0] as [
      string,
      RequestInit,
    ]
    expect(init.method).toBe('PUT')
  })

  it('sends publish: false in the body', async () => {
    mockFetch({ saved: true, version: 1 })
    await saveDraft(42, VALID_ENVELOPE)
    const [, init] = (vi.mocked(fetch) as ReturnType<typeof vi.fn>).mock.calls[0] as [
      string,
      RequestInit,
    ]
    const body = JSON.parse(init.body as string) as Record<string, unknown>
    expect(body['publish']).toBe(false)
  })

  it('throws on HTTP error response', async () => {
    mockFetch({}, false)
    await expect(saveDraft(42, VALID_ENVELOPE)).rejects.toThrow('HTTP 500')
  })
})

// ---------------------------------------------------------------------------
// publishDocument
// ---------------------------------------------------------------------------

describe('publishDocument', () => {
  it('sends publish: true in the body', async () => {
    mockFetch({ saved: true, version: 1 })
    await publishDocument(42, VALID_ENVELOPE)
    const [, init] = (vi.mocked(fetch) as ReturnType<typeof vi.fn>).mock.calls[0] as [
      string,
      RequestInit,
    ]
    const body = JSON.parse(init.body as string) as Record<string, unknown>
    expect(body['publish']).toBe(true)
  })

  it('throws on HTTP error response', async () => {
    mockFetch({}, false)
    await expect(publishDocument(42, VALID_ENVELOPE)).rejects.toThrow('HTTP 500')
  })
})
