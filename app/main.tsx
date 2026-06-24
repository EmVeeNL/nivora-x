import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Mount point is injected by src/Admin/EditorPage.php
const mountNode = document.getElementById('nivorax-editor-root')

if (mountNode) {
  createRoot(mountNode).render(
    <StrictMode>
      {/* Editor app — scaffolded in Phase 03 */}
      <div id="nivorax-editor-placeholder" style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
        <h1>NivoraX Editor</h1>
        <p>Editor placeholder — Phase 03 replaces this with the full shell.</p>
      </div>
    </StrictMode>,
  )
}
