import { useEffect } from 'react'
import type { RefObject } from 'react'
import { useDocumentStore } from '@/document/store'
import { useUiStore } from '@/state/uiStore'
import { generateCss } from '@/css/generate'

const STYLE_TAG_ID = 'nivorax-generated-css'

/**
 * Injects (and keeps updated) a <style> tag inside the editor iframe with the
 * JS-generated CSS for the current document tree + breakpoints.
 *
 * Runs whenever the tree or breakpoints change; the style tag is created on
 * first run and its textContent is patched on subsequent runs.
 */
export function useInjectGeneratedCss(iframeRef: RefObject<HTMLIFrameElement | null>): void {
  const tree = useDocumentStore((s) => s.tree)
  const breakpoints = useUiStore((s) => s.breakpoints)

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return

    const doc = iframe.contentDocument ?? iframe.contentWindow?.document
    if (!doc?.head) return

    let styleTag = doc.getElementById(STYLE_TAG_ID) as HTMLStyleElement | null
    if (!styleTag) {
      styleTag = doc.createElement('style')
      styleTag.id = STYLE_TAG_ID
      doc.head.appendChild(styleTag)
    }

    const css = tree ? generateCss(tree, breakpoints) : ''
    styleTag.textContent = css
  }, [tree, breakpoints, iframeRef])
}
