import { getBootstrapData } from '../lib/bootstrap'

/**
 * The supported template types, mirroring the PHP `TemplateModel` constants.
 * A `null` context means the editor is editing regular page content, not a
 * theme-builder template.
 */
export type TemplateType = 'header' | 'footer' | 'single' | 'archive' | '404' | 'search'

export const TEMPLATE_TYPES: readonly TemplateType[] = [
  'header',
  'footer',
  'single',
  'archive',
  '404',
  'search',
]

export interface TemplateContext {
  /** Whether the current document is a theme-builder template. */
  isTemplate: boolean
  /** The template type, or null when editing page content. */
  type: TemplateType | null
}

const PAGE_CONTEXT: TemplateContext = { isTemplate: false, type: null }

function isTemplateType(value: unknown): value is TemplateType {
  return typeof value === 'string' && (TEMPLATE_TYPES as readonly string[]).includes(value)
}

/**
 * Reads the template editing context from the editor bootstrap. Falls back to
 * the page context when the bootstrap has no `template` payload (e.g. editing a
 * regular page) or when the data is unavailable (tests/SSR).
 */
export function getTemplateContext(): TemplateContext {
  const template = getBootstrapData()?.template
  if (!template) {
    return PAGE_CONTEXT
  }
  return {
    isTemplate: true,
    type: isTemplateType(template.type) ? template.type : null,
  }
}

/**
 * Whether the given template type should expose the single-post content slot.
 * Only single templates wrap the current post's body.
 */
export function supportsContentSlot(type: TemplateType | null): boolean {
  return type === 'single'
}

/**
 * Whether the given template type should expose the archive post loop.
 * Archives and search-results templates iterate the query's posts.
 */
export function supportsPostLoop(type: TemplateType | null): boolean {
  return type === 'archive' || type === 'search'
}
