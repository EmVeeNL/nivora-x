import { getBootstrapData, type BootstrapBreakpoint } from '@/lib/bootstrap'

export type BreakpointDirection = 'max'
export type BreakpointId = string

export type BreakpointConfig = BootstrapBreakpoint

export const DEFAULT_BREAKPOINTS: BreakpointConfig[] = [
  { id: 'desktop', label: 'Desktop', width: 1440, direction: 'max', builtin: true },
  { id: 'tablet', label: 'Tablet', width: 768, direction: 'max', builtin: true },
  { id: 'mobile', label: 'Mobile', width: 375, direction: 'max', builtin: true },
]

const ICONS: Record<string, string> = {
  desktop: 'tabler:device-desktop',
  tablet: 'tabler:device-tablet',
  mobile: 'tabler:device-mobile',
}

function humanizeId(id: string): string {
  return id.replace(/[-_]+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}

function normalizeBreakpoint(
  entry: Partial<BreakpointConfig>,
  fallback: BreakpointConfig,
): BreakpointConfig {
  const width = Number(entry.width)
  return {
    id: typeof entry.id === 'string' && entry.id ? entry.id : fallback.id,
    label:
      typeof entry.label === 'string' && entry.label.trim() ? entry.label.trim() : fallback.label,
    width: Number.isFinite(width) && width > 0 ? Math.round(width) : fallback.width,
    direction: 'max',
    builtin: entry.builtin ?? fallback.builtin,
  }
}

function sortBreakpoints(breakpoints: BreakpointConfig[]): BreakpointConfig[] {
  if (breakpoints.length === 0) return [...DEFAULT_BREAKPOINTS]
  const [desktop, ...rest] = breakpoints
  return [desktop!, ...rest.sort((a, b) => b.width - a.width || a.label.localeCompare(b.label))]
}

export function normalizeBreakpoints(raw: BootstrapBreakpoint[] | undefined): BreakpointConfig[] {
  const incoming = Array.isArray(raw) ? raw : []
  const byId = new Map<string, BreakpointConfig>()

  for (const fallback of DEFAULT_BREAKPOINTS) {
    const match = incoming.find((entry) => entry.id === fallback.id)
    byId.set(fallback.id, normalizeBreakpoint(match ?? {}, fallback))
  }

  for (const entry of incoming) {
    if (typeof entry.id !== 'string' || !entry.id) continue
    if (byId.has(entry.id)) continue
    byId.set(
      entry.id,
      normalizeBreakpoint(entry, {
        id: entry.id,
        label: entry.label || humanizeId(entry.id),
        width: entry.width > 0 ? entry.width : 1024,
        direction: 'max',
        builtin: false,
      }),
    )
  }

  return sortBreakpoints(Array.from(byId.values()))
}

export function getBreakpoints(): BreakpointConfig[] {
  return normalizeBreakpoints(getBootstrapData()?.breakpoints)
}

export function getDefaultBreakpointId(): BreakpointId {
  return getBreakpoints()[0]?.id ?? 'desktop'
}

export function getBreakpoint(id: BreakpointId): BreakpointConfig | undefined {
  return getBreakpoints().find((breakpoint) => breakpoint.id === id)
}

export function getBreakpointWidth(id: BreakpointId): number {
  return getBreakpoint(id)?.width ?? DEFAULT_BREAKPOINTS[0]!.width
}

export function getBreakpointLabel(id: BreakpointId): string {
  return getBreakpoint(id)?.label ?? humanizeId(id)
}

export function getBreakpointIcon(id: BreakpointId): string {
  return ICONS[id] ?? 'tabler:device-desktop'
}

export function isDesktopBreakpoint(id: BreakpointId): boolean {
  return id === 'desktop'
}

export function findBreakpoint(
  breakpoints: BreakpointConfig[],
  id: BreakpointId,
): BreakpointConfig | undefined {
  return breakpoints.find((breakpoint) => breakpoint.id === id)
}

export function getBreakpointWidthFromList(
  breakpoints: BreakpointConfig[],
  id: BreakpointId,
): number {
  return findBreakpoint(breakpoints, id)?.width ?? DEFAULT_BREAKPOINTS[0]!.width
}

export function getBreakpointLabelFromList(
  breakpoints: BreakpointConfig[],
  id: BreakpointId,
): string {
  return findBreakpoint(breakpoints, id)?.label ?? humanizeId(id)
}
