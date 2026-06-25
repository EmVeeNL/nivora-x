import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFrameRect } from '@/canvas/overlay/useFrameRect'

// ---------------------------------------------------------------------------
// ResizeObserver mock (not in jsdom)
// ---------------------------------------------------------------------------

const observeSpy = vi.fn()
const disconnectSpy = vi.fn()

vi.stubGlobal(
  'ResizeObserver',
  vi.fn(() => ({ observe: observeSpy, disconnect: disconnectSpy, unobserve: vi.fn() })),
)

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeMockIframe(elRect?: Partial<DOMRect>): { current: HTMLIFrameElement } {
  const mockEl = {
    getBoundingClientRect: vi.fn(() => ({
      top: 10,
      left: 20,
      width: 100,
      height: 50,
      ...elRect,
    })),
  }

  const mockDoc = {
    querySelector: vi.fn(() => ({
      getBoundingClientRect: vi.fn(() => ({
        top: 5,
        left: 8,
        width: 80,
        height: 30,
      })),
    })),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }

  return {
    current: {
      getBoundingClientRect: mockEl.getBoundingClientRect,
      contentDocument: mockDoc,
    } as unknown as HTMLIFrameElement,
  }
}

beforeEach(() => {
  observeSpy.mockClear()
  disconnectSpy.mockClear()
})

// ---------------------------------------------------------------------------
// useFrameRect
// ---------------------------------------------------------------------------

describe('useFrameRect', () => {
  it('returns null when nodeId is null', () => {
    const iframeRef = makeMockIframe()
    const { result } = renderHook(() => useFrameRect(iframeRef, null))
    expect(result.current).toBeNull()
  })

  it('returns null when the element is not found in the iframe', () => {
    const iframeRef = makeMockIframe()
    ;(
      iframeRef.current.contentDocument as unknown as { querySelector: ReturnType<typeof vi.fn> }
    ).querySelector.mockReturnValue(null)

    const { result } = renderHook(() => useFrameRect(iframeRef, 'nx-missing001'))
    expect(result.current).toBeNull()
  })

  it('computes rect as iframe offset + element offset', () => {
    const iframeRef = makeMockIframe()
    // iframe at top:10, left:20; element at top:5, left:8
    // expected: top=15, left=28, width=80, height=30
    const { result } = renderHook(() => useFrameRect(iframeRef, 'nx-abc000001'))

    expect(result.current).not.toBeNull()
    expect(result.current!.top).toBe(15)
    expect(result.current!.left).toBe(28)
    expect(result.current!.width).toBe(80)
    expect(result.current!.height).toBe(30)
  })

  it('attaches a ResizeObserver on the iframe element', () => {
    const iframeRef = makeMockIframe()
    renderHook(() => useFrameRect(iframeRef, 'nx-abc000001'))
    expect(observeSpy).toHaveBeenCalledWith(iframeRef.current)
  })

  it('disconnects the ResizeObserver on cleanup', () => {
    const iframeRef = makeMockIframe()
    const { unmount } = renderHook(() => useFrameRect(iframeRef, 'nx-abc000001'))
    act(() => unmount())
    expect(disconnectSpy).toHaveBeenCalled()
  })

  it('returns null when nodeId changes to null', () => {
    const iframeRef = makeMockIframe()
    let nodeId: string | null = 'nx-abc000001'
    // Use closure variable so rerender doesn't need prop typing gymnastics.
    const { result, rerender } = renderHook(() => useFrameRect(iframeRef, nodeId))

    expect(result.current).not.toBeNull()

    nodeId = null
    rerender()
    expect(result.current).toBeNull()
  })
})
