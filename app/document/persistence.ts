import type { DocumentEnvelope, ApiEnvelope } from './schema/types'
import { deserialize } from './schema/serialize'
import { SCHEMA_VERSION } from './schema/constants'
import { runMigrations } from './migrations'
import { getBootstrapData } from '@/lib/bootstrap'

function bootstrap() {
  const bs = getBootstrapData()
  if (!bs) throw new Error('nivoraxBootstrap is not defined')
  return bs
}

function restHeaders(): Record<string, string> {
  return { 'X-WP-Nonce': bootstrap().restNonce }
}

function endpoint(postId: number): string {
  return `${bootstrap().restRoot}nivorax/v1/documents/${postId}`
}

/**
 * Load the document for a post from the REST API.
 * Runs schema migrations and validates the envelope before returning it.
 * Returns null if the post has no saved NivoraX document yet (tree is null).
 */
export async function loadDocument(postId: number): Promise<DocumentEnvelope | null> {
  const resp = await fetch(endpoint(postId), { headers: restHeaders() })
  if (!resp.ok) throw new Error(`loadDocument: HTTP ${resp.status}`)

  const api = (await resp.json()) as ApiEnvelope
  if (api.tree === null) return null

  // Run migrations, then validate via deserialize
  const migrated = runMigrations({ version: api.version, tree: api.tree, meta: api.meta })
  return deserialize(JSON.stringify(migrated))
}

/**
 * Persist the current document as a draft (does not publish).
 * Marks the post as dirty until this call succeeds.
 */
export async function saveDraft(postId: number, envelope: DocumentEnvelope): Promise<void> {
  const resp = await fetch(endpoint(postId), {
    method: 'PUT',
    headers: { ...restHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...envelope, version: SCHEMA_VERSION, publish: false }),
  })
  if (!resp.ok) throw new Error(`saveDraft: HTTP ${resp.status}`)
}

/**
 * Persist the document and set the post status to "publish".
 */
export async function publishDocument(postId: number, envelope: DocumentEnvelope): Promise<void> {
  const resp = await fetch(endpoint(postId), {
    method: 'PUT',
    headers: { ...restHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...envelope, version: SCHEMA_VERSION, publish: true }),
  })
  if (!resp.ok) throw new Error(`publishDocument: HTTP ${resp.status}`)
}
