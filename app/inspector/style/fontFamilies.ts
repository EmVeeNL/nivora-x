import type { SelectControl } from '@/inspector/controls/types'

export const SYSTEM_FONT_OPTIONS: SelectControl['options'] = [
  { label: 'System UI', value: 'system-ui' },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Helvetica', value: 'Helvetica, Arial, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Times New Roman', value: '"Times New Roman", Times, serif' },
  { label: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
  { label: 'Courier New', value: '"Courier New", Courier, monospace' },
]

export async function loadWordPressFontOptions(): Promise<SelectControl['options']> {
  const bs = typeof window !== 'undefined' ? window.nivoraxBootstrap : undefined
  if (!bs?.restRoot) return []

  try {
    const response = await fetch(`${bs.restRoot}wp/v2/font-families`, {
      headers: { 'X-WP-Nonce': bs.restNonce },
    })
    if (!response.ok) return []
    const rows = (await response.json()) as Array<Record<string, unknown>>
    return rows
      .map((row) => {
        const name = typeof row['name'] === 'string' ? row['name'] : null
        const slug = typeof row['slug'] === 'string' ? row['slug'] : name
        return name && slug ? { label: name, value: slug } : null
      })
      .filter((row): row is { label: string; value: string } => row !== null)
  } catch {
    return []
  }
}
