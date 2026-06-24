/** Current schema version. Bump when the node shape changes and register a migration. */
export const SCHEMA_VERSION = 1 as const

/** Breakpoints (non-desktop) that can hold per-node prop overrides. */
export const RESPONSIVE_BREAKPOINTS = ['tablet', 'mobile'] as const
