const BASE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; min-height: 100%; }
    body {
      font-family: ui-sans-serif, system-ui, sans-serif;
      background: #ffffff;
      color: #1a1a1a;
    }
    #nivorax-canvas-root { min-height: 100vh; }
  </style>
</head>
<body>
  <div id="nivorax-canvas-root"></div>
</body>
</html>`

/**
 * Bootstraps the iframe document with a base HTML shell.
 * The `#nivorax-canvas-root` div is the React mount point for CanvasRenderer.
 * Phase 10 seam: inject generated CSS / document styles alongside the React root.
 */
export function bootstrapIframe(iframe: HTMLIFrameElement): void {
  const doc = iframe.contentDocument ?? iframe.contentWindow?.document
  if (!doc) return
  try {
    doc.open()
    doc.write(BASE_HTML)
    doc.close()
  } catch {
    // Not accessible in some environments (e.g. cross-origin, unit tests).
  }
}
