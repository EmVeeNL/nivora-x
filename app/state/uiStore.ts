import { create } from 'zustand'

export type Breakpoint = 'desktop' | 'tablet' | 'mobile'

/** Canvas iframe width for each breakpoint (px). */
export const BREAKPOINT_WIDTHS: Record<Breakpoint, number> = {
  desktop: 1440,
  tablet: 768,
  mobile: 375,
}

interface UiState {
  /** Which left-panel is open; null = sidebar collapsed. */
  activeLeftPanel: string | null
  rightPanelOpen: boolean
  activeBreakpoint: Breakpoint
  activeInspectorTab: string
  /** Keyed by section id — true = expanded. */
  openSections: Record<string, boolean>
  /** Node currently under the pointer in the canvas; null when none. */
  hoveredId: string | null
  /** Navigator rows collapsed by node id. */
  navigatorCollapsed: Record<string, true>
}

interface UiActions {
  /** Open a specific left panel, or pass null to collapse the sidebar. */
  setLeftPanel(this: void, panel: string | null): void
  toggleRightPanel(this: void): void
  setBreakpoint(this: void, bp: Breakpoint): void
  setInspectorTab(this: void, tab: string): void
  toggleSection(this: void, id: string): void
  setSectionOpen(this: void, id: string, open: boolean): void
  setHoveredId(this: void, id: string | null): void
  setNavigatorCollapsed(this: void, nodeId: string, collapsed: boolean): void
}

export const useUiStore = create<UiState & UiActions>()((set) => ({
  // ---- state ----
  activeLeftPanel: 'navigator',
  rightPanelOpen: true,
  activeBreakpoint: 'desktop',
  activeInspectorTab: 'style',
  hoveredId: null,
  navigatorCollapsed: {},
  openSections: {
    layout: true,
    spacing: true,
    size: false,
    typography: false,
    position: false,
    border: false,
    effects: false,
  },

  // ---- actions ----
  setLeftPanel: (panel) => set({ activeLeftPanel: panel }),
  toggleRightPanel: () => set((s) => ({ rightPanelOpen: !s.rightPanelOpen })),
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
}))
