import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { EditorApp } from './EditorApp'
import { registerStarterElements } from './elements/definitions'

registerStarterElements()

// Mount point is injected by plugin/src/Admin/Screen/EditorScreen.php
const mountNode = document.getElementById('nivorax-editor-root')

if (mountNode) {
  createRoot(mountNode).render(
    <StrictMode>
      <EditorApp />
    </StrictMode>,
  )
}
