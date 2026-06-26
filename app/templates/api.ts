import { getBootstrapData } from '@/lib/bootstrap'
import type { TemplateType } from './TemplateEditorContext'

/** A template as summarized by the REST controller. */
export interface TemplateSummary {
  id: number
  title: string
  type: TemplateType | ''
  status: string
  editUrl: string
}

const ROUTE = 'nivorax/v1/templates'

function restBase(): { root: string; nonce: string } | null {
  const bs = getBootstrapData()
  if (!bs || !bs.restRoot || !bs.restNonce) {
    return null
  }
  return { root: bs.restRoot, nonce: bs.restNonce }
}

/** Fetch every template, newest first. Returns [] when REST is unavailable. */
export async function fetchTemplates(): Promise<TemplateSummary[]> {
  const rest = restBase()
  if (!rest) return []

  const res = await fetch(`${rest.root}${ROUTE}`, {
    headers: { 'X-WP-Nonce': rest.nonce },
  })
  if (!res.ok) {
    throw new Error(`Failed to load templates (${res.status})`)
  }
  const data = (await res.json()) as { templates?: TemplateSummary[] }
  return Array.isArray(data.templates) ? data.templates : []
}

/** Create a template of the given type; resolves to its summary (with editUrl). */
export async function createTemplate(type: TemplateType, title: string): Promise<TemplateSummary> {
  const rest = restBase()
  if (!rest) {
    throw new Error('Editor REST context unavailable')
  }

  const res = await fetch(`${rest.root}${ROUTE}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-WP-Nonce': rest.nonce,
    },
    body: JSON.stringify({ type, title }),
  })
  if (!res.ok) {
    throw new Error(`Failed to create template (${res.status})`)
  }
  const data = (await res.json()) as { template: TemplateSummary }
  return data.template
}

/** Delete a template by id. */
export async function deleteTemplate(id: number): Promise<void> {
  const rest = restBase()
  if (!rest) {
    throw new Error('Editor REST context unavailable')
  }

  const res = await fetch(`${rest.root}${ROUTE}/${id}`, {
    method: 'DELETE',
    headers: { 'X-WP-Nonce': rest.nonce },
  })
  if (!res.ok) {
    throw new Error(`Failed to delete template (${res.status})`)
  }
}
