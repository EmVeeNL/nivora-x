import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TopToolbar } from '@/shell/TopToolbar'
import { useDocumentStore } from '@/document/store'
import { useUiStore } from '@/state/uiStore'
import type { DocumentTree } from '@/document/schema/types'

vi.mock('@/document/persistence', () => ({
  saveDraft: vi.fn(),
  publishDocument: vi.fn(),
}))

import { saveDraft, publishDocument } from '@/document/persistence'

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
  vi.mocked(saveDraft).mockReset()
  vi.mocked(publishDocument).mockReset()

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
    isDirty: true,
    past: [],
    future: [],
    _lastCoalesceKey: null,
    _lastCoalesceTime: 0,
  })
  useUiStore.setState({
    activeBreakpoint: 'desktop',
    showElementBorders: false,
    previewMode: false,
  })
})

describe('TopToolbar save and publish', () => {
  it('saves a draft and marks the document clean', async () => {
    vi.mocked(saveDraft).mockResolvedValue(undefined)

    render(<TopToolbar />)
    await userEvent.click(screen.getByRole('button', { name: 'Save draft' }))

    await waitFor(() => expect(saveDraft).toHaveBeenCalledTimes(1))
    expect(publishDocument).not.toHaveBeenCalled()
    expect(useDocumentStore.getState().isDirty).toBe(false)
    expect(screen.getByText('Saved')).toBeInTheDocument()
  })

  it('publishes and marks the document clean', async () => {
    vi.mocked(publishDocument).mockResolvedValue(undefined)

    render(<TopToolbar />)
    await userEvent.click(screen.getByRole('button', { name: 'Publish page' }))

    await waitFor(() => expect(publishDocument).toHaveBeenCalledTimes(1))
    expect(saveDraft).not.toHaveBeenCalled()
    expect(useDocumentStore.getState().isDirty).toBe(false)
    expect(screen.getByText('Published')).toBeInTheDocument()
  })

  it('disables both buttons while a draft save is in flight', async () => {
    let resolveSave: () => void = () => undefined
    vi.mocked(saveDraft).mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveSave = resolve
        }),
    )

    render(<TopToolbar />)
    await userEvent.click(screen.getByRole('button', { name: 'Save draft' }))

    expect(screen.getByRole('button', { name: 'Save draft' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Publish page' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Save draft' })).toHaveTextContent('Saving…')

    resolveSave()
    await waitFor(() => expect(screen.getByText('Saved')).toBeInTheDocument())
  })

  it('shows an error and allows retry after save failure', async () => {
    vi.mocked(saveDraft).mockRejectedValueOnce(new Error('boom')).mockResolvedValueOnce(undefined)

    render(<TopToolbar />)

    await userEvent.click(screen.getByRole('button', { name: 'Save draft' }))
    await waitFor(() => expect(screen.getByText('Save failed')).toBeInTheDocument())
    expect(useDocumentStore.getState().isDirty).toBe(true)

    await userEvent.click(screen.getByRole('button', { name: 'Save draft' }))
    await waitFor(() => expect(saveDraft).toHaveBeenCalledTimes(2))
    expect(screen.getByText('Saved')).toBeInTheDocument()
  })

  it('toggles preview mode from the toolbar', async () => {
    render(<TopToolbar />)

    await userEvent.click(screen.getByRole('button', { name: 'Preview page' }))
    expect(useUiStore.getState().previewMode).toBe(true)
    expect(screen.getByRole('button', { name: 'Exit preview' })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Exit preview' }))
    expect(useUiStore.getState().previewMode).toBe(false)
  })
})
