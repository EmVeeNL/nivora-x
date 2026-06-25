import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { BreakpointSettings } from '@/breakpoints/BreakpointSettings'
import { normalizeBreakpoints } from '@/breakpoints/config'
import { useUiStore } from '@/state/uiStore'
import { useDocumentStore } from '@/document/store'

const DEFAULT_BREAKPOINTS = normalizeBreakpoints([
  { id: 'desktop', label: 'Desktop', width: 1440, direction: 'max', builtin: true },
  { id: 'tablet', label: 'Tablet', width: 768, direction: 'max', builtin: true },
  { id: 'mobile', label: 'Mobile', width: 375, direction: 'max', builtin: true },
])

beforeEach(() => {
  window.nivoraxBootstrap = {
    postId: 42,
    mode: 'nivorax',
    restRoot: 'https://example.com/wp-json/',
    restNonce: 'nonce',
    adminUrl: 'https://example.com/wp-admin/',
    pagesUrl: 'https://example.com/wp-admin/admin.php?page=nivorax',
    homeUrl: 'https://example.com/',
    siteName: 'Example',
    version: '0.1.0',
    canManageSettings: true,
    breakpoints: DEFAULT_BREAKPOINTS,
  }

  useUiStore.setState({
    breakpoints: DEFAULT_BREAKPOINTS,
    activeBreakpoint: 'desktop',
  })
  useDocumentStore.setState({
    tree: null,
    documentMeta: {},
    selectedId: null,
    isDirty: false,
    past: [],
    future: [],
    _lastCoalesceKey: null,
    _lastCoalesceTime: 0,
  })
})

describe('BreakpointSettings', () => {
  it('renders nothing when the user cannot manage settings', () => {
    window.nivoraxBootstrap = { ...window.nivoraxBootstrap!, canManageSettings: false }
    const { container } = render(<BreakpointSettings />)
    expect(container).toBeEmptyDOMElement()
  })

  it('adds and saves a custom breakpoint through the settings endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => ({
        breakpoints: normalizeBreakpoints([
          ...DEFAULT_BREAKPOINTS,
          {
            id: 'breakpoint-1',
            label: 'Breakpoint 1',
            width: 1024,
            direction: 'max',
            builtin: false,
          },
        ]),
      }),
    })
    vi.stubGlobal('fetch', fetchMock)

    render(<BreakpointSettings />)

    await userEvent.click(screen.getByRole('button', { name: /add/i }))
    await userEvent.click(screen.getByRole('button', { name: /save breakpoints/i }))

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(typeof init.body).toBe('string')
    const body = JSON.parse(init.body as string) as { breakpoints: Array<{ id: string }> }

    expect(init.method).toBe('PUT')
    expect(body.breakpoints).toHaveLength(4)
    expect(useUiStore.getState().breakpoints).toHaveLength(4)
    expect(screen.getByText('Saved')).toBeInTheDocument()
  })
})
