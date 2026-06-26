import { afterEach, describe, expect, it } from 'vitest'
import {
  getTemplateContext,
  supportsContentSlot,
  supportsPostLoop,
  TEMPLATE_TYPES,
} from '@/templates/TemplateEditorContext'
import type { NivoraXBootstrap } from '@/lib/bootstrap'

function bootstrap(template: { type: string } | null = null): NivoraXBootstrap {
  return {
    postId: 7,
    mode: 'nivorax',
    template,
    restRoot: 'https://example.test/wp-json/',
    restNonce: 'nonce',
    adminUrl: 'https://example.test/wp-admin/',
    pagesUrl: 'https://example.test/wp-admin/admin.php?page=nivorax-all-pages',
    homeUrl: 'https://example.test/',
    siteName: 'Example',
    version: '0.1.0',
  }
}

describe('template editor context', () => {
  afterEach(() => {
    delete window.nivoraxBootstrap
  })

  it('reports page context when no template payload is present', () => {
    window.nivoraxBootstrap = bootstrap()
    expect(getTemplateContext()).toEqual({ isTemplate: false, type: null })
  })

  it('reports page context when bootstrap is unavailable', () => {
    expect(getTemplateContext()).toEqual({ isTemplate: false, type: null })
  })

  it('reads a valid template type from the bootstrap', () => {
    window.nivoraxBootstrap = bootstrap({ type: 'header' })
    expect(getTemplateContext()).toEqual({ isTemplate: true, type: 'header' })
  })

  it('marks an unknown stored type as a template with a null type', () => {
    window.nivoraxBootstrap = bootstrap({ type: 'banana' })
    expect(getTemplateContext()).toEqual({ isTemplate: true, type: null })
  })

  it('covers exactly the six supported types', () => {
    expect([...TEMPLATE_TYPES]).toEqual(['header', 'footer', 'single', 'archive', '404', 'search'])
  })

  it('exposes the content slot only for single templates', () => {
    expect(supportsContentSlot('single')).toBe(true)
    expect(supportsContentSlot('archive')).toBe(false)
    expect(supportsContentSlot(null)).toBe(false)
  })

  it('exposes the post loop for archive and search templates', () => {
    expect(supportsPostLoop('archive')).toBe(true)
    expect(supportsPostLoop('search')).toBe(true)
    expect(supportsPostLoop('header')).toBe(false)
  })
})
