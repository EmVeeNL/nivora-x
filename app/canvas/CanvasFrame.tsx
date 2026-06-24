import { useRef, useEffect } from 'react'
import { useUiStore, BREAKPOINT_WIDTHS } from '@/state/uiStore'
import { bootstrapIframe } from './iframe'

const BREAKPOINT_LABEL: Record<string, string> = {
  desktop: 'Desktop',
  tablet: 'Tablet',
  mobile: 'Mobile',
}

export function CanvasFrame() {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const activeBreakpoint = useUiStore((s) => s.activeBreakpoint)
  const frameWidth = BREAKPOINT_WIDTHS[activeBreakpoint]

  useEffect(() => {
    if (iframeRef.current) bootstrapIframe(iframeRef.current)
  }, [])

  return (
    <div
      data-testid="canvas-chrome"
      className="flex h-full w-full flex-col items-center overflow-auto pt-4"
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
    </div>
  )
}
