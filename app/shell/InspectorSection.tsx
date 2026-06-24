import { Icon } from '@iconify/react'
import { cn } from '@/lib/utils'
import { useUiStore } from '@/state/uiStore'

interface InspectorSectionProps {
  id: string
  title: string
  children: React.ReactNode
}

/** A control-row placeholder: label on the left, grey pill on the right. */
export function ControlRow({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="h-6 w-20 rounded bg-input" aria-hidden="true" />
    </div>
  )
}

/** A row of small toggle-button placeholders (e.g. flex-direction, align). */
export function ButtonGroupRow({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex gap-0.5" aria-hidden="true">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="h-6 w-6 rounded border border-border bg-input" />
        ))}
      </div>
    </div>
  )
}

export function InspectorSection({ id, title, children }: InspectorSectionProps) {
  const isOpen = useUiStore((s) => s.openSections[id] ?? false)

  return (
    <div className="border-b border-border">
      <button
        type="button"
        onClick={() => useUiStore.getState().toggleSection(id)}
        aria-expanded={isOpen}
        aria-controls={`section-body-${id}`}
        className={cn(
          'flex h-9 w-full items-center justify-between px-3 transition-colors',
          'text-xs font-semibold uppercase tracking-wider text-label hover:text-foreground',
        )}
      >
        {title}
        <Icon
          icon={isOpen ? 'tabler:chevron-down' : 'tabler:chevron-right'}
          width={12}
          height={12}
        />
      </button>

      {isOpen && (
        <div id={`section-body-${id}`} className="px-3 pb-3 pt-0.5">
          {children}
        </div>
      )}
    </div>
  )
}
