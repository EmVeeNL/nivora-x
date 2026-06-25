import type React from 'react'

export interface LeftPanelEntry {
  id: string
  label: string
  /** Full Iconify icon ID (e.g. 'tabler:layers-subtract'). */
  icon: string
  component: React.ComponentType
}

const _panels: LeftPanelEntry[] = []

/**
 * Register a left panel. Panels appear in registration order.
 * Duplicate registration (same id) replaces the prior entry in place.
 */
export function registerLeftPanel(entry: LeftPanelEntry): void {
  const existing = _panels.findIndex((p) => p.id === entry.id)
  if (existing >= 0) {
    _panels[existing] = entry
  } else {
    _panels.push(entry)
  }
}

/** Returns all registered panels in registration order (read-only). */
export function listLeftPanels(): readonly LeftPanelEntry[] {
  return _panels
}

/** Remove all registrations. Intended for use in tests only. */
export function _clearLeftPanelRegistry(): void {
  _panels.length = 0
}
