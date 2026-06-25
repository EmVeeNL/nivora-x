import type { Migration } from './index'

/**
 * No-op initial migration.
 * Establishes the migration mechanism; runs when loading a v1 document
 * that does not yet carry a version stamp (upgrades from "no version").
 */
export const migration0001: Migration = {
  fromVersion: 0,
  toVersion: 1,
  migrate(raw) {
    return raw
  },
}
