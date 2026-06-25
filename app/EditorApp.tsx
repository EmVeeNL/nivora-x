import { useEffect } from 'react'
import './styles/theme.css'
import './lib/icons'
import { registerStarterElements } from './elements/definitions'
import { registerEditorPanels } from './shell/left/registerPanels'
import { DndProvider } from './canvas/dnd/DndProvider'
import { EditorLayout } from './shell/EditorLayout'
import { useDocumentStore } from './document/store'
import { loadDocument } from './document/persistence'
import { createBlankTree } from './document/blankTree'

// Register element types and left panels once at app init
registerStarterElements()
registerEditorPanels()

/**
 * Loads the document from the REST API on mount.
 * Falls back to a blank tree when there is no saved document or no WP context.
 */
function DocumentInit() {
  useEffect(() => {
    const store = useDocumentStore.getState()
    if (store.tree) return

    const bs = typeof window !== 'undefined' ? window.nivoraxBootstrap : undefined

    if (bs?.postId) {
      loadDocument(bs.postId)
        .then((envelope) => {
          useDocumentStore.getState().setTree(envelope ? envelope.tree : createBlankTree())
        })
        .catch(() => {
          useDocumentStore.getState().setTree(createBlankTree())
        })
    } else {
      // No WordPress context (local dev / test) — use a blank tree so DnD works
      useDocumentStore.getState().setTree(createBlankTree())
    }
  }, [])

  return null
}

export function EditorApp() {
  return (
    <div className="nivorax-editor h-screen w-screen overflow-hidden bg-background text-foreground">
      <DocumentInit />
      <DndProvider>
        <EditorLayout />
      </DndProvider>
    </div>
  )
}
