import type React from 'react'
import type { NxNode } from '@/document/schema/types'
import type { Breakpoint } from '@/state/uiStore'
import { resolveNodeStyles, resolveHiddenAtBreakpoint } from './resolveStyles'

export function getEditorInlineStyles(node: NxNode, breakpoint: Breakpoint): React.CSSProperties {
  return resolveNodeStyles(node, breakpoint)
}

export function isHiddenAtBreakpoint(node: NxNode, breakpoint: Breakpoint): boolean {
  return resolveHiddenAtBreakpoint(node, breakpoint)
}
