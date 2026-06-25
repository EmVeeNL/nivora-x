import { create } from 'zustand'
import {
  getBreakpoints,
  normalizeBreakpoints,
  type BreakpointConfig,
  type BreakpointId,
} from '@/breakpoints/config'

export type Breakpoint = BreakpointId

export interface PendingDelete {
  nodeId: string
  label: string
}

export interface PendingInsert {
  elementType: string
  targetParentId: string
  index: number
}

export type AppearanceView = 'themes' | 'templates' | 'global-styles' | 'tokens' | 'icons'

interface UiState {
  /** Which left-panel is open; null = sidebar collapsed. */
  activeLeftPanel: string | null
  /** Active sub-view inside the Appearance panel; null when canvas is shown. */
  appearanceView: AppearanceView | null
  rightPanelOpen: boolean
  previewMode: boolean
  breakpoints: BreakpointConfig[]
  activeBreakpoint: Breakpoint
  activeInspectorTab: string
  /** Keyed by section id — true = expanded. */
  openSections: Record<string, boolean>
  /** Node currently under the pointer in the canvas; null when none. */
  hoveredId: string | null
  /** Navigator rows collapsed by node id. */
  navigatorCollapsed: Record<string, true>
  /** When true, colored dotted edit borders are shown on all canvas elements. */
  showElementBorders: boolean
  /** When set, the delete confirmation dialog is shown. */
  pendingDelete: PendingDelete | null
  /** When set, the insert config modal is shown. */
  pendingInsert: PendingInsert | null
}

interface UiActions {
  /** Open a specific left panel, or pass null to collapse the sidebar. */
  setLeftPanel(this: void, panel: string | null): void
  setAppearanceView(this: void, view: AppearanceView | null): void
  toggleRightPanel(this: void): void
  setPreviewMode(this: void, previewMode: boolean): void
  togglePreviewMode(this: void): void
  setBreakpoints(this: void, breakpoints: BreakpointConfig[]): void
  setBreakpoint(this: void, bp: Breakpoint): void
  setInspectorTab(this: void, tab: string): void
  toggleSection(this: void, id: string): void
  setSectionOpen(this: void, id: string, open: boolean): void
  setHoveredId(this: void, id: string | null): void
  setNavigatorCollapsed(this: void, nodeId: string, collapsed: boolean): void
  toggleElementBorders(this: void): void
  setPendingDelete(this: void, info: PendingDelete | null): void
  setPendingInsert(this: void, info: PendingInsert | null): void
}

const INITIAL_BREAKPOINTS = getBreakpoints()

export const useUiStore = create<UiState & UiActions>()((set) => ({
  // ---- state ----
  activeLeftPanel: 'navigator',
  appearanceView: null,
  rightPanelOpen: true,
  previewMode: false,
  breakpoints: INITIAL_BREAKPOINTS,
  activeBreakpoint: INITIAL_BREAKPOINTS[0]?.id ?? 'desktop',
  activeInspectorTab: 'inspector',
  hoveredId: null,
  navigatorCollapsed: {},
  showElementBorders: false,
  pendingDelete: null,
  pendingInsert: null,
  openSections: {
    identity: true,
    layout: true,
    spacing: true,
    size: true,
    typography: true,
    background: true,
    border: false,
    shadow: false,
    visibility: false,
    position: false,
    effects: false,
  },

  // ---- actions ----
  setLeftPanel: (panel) =>
    set({ activeLeftPanel: panel, appearanceView: panel === 'appearance' ? 'tokens' : null }),
  setAppearanceView: (view) => set({ appearanceView: view }),
  toggleRightPanel: () => set((s) => ({ rightPanelOpen: !s.rightPanelOpen })),
  setPreviewMode: (previewMode) =>
    set({
      previewMode,
      hoveredId: null,
      pendingDelete: null,
      pendingInsert: null,
    }),
  togglePreviewMode: () =>
    set((s) => ({
      previewMode: !s.previewMode,
      hoveredId: null,
      pendingDelete: null,
      pendingInsert: null,
    })),
  setBreakpoints: (breakpoints) =>
    set((s) => {
      const next = normalizeBreakpoints(breakpoints)
      const hasActive = next.some((breakpoint) => breakpoint.id === s.activeBreakpoint)
      return {
        breakpoints: next,
        activeBreakpoint: hasActive ? s.activeBreakpoint : (next[0]?.id ?? 'desktop'),
      }
    }),
  setBreakpoint: (bp) => set({ activeBreakpoint: bp }),
  setInspectorTab: (tab) => set({ activeInspectorTab: tab }),
  toggleSection: (id) =>
    set((s) => ({
      openSections: { ...s.openSections, [id]: !(s.openSections[id] ?? false) },
    })),
  setSectionOpen: (id, open) =>
    set((s) => ({
      openSections: { ...s.openSections, [id]: open },
    })),
  setHoveredId: (id) => set({ hoveredId: id }),
  setNavigatorCollapsed: (nodeId, collapsed) =>
    set((s) => {
      const next = { ...s.navigatorCollapsed }
      if (collapsed) next[nodeId] = true
      else delete next[nodeId]
      return { navigatorCollapsed: next }
    }),
  toggleElementBorders: () => set((s) => ({ showElementBorders: !s.showElementBorders })),
  setPendingDelete: (info) => set({ pendingDelete: info }),
  setPendingInsert: (info) => set({ pendingInsert: info }),
}))
