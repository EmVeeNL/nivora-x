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
import { SCHEMA_VERSION } from './document/schema/constants'

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
          if (envelope) {
            useDocumentStore.getState().setDocument(envelope)
          } else {
            useDocumentStore.getState().setDocument({
              version: SCHEMA_VERSION,
              tree: createBlankTree(),
              meta: { title: bs.postTitle ?? 'Untitled Page' },
            })
          }
        })
        .catch((err: unknown) => {
          console.error('[NivoraX] Failed to load document:', err)
          useDocumentStore.getState().setDocument({
            version: SCHEMA_VERSION,
            tree: createBlankTree(),
            meta: { title: bs.postTitle ?? 'Untitled Page' },
          })
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
