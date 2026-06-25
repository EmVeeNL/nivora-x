import { useState, useEffect } from 'react'
import { Icon } from '@iconify/react'
import { cn } from '@/lib/utils'
import { Button } from '@/lib/ui/button'
import { BreakpointSwitcher } from './BreakpointSwitcher'
import { AutosaveIndicator } from './AutosaveIndicator'
import { useDocumentStore } from '@/document/store'
import { useUiStore } from '@/state/uiStore'
import { useTokenStore } from '@/tokens/store'
import { saveDraft, publishDocument } from '@/document/persistence'
import { getBootstrapData } from '@/lib/bootstrap'

type SaveState = 'idle' | 'saving-draft' | 'publishing' | 'saved' | 'published' | 'error'

export function TopToolbar() {
  const documentMeta = useDocumentStore((s) => s.documentMeta)
  const isDirty = useDocumentStore((s) => s.isDirty)
  const showBorders = useUiStore((s) => s.showElementBorders)
  const previewMode = useUiStore((s) => s.previewMode)
  const activeLeftPanel = useUiStore((s) => s.activeLeftPanel)
  const tokenSearch = useUiStore((s) => s.tokenSearch)
  const isAppearance = activeLeftPanel === 'appearance'
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [isSavingTokens, setIsSavingTokens] = useState(false)
  const bs = getBootstrapData()
  const pagesUrl = bs?.pagesUrl ?? '#'
  const homeUrl = bs?.homeUrl ?? '#'
  const siteName = bs?.siteName ?? 'NivoraX'
  const busy = saveState === 'saving-draft' || saveState === 'publishing'

  // Auto-revert "saved" state after 5 seconds
  useEffect(() => {
    if (saveState === 'saved') {
      const t = setTimeout(() => setSaveState('idle'), 5000)
      return () => clearTimeout(t)
    }
  }, [saveState])

  async function handleSaveDraft() {
    if (!bs?.postId) return
    const envelope = useDocumentStore.getState().toEnvelope()
    if (!envelope) return
    setSaveState('saving-draft')
    try {
      await saveDraft(bs.postId, envelope)
      useDocumentStore.getState().markClean()
      setSaveState('saved')
    } catch {
      setSaveState('error')
    }
  }

  async function handlePublish() {
    if (!bs?.postId) return
    const envelope = useDocumentStore.getState().toEnvelope()
    if (!envelope) return
    setSaveState('publishing')
    try {
      await publishDocument(bs.postId, envelope)
      useDocumentStore.getState().markClean()
      setSaveState('published')
    } catch {
      setSaveState('error')
    }
  }

  const isSaved = saveState === 'saved'
  const isPublished = saveState === 'published'

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

      {isAppearance ? (
        <>
          {/* Center — token search */}
          <div className="flex flex-1 justify-center">
            <div className="relative">
              <Icon
                icon="tabler:search"
                width={12}
                height={12}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/60"
              />
              <input
                type="text"
                placeholder="Search tokens…"
                value={tokenSearch}
                onChange={(e) => useUiStore.getState().setTokenSearch(e.target.value)}
                className="h-7 w-56 rounded border border-border bg-background pl-7 pr-2 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Right — Upload · Download · Save Changes */}
          <div className="flex flex-1 items-center justify-end gap-2">
            {[
              { icon: 'tabler:upload', label: 'Upload', title: 'Import tokens' },
              { icon: 'tabler:download', label: 'Download', title: 'Export tokens' },
            ].map(({ icon, label, title }) => (
              <button
                key={label}
                type="button"
                title={title}
                className="flex h-7 items-center gap-1.5 rounded border border-border px-2.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <Icon icon={icon} width={13} height={13} />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}

            <button
              type="button"
              disabled={isSavingTokens}
              onClick={() => {
                setIsSavingTokens(true)
                void useTokenStore
                  .getState()
                  .save()
                  .finally(() => setIsSavingTokens(false))
              }}
              className="flex h-7 items-center gap-1.5 rounded bg-primary px-3 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {isSavingTokens ? (
                <Icon icon="tabler:loader-2" width={12} height={12} className="animate-spin" />
              ) : (
                <Icon icon="tabler:device-floppy" width={12} height={12} />
              )}
              Save Changes
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Center — device / breakpoint switcher */}
          <div className="flex flex-1 justify-center">
            <BreakpointSwitcher />
          </div>

          {/* Right — borders toggle · autosave · Save Draft · Preview · Publish */}
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

            <AutosaveIndicator />

            {/* Save Draft — shows "Saved ✓" with animated green underline for 5 s */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                aria-label="Save draft"
                disabled={busy || (!isDirty && !isSaved)}
                onClick={() => {
                  void handleSaveDraft()
                }}
                className={cn(isSaved && 'text-emerald-400')}
              >
                {saveState === 'saving-draft' ? (
                  <>
                    <Icon icon="tabler:loader-2" width={13} height={13} className="animate-spin" />
                    Saving…
                  </>
                ) : isSaved ? (
                  <>
                    <Icon icon="tabler:check" width={13} height={13} />
                    Saved
                  </>
                ) : (
                  'Save Draft'
                )}
              </Button>
              {isSaved && (
                <span
                  className="animate-save-bar absolute bottom-0 left-0 h-0.5 rounded-full bg-emerald-400"
                  aria-hidden="true"
                />
              )}
            </div>

            {saveState === 'error' && (
              <span className="text-[11px] text-destructive" aria-live="polite">
                Save failed
              </span>
            )}

            {isPublished && (
              <span className="text-[11px] text-emerald-400" aria-live="polite">
                Published
              </span>
            )}

            <Button
              variant="ghost"
              size="sm"
              aria-label={previewMode ? 'Exit preview' : 'Preview page'}
              aria-pressed={previewMode}
              disabled={busy}
              onClick={() => useUiStore.getState().togglePreviewMode()}
            >
              {previewMode ? 'Exit Preview' : 'Preview'}
            </Button>

            <Button
              size="sm"
              aria-label="Publish page"
              disabled={busy}
              onClick={() => {
                void handlePublish()
              }}
            >
              {saveState === 'publishing' ? 'Publishing…' : 'Publish'}
            </Button>
          </div>
        </>
      )}
    </>
  )
}
