import { useEffect, type RefObject } from 'react'
import { canInteract } from '@/document/canInteract'
import { useDocumentStore } from '@/document/store'
import { useUiStore } from '@/state/uiStore'
import { getElementDefinition, hasElement } from '@/elements/registry'

function isEditableTarget(el: Element | null): boolean {
  if (!el) return false
  const tag = (el as HTMLElement).tagName
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    (el as HTMLElement).isContentEditable
  )
}

function triggerDelete() {
  const { selectedId, tree } = useDocumentStore.getState()
  if (!selectedId || !tree) return
  const node = tree.nodes[selectedId]
  if (!node || !canInteract(node) || selectedId === tree.rootId) return
  const label = hasElement(node.type) ? getElementDefinition(node.type).label : node.type
  useUiStore.getState().setPendingDelete({ nodeId: selectedId, label })
}

/**
 * Editor-level keyboard shortcuts that work regardless of whether focus is in
 * the chrome or the canvas iframe.
 *
 * Cmd/Ctrl+Z      → undo
 * Cmd/Ctrl+Shift+Z → redo
 * Delete/Backspace → open delete confirmation dialog
 * Escape           → clear selection
 */
export function useEditorKeyboard(
  iframeRef: RefObject<HTMLIFrameElement | null>,
  enabled = true,
): void {
  useEffect(() => {
    if (!enabled) return

    function onKeyDown(e: KeyboardEvent) {
      if (isEditableTarget(document.activeElement)) return
      const meta = e.metaKey || e.ctrlKey

      if (meta && e.shiftKey && e.key === 'z') {
        e.preventDefault()
        useDocumentStore.getState().redo()
      } else if (meta && e.key === 'z') {
        e.preventDefault()
        useDocumentStore.getState().undo()
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        triggerDelete()
      } else if (e.key === 'Escape') {
        useUiStore.getState().setPendingDelete(null)
        useDocumentStore.getState().selectNode(null)
      }
    }

    function onIframeKeyDown(e: KeyboardEvent) {
      const activeEl = iframeRef.current?.contentDocument?.activeElement ?? null
      if (isEditableTarget(activeEl)) return
      const meta = e.metaKey || e.ctrlKey

      if (meta && e.shiftKey && e.key === 'z') {
        e.preventDefault()
        useDocumentStore.getState().redo()
      } else if (meta && e.key === 'z') {
        e.preventDefault()
        useDocumentStore.getState().undo()
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        triggerDelete()
      } else if (e.key === 'Escape') {
        useUiStore.getState().setPendingDelete(null)
        useDocumentStore.getState().selectNode(null)
      }
    }

    document.addEventListener('keydown', onKeyDown)

    const iframe = iframeRef.current
    iframe?.contentDocument?.addEventListener('keydown', onIframeKeyDown)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      iframe?.contentDocument?.removeEventListener('keydown', onIframeKeyDown)
    }
    // iframeRef is a stable ref — intentionally omitted from deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled])
}
