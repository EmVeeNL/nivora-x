import type { DesignToken } from './model'

/**
 * Seeded design-token defaults — loaded on first run when no stored tokens exist.
 * Ids are stable and opaque; names are display-only.
 */
export const DEFAULT_TOKENS: DesignToken[] = [
  // --- Colors ---
  { id: 'color-primary', group: 'color', name: 'Primary', value: '#3b82f6' },
  { id: 'color-secondary', group: 'color', name: 'Secondary', value: '#6b7280' },
  { id: 'color-accent', group: 'color', name: 'Accent', value: '#8b5cf6' },
  { id: 'color-background', group: 'color', name: 'Background', value: '#ffffff' },
  { id: 'color-text', group: 'color', name: 'Text', value: '#111827' },

  // --- Typography: families ---
  {
    id: 'font-sans',
    group: 'typography',
    name: 'Sans',
    value: 'system-ui, -apple-system, sans-serif',
  },
  { id: 'font-serif', group: 'typography', name: 'Serif', value: 'Georgia, serif' },
  { id: 'font-mono', group: 'typography', name: 'Mono', value: 'ui-monospace, monospace' },

  // --- Typography: sizes ---
  { id: 'font-size-sm', group: 'typography', name: 'Small', value: { value: 14, unit: 'px' } },
  { id: 'font-size-base', group: 'typography', name: 'Base', value: { value: 16, unit: 'px' } },
  { id: 'font-size-lg', group: 'typography', name: 'Large', value: { value: 20, unit: 'px' } },
  { id: 'font-size-xl', group: 'typography', name: 'XLarge', value: { value: 24, unit: 'px' } },

  // --- Spacing ---
  { id: 'spacing-sm', group: 'spacing', name: 'Small', value: { value: 8, unit: 'px' } },
  { id: 'spacing-md', group: 'spacing', name: 'Medium', value: { value: 16, unit: 'px' } },
  { id: 'spacing-lg', group: 'spacing', name: 'Large', value: { value: 24, unit: 'px' } },
  { id: 'spacing-xl', group: 'spacing', name: 'XLarge', value: { value: 48, unit: 'px' } },

  // --- Effects: radii ---
  { id: 'radius-sm', group: 'effect', name: 'Small', value: { value: 4, unit: 'px' } },
  { id: 'radius-md', group: 'effect', name: 'Medium', value: { value: 8, unit: 'px' } },
  { id: 'radius-lg', group: 'effect', name: 'Large', value: { value: 16, unit: 'px' } },
]
