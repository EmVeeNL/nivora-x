import { create } from 'zustand'
import type { DocumentTree, NxNode, ResponsiveBreakpoint } from './schema/types'
import { insertNode, removeNode, moveNode, updateProps, duplicateNode } from './operations'

const MAX_HISTORY = 50
/** Milliseconds within which repeated edits to the same coalesceKey merge into one history entry. */
const COALESCE_MS = 500

interface DocumentState {
  tree: DocumentTree | null
  selectedId: string | null
  isDirty: boolean
  // undo/redo
  past: DocumentTree[]
  future: DocumentTree[]
  _lastCoalesceKey: string | null
  _lastCoalesceTime: number
}

interface DocumentActions {
  /** Replace the entire tree (does not push to undo history). */
  setTree(tree: DocumentTree): void
  /** Select a node by ID, or clear selection with null. */
  selectNode(id: string | null): void
  /** Insert node under parentId at optional index (default: append). Pushes history. */
  insertNode(node: NxNode, parentId: string, index?: number): void
  /** Remove node and all descendants. Pushes history. */
  removeNode(nodeId: string): void
  /** Move node to a new parent/index. Returns false if the move is invalid. */
  moveNode(nodeId: string, newParentId: string, newIndex: number): boolean
  /**
   * Update node props (base or breakpoint override). Pushes history.
   * Pass coalesceKey to merge rapid successive edits (e.g. slider drags) into one entry.
   */
  updateProps(
    nodeId: string,
    props: Record<string, unknown>,
    breakpoint?: ResponsiveBreakpoint,
    coalesceKey?: string,
  ): void
  /** Duplicate node+subtree adjacent to original. Returns new node ID, or null on failure. */
  duplicateNode(nodeId: string): string | null
  /** Undo the last mutation. */
  undo(): void
  /** Redo the last undone mutation. */
  redo(): void
  /** Mark the document as clean (e.g. after a successful save). */
  markClean(): void
}

export const useDocumentStore = create<DocumentState & DocumentActions>()((set, get) => {
  /** Push current tree to history before a mutation, unless coalescing. */
  function push(current: DocumentTree, coalesceKey?: string): boolean {
    if (coalesceKey) {
      const { _lastCoalesceKey, _lastCoalesceTime } = get()
      if (_lastCoalesceKey === coalesceKey && Date.now() - _lastCoalesceTime < COALESCE_MS) {
        set({ _lastCoalesceTime: Date.now() })
        return false // coalesced — do not push a new history entry
      }
    }
    set((s) => ({
      past: [...s.past.slice(-(MAX_HISTORY - 1)), current],
      future: [],
      _lastCoalesceKey: coalesceKey ?? null,
      _lastCoalesceTime: Date.now(),
    }))
    return true
  }

  return {
    // ---- state ----
    tree: null,
    selectedId: null,
    isDirty: false,
    past: [],
    future: [],
    _lastCoalesceKey: null,
    _lastCoalesceTime: 0,

    // ---- actions ----
    setTree: (tree) => set({ tree, isDirty: false, past: [], future: [] }),

    selectNode: (id) => set({ selectedId: id }),

    insertNode: (node, parentId, index) => {
      const { tree } = get()
      if (!tree) return
      push(tree)
      set({ tree: insertNode(tree, node, parentId, index), isDirty: true })
    },

    removeNode: (nodeId) => {
      const { tree } = get()
      if (!tree) return
      push(tree)
      const { tree: newTree } = removeNode(tree, nodeId)
      const selectedId = get().selectedId
      set({
        tree: newTree,
        isDirty: true,
        selectedId: selectedId === nodeId ? null : selectedId,
      })
    },

    moveNode: (nodeId, newParentId, newIndex) => {
      const { tree } = get()
      if (!tree) return false
      const newTree = moveNode(tree, nodeId, newParentId, newIndex)
      if (!newTree) return false
      push(tree)
      set({ tree: newTree, isDirty: true })
      return true
    },

    updateProps: (nodeId, props, breakpoint, coalesceKey) => {
      const { tree } = get()
      if (!tree) return
      push(tree, coalesceKey)
      set({ tree: updateProps(tree, nodeId, props, breakpoint), isDirty: true })
    },

    duplicateNode: (nodeId) => {
      const { tree } = get()
      if (!tree) return null
      try {
        push(tree)
        const { tree: newTree, newNodeId } = duplicateNode(tree, nodeId)
        set({ tree: newTree, isDirty: true })
        return newNodeId
      } catch {
        return null
      }
    },

    undo: () =>
      set((s) => {
        const prev = s.past[s.past.length - 1]
        if (!prev || !s.tree) return {}
        return {
          tree: prev,
          past: s.past.slice(0, -1),
          future: [s.tree, ...s.future],
          isDirty: true,
          _lastCoalesceKey: null,
        }
      }),

    redo: () =>
      set((s) => {
        const next = s.future[0]
        if (!next || !s.tree) return {}
        return {
          tree: next,
          past: [...s.past, s.tree],
          future: s.future.slice(1),
          isDirty: true,
          _lastCoalesceKey: null,
        }
      }),

    markClean: () => set({ isDirty: false }),
  }
})
