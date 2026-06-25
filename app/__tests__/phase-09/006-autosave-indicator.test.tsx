import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { TopToolbar } from '@/shell/TopToolbar'
import { useDocumentStore } from '@/document/store'
import { useUiStore } from '@/state/uiStore'
import type { DocumentTree } from '@/document/schema/types'

function tree(): DocumentTree {
  return {
    rootId: 'root',
    nodes: {
      root: {
        id: 'root',
        type: 'body',
        props: {},
        children: [],
        overrides: {},
        meta: {},
      },
    },
  }
}

beforeEach(() => {
  window.nivoraxBootstrap = {
    postId: 42,
    mode: 'nivorax',
    restRoot: 'https://example.test/wp-json/',
    restNonce: 'nonce',
    adminUrl: 'https://example.test/wp-admin/',
    pagesUrl: 'https://example.test/wp-admin/admin.php?page=nivorax-pages',
    homeUrl: 'https://example.test/',
    siteName: 'Example',
    version: '0.1.0',
  }

  useDocumentStore.setState({
    tree: tree(),
    documentMeta: { title: 'Home' },
    selectedId: null,
    isDirty: false,
    autosaveStatus: 'idle',
    past: [],
    future: [],
    _lastCoalesceKey: null,
    _lastCoalesceTime: 0,
  })
  useUiStore.setState({
    activeBreakpoint: 'desktop',
    showElementBorders: false,
  })
})

describe('AutosaveIndicator', () => {
  it('renders status labels from the autosave signal', () => {
    const { rerender } = render(<TopToolbar />)
    const indicator = screen.getByTestId('autosave-indicator')

    expect(indicator.textContent).toBe('')

    useDocumentStore.getState().setAutosaveStatus('saving')
    rerender(<TopToolbar />)
    expect(screen.getByText('Saving')).toBeInTheDocument()

    useDocumentStore.getState().setAutosaveStatus('saved')
    rerender(<TopToolbar />)
    expect(screen.getByText('Saved')).toBeInTheDocument()

    useDocumentStore.getState().setAutosaveStatus('error')
    rerender(<TopToolbar />)
    expect(screen.getByText('Error')).toBeInTheDocument()
  })

  it('keeps a fixed-width reserved slot across status changes', () => {
    const { rerender } = render(<TopToolbar />)
    const initialClassName = screen.getByTestId('autosave-indicator').className

    useDocumentStore.getState().setAutosaveStatus('saving')
    rerender(<TopToolbar />)
    expect(screen.getByTestId('autosave-indicator').className).toBe(initialClassName)

    useDocumentStore.getState().setAutosaveStatus('error')
    rerender(<TopToolbar />)
    expect(screen.getByTestId('autosave-indicator').className).toBe(initialClassName)
  })
})
