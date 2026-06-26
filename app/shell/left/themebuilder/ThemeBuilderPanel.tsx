import { useEffect, useState } from 'react'
import { Icon } from '@iconify/react'
import { cn } from '@/lib/utils'
import { getBootstrapData } from '@/lib/bootstrap'
import { useTemplateStore } from '@/templates/store'
import {
  getTemplateContext,
  TEMPLATE_TYPES,
  TEMPLATE_TYPE_ICONS,
  TEMPLATE_TYPE_LABELS,
  type TemplateType,
} from '@/templates/TemplateEditorContext'
import { ConditionsEditor } from '@/templates/conditions/ConditionsEditor'
import type { TemplateSummary } from '@/templates/api'

/**
 * In-editor Theme Builder. Lists templates grouped by type, lets the user
 * create a template (which opens it in the editor) and delete templates. This
 * is the activity-bar entry point for the WordPress-style templates section.
 */
export function ThemeBuilderPanel() {
  const templates = useTemplateStore((s) => s.templates)
  const status = useTemplateStore((s) => s.status)
  const error = useTemplateStore((s) => s.error)
  const [creatingType, setCreatingType] = useState<TemplateType | null>(null)

  useEffect(() => {
    if (useTemplateStore.getState().status === 'idle') {
      void useTemplateStore.getState().load()
    }
  }, [])

  const currentPostId = getBootstrapData()?.postId ?? 0
  const editingTemplate = getTemplateContext().isTemplate && currentPostId > 0

  return (
    <div className="flex flex-col gap-3 px-2 py-3 text-xs">
      {editingTemplate && (
        <div className="rounded border border-border/60 bg-accent/30 p-2">
          <ConditionsEditor templateId={currentPostId} />
        </div>
      )}

      <div className="flex items-center justify-between px-1">
        <span className="font-medium text-foreground">Templates</span>
        <button
          type="button"
          data-testid="theme-builder-refresh"
          aria-label="Refresh templates"
          onClick={() => void useTemplateStore.getState().load()}
          className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-accent/50 hover:text-foreground"
        >
          <Icon
            icon={status === 'loading' ? 'tabler:loader-2' : 'tabler:refresh'}
            width={14}
            height={14}
            className={cn(status === 'loading' && 'animate-spin')}
          />
        </button>
      </div>

      {error && (
        <p className="rounded bg-destructive/10 px-2 py-1 text-[11px] text-destructive">{error}</p>
      )}

      <div className="flex flex-col gap-3">
        {TEMPLATE_TYPES.map((type) => {
          const group = templates.filter((t) => t.type === type)
          return (
            <TemplateTypeGroup
              key={type}
              type={type}
              templates={group}
              currentPostId={currentPostId}
              isCreating={creatingType === type}
              onStartCreate={() => setCreatingType(type)}
              onCancelCreate={() => setCreatingType(null)}
            />
          )
        })}
      </div>
    </div>
  )
}

interface GroupProps {
  type: TemplateType
  templates: TemplateSummary[]
  currentPostId: number
  isCreating: boolean
  onStartCreate: () => void
  onCancelCreate: () => void
}

function TemplateTypeGroup({
  type,
  templates,
  currentPostId,
  isCreating,
  onStartCreate,
  onCancelCreate,
}: GroupProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2 px-1 text-muted-foreground">
        <Icon icon={TEMPLATE_TYPE_ICONS[type]} width={14} height={14} className="shrink-0" />
        <span className="flex-1 text-[11px] font-medium uppercase tracking-wider">
          {TEMPLATE_TYPE_LABELS[type]}
        </span>
        <button
          type="button"
          aria-label={`Add ${TEMPLATE_TYPE_LABELS[type]} template`}
          data-testid={`theme-builder-add-${type}`}
          onClick={onStartCreate}
          className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:bg-accent/50 hover:text-foreground"
        >
          <Icon icon="tabler:plus" width={13} height={13} />
        </button>
      </div>

      {templates.map((template) => (
        <TemplateRow
          key={template.id}
          template={template}
          isCurrent={template.id === currentPostId}
        />
      ))}

      {templates.length === 0 && !isCreating && (
        <p className="px-2 py-1 text-[11px] text-muted-foreground/50">No templates yet.</p>
      )}

      {isCreating && <CreateRow type={type} onDone={onCancelCreate} />}
    </div>
  )
}

function TemplateRow({ template, isCurrent }: { template: TemplateSummary; isCurrent: boolean }) {
  return (
    <div
      className={cn(
        'group flex items-center gap-2 rounded px-2 py-1.5',
        isCurrent ? 'bg-accent text-foreground' : 'hover:bg-accent/50',
      )}
    >
      <a
        href={template.editUrl}
        data-testid={`theme-builder-template-${template.id}`}
        className="flex-1 truncate text-left text-foreground/90 hover:text-foreground"
      >
        {template.title || '(untitled)'}
      </a>
      {isCurrent && <span className="text-[9px] uppercase text-primary">editing</span>}
      <button
        type="button"
        aria-label={`Delete ${template.title}`}
        data-testid={`theme-builder-delete-${template.id}`}
        onClick={() => {
          if (window.confirm(`Delete template “${template.title}”?`)) {
            void useTemplateStore.getState().remove(template.id)
          }
        }}
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
      >
        <Icon icon="tabler:trash" width={13} height={13} />
      </button>
    </div>
  )
}

function CreateRow({ type, onDone }: { type: TemplateType; onDone: () => void }) {
  const [title, setTitle] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    setBusy(true)
    const editUrl = await useTemplateStore.getState().create(type, title.trim())
    if (editUrl) {
      window.location.href = editUrl
      return
    }
    setBusy(false)
    onDone()
  }

  return (
    <div className="flex items-center gap-1 px-1 py-1">
      <input
        autoFocus
        value={title}
        disabled={busy}
        placeholder={`${TEMPLATE_TYPE_LABELS[type]} name…`}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') void submit()
          if (e.key === 'Escape') onDone()
        }}
        className="h-7 flex-1 rounded border border-border bg-background px-2 text-xs text-foreground outline-none focus:border-primary"
      />
      <button
        type="button"
        data-testid={`theme-builder-create-${type}`}
        disabled={busy}
        onClick={() => void submit()}
        className="flex h-7 items-center rounded bg-primary px-2 text-[11px] font-medium text-primary-foreground disabled:opacity-50"
      >
        {busy ? '…' : 'Create'}
      </button>
    </div>
  )
}
