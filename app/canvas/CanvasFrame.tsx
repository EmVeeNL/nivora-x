import { useRef, useEffect } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { useUiStore } from '@/state/uiStore'
import { bootstrapIframe } from './iframe'
import { CanvasRenderer } from './CanvasRenderer'
import { useCanvasSelection } from './useCanvasSelection'
import { useEditorKeyboard } from './useEditorKeyboard'
import { SelectionOverlay } from './overlay/SelectionOverlay'
import { ElementBordersOverlay } from './overlay/ElementBordersOverlay'
import { useDndEditor } from './dnd/DndProvider'
import { CanvasDropOverlay } from './dnd/CanvasDropOverlay'
import { getBreakpointLabelFromList, getBreakpointWidthFromList } from '@/breakpoints/config'
import { useInjectGeneratedCss } from './style/injectGeneratedCss'

interface CanvasFrameProps {
  clean?: boolean
}

export function CanvasFrame({ clean = false }: CanvasFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const canvasRootRef = useRef<Root | null>(null)
  const breakpoints = useUiStore((s) => s.breakpoints)
  const activeBreakpoint = useUiStore((s) => s.activeBreakpoint)
  const previewMode = useUiStore((s) => s.previewMode)
  const frameWidth = getBreakpointWidthFromList(breakpoints, activeBreakpoint)
  const { isDragging } = useDndEditor()
  const chromeHidden = clean || previewMode

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

  // Inject generated CSS into the iframe head whenever tree/breakpoints change.
  useInjectGeneratedCss(iframeRef)

  // Wire pointer-event listeners for selection and hover.
  // Runs after the bootstrap effect due to React's sequential effect ordering.
  useCanvasSelection(iframeRef, !chromeHidden)
  useEditorKeyboard(iframeRef, !chromeHidden)

  return (
    <div
      data-testid="canvas-chrome"
      className="relative flex h-full w-full flex-col items-center overflow-auto pt-4"
    >
      {/* Breakpoint label */}
      {!chromeHidden && (
        <p
          data-testid="canvas-breakpoint-label"
          className="mb-3 shrink-0 text-xs text-muted-foreground/70"
          aria-live="polite"
          aria-atomic="true"
        >
          {getBreakpointLabelFromList(breakpoints, activeBreakpoint)} · {frameWidth}px
        </p>
      )}

      <iframe
        ref={iframeRef}
        data-testid="canvas-iframe"
        title="NivoraX canvas"
        style={{
          width: `${String(frameWidth)}px`,
          maxWidth: '100%',
          // Disable iframe pointer capture during DnD so parent window receives events
          pointerEvents: isDragging && !chromeHidden ? 'none' : 'auto',
        }}
        className="min-h-[640px] shrink-0 border-0 bg-white shadow-2xl"
        sandbox="allow-same-origin"
      />

      {/* Element borders overlay — shows colored dashed edit borders when enabled */}
      {!chromeHidden && <ElementBordersOverlay iframeRef={iframeRef} />}

      {/* Selection/hover overlay — position:fixed, tracks element rects in the iframe */}
      {!chromeHidden && <SelectionOverlay iframeRef={iframeRef} />}

      {/* Full-viewport drag capture overlay — only active while dragging */}
      {!chromeHidden && <CanvasDropOverlay iframeRef={iframeRef} />}
    </div>
  )
}
