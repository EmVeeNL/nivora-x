import type { NxNode } from '@/document/schema/types'
import type { Breakpoint } from '@/state/uiStore'
import type { BreakpointConfig } from '@/breakpoints/config'
import type { StyleState } from '@/document/schema/types'
import { resolveHiddenAtBreakpoint } from './resolveStyles'

export function isHiddenAtBreakpoint(
  node: NxNode,
  breakpoint: Breakpoint,
  breakpoints?: BreakpointConfig[],
  state?: StyleState,
): boolean {
  return resolveHiddenAtBreakpoint(node, breakpoint, breakpoints, state)
}
