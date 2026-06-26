import { create } from 'zustand'
import { createTemplate, deleteTemplate, fetchTemplates, type TemplateSummary } from './api'
import type { TemplateType } from './TemplateEditorContext'

type LoadState = 'idle' | 'loading' | 'ready' | 'error'

interface TemplateStoreState {
  templates: TemplateSummary[]
  status: LoadState
  error: string | null
}

interface TemplateStoreActions {
  /** Load templates from the server (idempotent — refetches each call). */
  load(this: void): Promise<void>
  /** Create a template and return its editor URL, or null on failure. */
  create(this: void, type: TemplateType, title: string): Promise<string | null>
  /** Delete a template by id, optimistically removing it from the list. */
  remove(this: void, id: number): Promise<void>
}

export const useTemplateStore = create<TemplateStoreState & TemplateStoreActions>()((set, get) => ({
  templates: [],
  status: 'idle',
  error: null,

  load: async () => {
    set({ status: 'loading', error: null })
    try {
      const templates = await fetchTemplates()
      set({ templates, status: 'ready' })
    } catch (err) {
      set({ status: 'error', error: err instanceof Error ? err.message : 'Load failed' })
    }
  },

  create: async (type, title) => {
    try {
      const template = await createTemplate(type, title)
      set((s) => ({ templates: [template, ...s.templates] }))
      return template.editUrl
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Create failed' })
      return null
    }
  },

  remove: async (id) => {
    const prev = get().templates
    set({ templates: prev.filter((t) => t.id !== id) })
    try {
      await deleteTemplate(id)
    } catch (err) {
      // Roll back on failure.
      set({ templates: prev, error: err instanceof Error ? err.message : 'Delete failed' })
    }
  },
}))
