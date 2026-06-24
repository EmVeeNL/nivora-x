import { describe, it, expect } from 'vitest'
import { runMigrations } from '@/document/migrations'
import { SCHEMA_VERSION } from '@/document/schema/constants'

const VALID_TREE = {
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
}

describe('runMigrations', () => {
  it('returns the document unchanged when already at current version', () => {
    const raw = { version: SCHEMA_VERSION, tree: VALID_TREE, meta: {} }
    const result = runMigrations(raw)
    expect(result).toEqual(raw)
  })

  it('applies the no-op migration from v0 to v1 and stamps the new version', () => {
    const raw = { version: 0, tree: VALID_TREE, meta: { note: 'from v0' } }
    const result = runMigrations(raw)
    expect(result['version']).toBe(1)
    expect(result['meta']).toEqual({ note: 'from v0' })
  })

  it('treats missing version field as v0 and migrates up', () => {
    const raw = { tree: VALID_TREE, meta: {} }
    const result = runMigrations(raw)
    expect(result['version']).toBe(SCHEMA_VERSION)
  })

  it('does not alter tree content during no-op migration', () => {
    const raw = { version: 0, tree: VALID_TREE, meta: {} }
    const result = runMigrations(raw)
    expect(result['tree']).toEqual(VALID_TREE)
  })

  it('throws when the stored version is newer than the current schema', () => {
    const raw = { version: SCHEMA_VERSION + 1, tree: VALID_TREE, meta: {} }
    expect(() => runMigrations(raw)).toThrow(/newer than the editor/)
  })
})
