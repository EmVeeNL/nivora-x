import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCanvasSelection } from '@/canvas/useCanvasSelection'
import { useDocumentStore } from '@/document/store'
import { useUiStore } from '@/state/uiStore'

// ---------------------------------------------------------------------------
// Helpers — minimal iframe mock using jsdom's own document
// ---------------------------------------------------------------------------

function makeMockIframe(doc: Document = document) {
  const iframeEl = {
    contentDocument: doc,
    getBoundingClientRect: () => ({ top: 0, left: 0, width: 600, height: 400 }),
  } as unknown as HTMLIFrameElement
  return { current: iframeEl }
}

function makeNodeEl(nodeId: string, parent: HTMLElement = document.body): HTMLElement {
  const el = document.createElement('div')
  el.setAttribute('data-node-id', nodeId)
  parent.appendChild(el)
  return el
}

beforeEach(() => {
  useDocumentStore.setState({ selectedId: null })
  useUiStore.setState({ hoveredId: null })
})

afterEach(() => {
  // Clean up any elements appended to document.body during tests
  document.querySelectorAll('[data-node-id]').forEach((el) => el.parentNode?.removeChild(el))
})

// ---------------------------------------------------------------------------
// Click → selection
// ---------------------------------------------------------------------------

describe('useCanvasSelection — click', () => {
  it('clicking an element with data-node-id selects it in the store', () => {
    const iframeRef = makeMockIframe()
    renderHook(() => useCanvasSelection(iframeRef))

    const el = makeNodeEl('nx-abc123456')

    act(() => {
      el.click()
    })

    expect(useDocumentStore.getState().selectedId).toBe('nx-abc123456')
  })

  it('clicking canvas with no data-node-id ancestor clears selection', () => {
    useDocumentStore.setState({ selectedId: 'nx-abc123456' })
    const iframeRef = makeMockIframe()
    renderHook(() => useCanvasSelection(iframeRef))

    // Click on an element without data-node-id
    act(() => {
      document.body.click()
    })

    expect(useDocumentStore.getState().selectedId).toBeNull()
  })

  it('clicking a nested child resolves to the closest data-node-id ancestor', () => {
    const iframeRef = makeMockIframe()
    renderHook(() => useCanvasSelection(iframeRef))

    const parent = makeNodeEl('nx-parent0001')
    const child = document.createElement('span')
    parent.appendChild(child)

    act(() => {
      child.click()
    })

    expect(useDocumentStore.getState().selectedId).toBe('nx-parent0001')
  })
})

// ---------------------------------------------------------------------------
// Hover → hoveredId
// ---------------------------------------------------------------------------

describe('useCanvasSelection — hover', () => {
  it('mousing over an element sets hoveredId', () => {
    const iframeRef = makeMockIframe()
    renderHook(() => useCanvasSelection(iframeRef))

    const el = makeNodeEl('nx-hover00001')

    act(() => {
      el.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))
    })

    expect(useUiStore.getState().hoveredId).toBe('nx-hover00001')
  })

  it('mousing out to a non-node area clears hoveredId', () => {
    useUiStore.setState({ hoveredId: 'nx-hover00001' })
    const iframeRef = makeMockIframe()
    renderHook(() => useCanvasSelection(iframeRef))

    act(() => {
      // Dispatch mouseout with relatedTarget outside any node
      document.body.dispatchEvent(
        new MouseEvent('mouseout', { bubbles: true, relatedTarget: document.body }),
      )
    })

    expect(useUiStore.getState().hoveredId).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// Cleanup on unmount
// ---------------------------------------------------------------------------

describe('useCanvasSelection — cleanup', () => {
  it('clears hoveredId when the hook unmounts', () => {
    useUiStore.setState({ hoveredId: 'nx-was-hovered' })
    const iframeRef = makeMockIframe()
    const { unmount } = renderHook(() => useCanvasSelection(iframeRef))

    act(() => {
      unmount()
    })

    expect(useUiStore.getState().hoveredId).toBeNull()
  })
})
