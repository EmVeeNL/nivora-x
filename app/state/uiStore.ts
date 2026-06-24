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
}

interface UiActions {
  /** Open a specific left panel, or pass null to collapse the sidebar. */
  setLeftPanel(panel: string | null): void
  toggleRightPanel(): void
  setBreakpoint(bp: Breakpoint): void
  setInspectorTab(tab: string): void
  toggleSection(id: string): void
  setSectionOpen(id: string, open: boolean): void
}

export const useUiStore = create<UiState & UiActions>()((set) => ({
  // ---- state ----
  activeLeftPanel: 'navigator',
  rightPanelOpen: true,
  activeBreakpoint: 'desktop',
  activeInspectorTab: 'style',
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
}))
