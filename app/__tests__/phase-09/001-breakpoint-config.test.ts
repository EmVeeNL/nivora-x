import { beforeEach, describe, expect, it } from 'vitest'
import {
  DEFAULT_BREAKPOINTS,
  getBreakpointLabel,
  getBreakpointWidth,
  getBreakpoints,
} from '@/breakpoints/config'

describe('breakpoint config', () => {
  beforeEach(() => {
    delete window.nivoraxBootstrap
  })

  it('exposes desktop tablet and mobile defaults', () => {
    expect(DEFAULT_BREAKPOINTS.map((breakpoint) => breakpoint.id)).toEqual([
      'desktop',
      'tablet',
      'mobile',
    ])
    expect(getBreakpointWidth('desktop')).toBe(1440)
    expect(getBreakpointWidth('tablet')).toBe(768)
    expect(getBreakpointWidth('mobile')).toBe(375)
  })

  it('reads bootstrap breakpoints in ordered form', () => {
    window.nivoraxBootstrap = {
      postId: 1,
      mode: 'nivorax',
      restRoot: 'https://example.test/wp-json/',
      restNonce: 'nonce',
      adminUrl: 'https://example.test/wp-admin/',
      pagesUrl: 'https://example.test/wp-admin/admin.php?page=nivorax-pages',
      homeUrl: 'https://example.test/',
      siteName: 'Example',
      version: '0.1.0',
      breakpoints: [
        { id: 'desktop', label: 'Desktop', width: 1440, direction: 'max', builtin: true },
        { id: 'laptop', label: 'Laptop', width: 1024, direction: 'max', builtin: false },
        { id: 'tablet', label: 'Tablet', width: 768, direction: 'max', builtin: true },
        { id: 'mobile', label: 'Mobile', width: 375, direction: 'max', builtin: true },
      ],
    }

    expect(getBreakpoints().map((breakpoint) => breakpoint.id)).toEqual([
      'desktop',
      'laptop',
      'tablet',
      'mobile',
    ])
    expect(getBreakpointLabel('laptop')).toBe('Laptop')
    expect(getBreakpointWidth('laptop')).toBe(1024)
  })
})
