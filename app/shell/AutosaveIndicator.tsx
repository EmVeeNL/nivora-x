import { Icon } from '@iconify/react'
import { cn } from '@/lib/utils'
import { useDocumentStore } from '@/document/store'

const STATUS_MAP = {
  idle: { label: '', icon: 'tabler:check', tone: 'text-muted-foreground/0' },
  saving: { label: 'Saving', icon: 'tabler:loader-2', tone: 'text-muted-foreground' },
  saved: { label: 'Saved', icon: 'tabler:check', tone: 'text-muted-foreground' },
  error: { label: 'Error', icon: 'tabler:alert-circle', tone: 'text-destructive' },
} as const

export function AutosaveIndicator() {
  const status = useDocumentStore((s) => s.autosaveStatus)
  const current = STATUS_MAP[status]

  return (
    <div
      data-testid="autosave-indicator"
      aria-live="polite"
      aria-atomic="true"
      className="flex h-7 w-[5.5rem] items-center justify-end overflow-hidden text-[11px]"
    >
      <span
        className={cn(
          'flex items-center gap-1 transition-opacity',
          current.tone,
          status === 'idle' ? 'opacity-0' : 'opacity-100',
        )}
      >
        <Icon
          icon={current.icon}
          width={12}
          height={12}
          className={cn(status === 'saving' && 'animate-spin')}
        />
        <span>{current.label}</span>
      </span>
    </div>
  )
}
