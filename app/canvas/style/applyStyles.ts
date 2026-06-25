import type { NxNode } from '@/document/schema/types'
import type { Breakpoint } from '@/state/uiStore'
import { resolveHiddenAtBreakpoint } from './resolveStyles'

export function isHiddenAtBreakpoint(node: NxNode, breakpoint: Breakpoint): boolean {
  return resolveHiddenAtBreakpoint(node, breakpoint)
}
