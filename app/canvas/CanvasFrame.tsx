import { useRef, useEffect } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { useUiStore, BREAKPOINT_WIDTHS } from '@/state/uiStore'
import { bootstrapIframe } from './iframe'
import { CanvasRenderer } from './CanvasRenderer'
import { useCanvasSelection } from './useCanvasSelection'
import { SelectionOverlay } from './overlay/SelectionOverlay'

const BREAKPOINT_LABEL: Record<string, string> = {
  desktop: 'Desktop',
  tablet: 'Tablet',
  mobile: 'Mobile',
}

export function CanvasFrame() {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const canvasRootRef = useRef<Root | null>(null)
  const activeBreakpoint = useUiStore((s) => s.activeBreakpoint)
  const frameWidth = BREAKPOINT_WIDTHS[activeBreakpoint]

  // Bootstrap the iframe HTML and mount the canvas React root inside it.
  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return

    bootstrapIframe(iframe)

    const mountPoint = iframe.contentDocument?.getElementById('nivorax-canvas-root')
    if (!mountPoint) return

    const root = createRoot(mountPoint)
    canvasRootRef.current = root
    root.render(<CanvasRenderer />)

    return () => {
      // Defer unmount so React's current render phase can finish first.
      // Prevents the "synchronously unmount during render" warning in tests.
      const r = canvasRootRef.current
      canvasRootRef.current = null
      queueMicrotask(() => r?.unmount())
    }
  }, [])

  // Wire pointer-event listeners for selection and hover.
  // Runs after the bootstrap effect due to React's sequential effect ordering.
  useCanvasSelection(iframeRef)

  return (
    <div
      data-testid="canvas-chrome"
      className="relative flex h-full w-full flex-col items-center overflow-auto pt-4"
    >
      {/* Breakpoint label */}
      <p
        data-testid="canvas-breakpoint-label"
        className="mb-3 shrink-0 text-xs text-muted-foreground/70"
        aria-live="polite"
        aria-atomic="true"
      >
        {BREAKPOINT_LABEL[activeBreakpoint]} · {frameWidth}px
      </p>

      <iframe
        ref={iframeRef}
        data-testid="canvas-iframe"
        title="NivoraX canvas"
        style={{ width: `${String(frameWidth)}px`, maxWidth: '100%' }}
        className="min-h-[640px] shrink-0 border-0 bg-white shadow-2xl"
        sandbox="allow-same-origin"
      />

      {/* Selection/hover overlay — position:fixed, tracks element rects in the iframe */}
      <SelectionOverlay iframeRef={iframeRef} />
    </div>
  )
}
