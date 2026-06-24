import { SCHEMA_VERSION } from '../schema/constants'
import { migration0001 } from './0001-initial'

export interface Migration {
  fromVersion: number
  toVersion: number
  migrate(raw: Record<string, unknown>): Record<string, unknown>
}

/**
 * Ordered registry of all registered migrations.
 * Add new migrations here in ascending order when the schema changes.
 */
const MIGRATIONS: Migration[] = [migration0001]

/**
 * Run all necessary migrations on a raw envelope object to bring it
 * from its stored version up to SCHEMA_VERSION.
 *
 * Throws if the stored version is newer than the current schema version
 * (forward-incompatible — the editor is out of date).
 */
export function runMigrations(raw: Record<string, unknown>): Record<string, unknown> {
  let version = typeof raw['version'] === 'number' ? raw['version'] : 0
  let current = { ...raw }

  if (version > SCHEMA_VERSION) {
    throw new Error(
      `Document version ${version} is newer than the editor (${SCHEMA_VERSION}). ` +
        'Please update NivoraX.',
    )
  }

  for (const migration of MIGRATIONS) {
    if (migration.fromVersion === version) {
      current = migration.migrate(current)
      version = migration.toVersion
      current = { ...current, version }
    }
  }

  return current
}
