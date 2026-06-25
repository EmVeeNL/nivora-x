import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useInjectGeneratedCss } from '@/canvas/style/injectGeneratedCss'
import { useDocumentStore } from '@/document/store'
import { useUiStore } from '@/state/uiStore'
import type { DocumentTree } from '@/document/schema/types'
import type { BreakpointConfig } from '@/breakpoints/config'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const BREAKPOINTS: BreakpointConfig[] = [
  { id: 'desktop', label: 'Desktop', width: 1440, direction: 'max', builtin: true },
  { id: 'tablet', label: 'Tablet', width: 768, direction: 'max', builtin: true },
  { id: 'mobile', label: 'Mobile', width: 375, direction: 'max', builtin: true },
]

function makeTree(): DocumentTree {
  return {
    rootId: 'root',
    nodes: {
      root: {
        id: 'root',
        type: 'section',
        props: { backgroundColor: '#ff0000' },
        children: [],
        overrides: {},
        meta: {},
      },
    },
  }
}

function makeIframeRef() {
  const iframeDoc = document.implementation.createHTMLDocument('canvas')
  const iframeEl = {
    contentDocument: iframeDoc,
    contentWindow: { document: iframeDoc },
  } as unknown as HTMLIFrameElement
  return { current: iframeEl }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  useUiStore.setState({ breakpoints: BREAKPOINTS, activeBreakpoint: 'desktop' })
  useDocumentStore.setState({ tree: null })
})

describe('useInjectGeneratedCss', () => {
  it('injects a <style> tag into iframe head on mount', () => {
    const iframeRef = makeIframeRef()
    useDocumentStore.setState({ tree: makeTree() })

    renderHook(() => useInjectGeneratedCss(iframeRef))

    const tag = iframeRef.current.contentDocument!.getElementById('nivorax-generated-css')
    expect(tag).not.toBeNull()
    expect(tag!.tagName).toBe('STYLE')
  })

  it('populates the style tag with CSS containing the node selector', () => {
    const iframeRef = makeIframeRef()
    useDocumentStore.setState({ tree: makeTree() })

    renderHook(() => useInjectGeneratedCss(iframeRef))

    const tag = iframeRef.current.contentDocument!.getElementById('nivorax-generated-css')
    expect(tag!.textContent).toContain('.nivorax-root')
    expect(tag!.textContent).toContain('background-color')
  })

  it('updates the style tag when tree changes', () => {
    const iframeRef = makeIframeRef()
    useDocumentStore.setState({ tree: makeTree() })

    renderHook(() => useInjectGeneratedCss(iframeRef))

    const tag = iframeRef.current.contentDocument!.getElementById('nivorax-generated-css')
    const before = tag!.textContent

    act(() => {
      useDocumentStore.setState({
        tree: {
          rootId: 'root',
          nodes: {
            root: {
              id: 'root',
              type: 'section',
              props: { backgroundColor: '#00ff00' },
              children: [],
              overrides: {},
              meta: {},
            },
          },
        },
      })
    })

    expect(tag!.textContent).not.toEqual(before)
    expect(tag!.textContent).toContain('00ff00')
  })

  it('sets empty CSS when tree is null', () => {
    const iframeRef = makeIframeRef()
    useDocumentStore.setState({ tree: null })

    renderHook(() => useInjectGeneratedCss(iframeRef))

    const tag = iframeRef.current.contentDocument!.getElementById('nivorax-generated-css')
    expect(tag!.textContent).toBe('')
  })

  it('does nothing when iframeRef.current is null', () => {
    const iframeRef = { current: null } as unknown as { current: HTMLIFrameElement | null }
    useDocumentStore.setState({ tree: makeTree() })

    // Should not throw.
    expect(() => {
      renderHook(() => useInjectGeneratedCss(iframeRef))
    }).not.toThrow()
  })

  it('reuses the existing style tag on subsequent renders (no duplicate tags)', () => {
    const iframeRef = makeIframeRef()
    useDocumentStore.setState({ tree: makeTree() })

    renderHook(() => useInjectGeneratedCss(iframeRef))

    act(() => {
      useDocumentStore.setState({ tree: makeTree() })
    })

    const tags = iframeRef.current.contentDocument!.querySelectorAll('#nivorax-generated-css')
    expect(tags.length).toBe(1)
  })
})
