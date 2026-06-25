import type React from 'react'
import type { NxNode } from '@/document/schema/types'
import type { Breakpoint } from '@/state/uiStore'
import { resolveNodeStyles } from './resolveStyles'

export function breakpointToStyleBreakpoint(bp: Breakpoint): 'base' | 'tablet' | 'mobile' {
  return bp === 'desktop' ? 'base' : bp
}

export function getEditorInlineStyles(node: NxNode, breakpoint: Breakpoint): React.CSSProperties {
  return resolveNodeStyles(node, breakpointToStyleBreakpoint(breakpoint))
}
