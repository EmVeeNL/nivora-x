import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { useTemplateStore } from '@/templates/store'
import { ThemeBuilderPanel } from '@/shell/left/themebuilder/ThemeBuilderPanel'
import { registerEditorPanels } from '@/shell/left/registerPanels'
import { listLeftPanels, _clearLeftPanelRegistry } from '@/shell/left/leftPanelRegistry'
import type { TemplateSummary } from '@/templates/api'

function summary(over: Partial<TemplateSummary>): TemplateSummary {
  return {
    id: 1,
    title: 'Site Header',
    type: 'header',
    status: 'publish',
    editUrl: 'https://example.test/wp-admin/admin.php?page=nivorax-editor&post=1',
    ...over,
  }
}

function resetStore() {
  useTemplateStore.setState({ templates: [], status: 'idle', error: null })
}

describe('theme builder panel registration', () => {
  afterEach(() => _clearLeftPanelRegistry())

  it('registers a Theme Builder entry in the activity bar', () => {
    registerEditorPanels()
    const ids = listLeftPanels().map((p) => p.id)
    expect(ids).toContain('theme-builder')
    const entry = listLeftPanels().find((p) => p.id === 'theme-builder')
    expect(entry?.label).toBe('Theme Builder')
  })
})

describe('ThemeBuilderPanel', () => {
  beforeEach(() => {
    resetStore()
    window.nivoraxBootstrap = {
      postId: 1,
      mode: 'nivorax',
      restRoot: 'https://example.test/wp-json/',
      restNonce: 'nonce',
      adminUrl: 'https://example.test/wp-admin/',
      pagesUrl: 'https://example.test/wp-admin/admin.php?page=nivorax-all-pages',
      homeUrl: 'https://example.test/',
      siteName: 'Example',
      version: '0.1.0',
    }
  })

  afterEach(() => {
    delete window.nivoraxBootstrap
    vi.restoreAllMocks()
  })

  it('lists templates grouped by type and marks the current one', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ templates: [summary({ id: 1, title: 'Site Header' })] }), {
        status: 200,
      }),
    )

    render(<ThemeBuilderPanel />)

    await waitFor(() => expect(screen.getByText('Site Header')).toBeInTheDocument())
    // Current post (id 1) is flagged as editing.
    expect(screen.getByText('editing')).toBeInTheDocument()
  })

  it('shows all six template-type group headers', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ templates: [] }), { status: 200 }),
    )

    render(<ThemeBuilderPanel />)

    await waitFor(() => expect(useTemplateStore.getState().status).toBe('ready'))
    for (const label of ['Header', 'Footer', 'Single', 'Archive', '404', 'Search']) {
      expect(screen.getByText(label)).toBeInTheDocument()
    }
  })

  it('reveals a create input when the add button is clicked', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ templates: [] }), { status: 200 }),
    )

    render(<ThemeBuilderPanel />)
    await waitFor(() => expect(useTemplateStore.getState().status).toBe('ready'))

    fireEvent.click(screen.getByTestId('theme-builder-add-footer'))
    expect(screen.getByPlaceholderText('Footer name…')).toBeInTheDocument()
  })
})
