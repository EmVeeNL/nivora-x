import { useRef, useEffect } from 'react'
import { useUiStore, BREAKPOINT_WIDTHS } from '@/state/uiStore'
import { bootstrapIframe } from './iframe'

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
      className="flex h-full w-full items-start justify-center overflow-auto py-6"
    >
      <iframe
        ref={iframeRef}
        data-testid="canvas-iframe"
        title="NivoraX canvas"
        /* Width is driven by the active breakpoint; transitions make device
           switching feel smooth. Max-width prevents overflow on small viewports. */
        style={{ width: `${String(frameWidth)}px`, maxWidth: '100%' }}
        className="min-h-[640px] border-0 bg-white shadow-2xl"
        /* allow-same-origin lets Phase 05 access contentDocument;
           scripts and other privileges are withheld until needed. */
        sandbox="allow-same-origin"
      />
    </div>
  )
}
