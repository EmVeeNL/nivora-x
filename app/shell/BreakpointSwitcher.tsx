import { Icon } from '@iconify/react'
import { cn } from '@/lib/utils'
import { useUiStore } from '@/state/uiStore'
import { getBreakpointIcon, getBreakpointWidthFromList } from '@/breakpoints/config'

export function BreakpointSwitcher() {
  const active = useUiStore((s) => s.activeBreakpoint)
  const breakpoints = useUiStore((s) => s.breakpoints)
  return (
    <div className="flex items-center gap-0.5" role="group" aria-label="Breakpoint switcher">
      {breakpoints.map(({ id, label, width }) => (
        <button
          key={id}
          type="button"
          onClick={() => useUiStore.getState().setBreakpoint(id)}
          aria-pressed={active === id}
          aria-label={label}
          title={`${label} — ${String(width)}px`}
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded transition-colors',
            active === id
              ? 'bg-accent text-foreground'
              : 'text-muted-foreground hover:bg-accent hover:text-foreground',
          )}
        >
          <Icon icon={getBreakpointIcon(id)} width={16} height={16} />
        </button>
      ))}
      <span
        className="ml-2 min-w-[4.5rem] text-xs text-muted-foreground"
        aria-live="polite"
        aria-atomic="true"
      >
        {getBreakpointWidthFromList(breakpoints, active)}px
      </span>
    </div>
  )
}
