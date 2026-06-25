import { useState } from 'react'
import { Icon } from '@iconify/react'
import { cn } from '@/lib/utils'
import { Button } from '@/lib/ui/button'
import { BreakpointSwitcher } from './BreakpointSwitcher'
import { useDocumentStore } from '@/document/store'
import { useUiStore } from '@/state/uiStore'
import { saveDraft, publishDocument } from '@/document/persistence'

declare global {
  interface Window {
    nivoraxBootstrap?: {
      postId: number
      mode: string
      restRoot: string
      restNonce: string
      adminUrl: string
      pagesUrl: string
      homeUrl: string
      siteName: string
      postTitle?: string
      version: string
    }
  }
}

export function TopToolbar() {
  const documentMeta = useDocumentStore((s) => s.documentMeta)
  const isDirty = useDocumentStore((s) => s.isDirty)
  const showBorders = useUiStore((s) => s.showElementBorders)
  const [saving, setSaving] = useState<'idle' | 'saving' | 'error'>('idle')
  const bs = typeof window !== 'undefined' ? window.nivoraxBootstrap : undefined
  const pagesUrl = bs?.pagesUrl ?? '#'
  const homeUrl = bs?.homeUrl ?? '#'
  const siteName = bs?.siteName ?? 'NivoraX'

  async function handleSaveDraft() {
    if (!bs?.postId) return
    const envelope = useDocumentStore.getState().toEnvelope()
    if (!envelope) return
    setSaving('saving')
    try {
      await saveDraft(bs.postId, envelope)
      useDocumentStore.getState().markClean()
      setSaving('idle')
    } catch {
      setSaving('error')
    }
  }

  async function handlePublish() {
    if (!bs?.postId) return
    const envelope = useDocumentStore.getState().toEnvelope()
    if (!envelope) return
    setSaving('saving')
    try {
      await publishDocument(bs.postId, envelope)
      useDocumentStore.getState().markClean()
      setSaving('idle')
    } catch {
      setSaving('error')
    }
  }

  return (
    <>
      {/* Left — back to pages + site name */}
      <div className="flex min-w-0 flex-1 items-center gap-1">
        <a
          href={pagesUrl}
          aria-label="Back to all pages"
          title="All Pages"
          className={cn(
            'flex h-7 items-center gap-1.5 rounded px-2 text-xs text-muted-foreground',
            'transition-colors hover:bg-accent hover:text-foreground',
          )}
        >
          <Icon icon="tabler:arrow-left" width={14} height={14} />
          <span className="hidden sm:inline">All Pages</span>
        </a>

        <span className="text-border/60 select-none">·</span>

        <a
          href={homeUrl}
          target="_blank"
          rel="noreferrer"
          aria-label={`Visit ${siteName}`}
          title={`Visit ${siteName}`}
          className={cn(
            'flex h-7 items-center gap-1.5 rounded px-2 text-xs text-muted-foreground',
            'transition-colors hover:bg-accent hover:text-foreground',
          )}
        >
          <Icon icon="tabler:world" width={14} height={14} />
          <span className="hidden md:inline">{siteName}</span>
        </a>

        <span className="text-border/60 mx-1 select-none">|</span>

        <span className="truncate text-xs font-medium text-foreground" aria-label="Page title">
          {(documentMeta['title'] as string | undefined) ?? 'Untitled Page'}
        </span>
      </div>

      {/* Center — device / breakpoint switcher */}
      <div className="flex flex-1 justify-center">
        <BreakpointSwitcher />
      </div>

      {/* Right — borders toggle · Save Draft · Preview · Publish */}
      <div className="flex flex-1 items-center justify-end gap-2">
        <button
          type="button"
          title={showBorders ? 'Hide element borders' : 'Show element borders'}
          aria-label={showBorders ? 'Hide element borders' : 'Show element borders'}
          aria-pressed={showBorders}
          onClick={() => useUiStore.getState().toggleElementBorders()}
          className={cn(
            'flex h-7 items-center gap-1.5 rounded px-2 text-xs transition-colors',
            showBorders
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:bg-accent hover:text-foreground',
          )}
        >
          <Icon icon="tabler:border-style" width={14} height={14} />
          <span className="hidden sm:inline">Borders</span>
        </button>
        {saving === 'error' && <span className="text-[11px] text-destructive">Save failed</span>}
        <Button
          variant="ghost"
          size="sm"
          aria-label="Save draft"
          disabled={saving === 'saving' || !isDirty}
          onClick={() => {
            void handleSaveDraft()
          }}
        >
          {saving === 'saving' ? 'Saving…' : 'Save Draft'}
        </Button>
        <Button variant="ghost" size="sm" aria-label="Preview page">
          Preview
        </Button>
        <Button
          size="sm"
          aria-label="Publish page"
          disabled={saving === 'saving'}
          onClick={() => {
            void handlePublish()
          }}
        >
          Publish
        </Button>
      </div>
    </>
  )
}
