import { Icon } from '@iconify/react'
import { cn } from '@/lib/utils'
import { useUiStore, BREAKPOINT_WIDTHS, type Breakpoint } from '@/state/uiStore'

const PRESETS: { key: Breakpoint; icon: string; label: string }[] = [
  { key: 'desktop', icon: 'tabler:device-desktop', label: 'Desktop' },
  { key: 'tablet', icon: 'tabler:device-tablet', label: 'Tablet' },
  { key: 'mobile', icon: 'tabler:device-mobile', label: 'Mobile' },
]

export function BreakpointSwitcher() {
  const active = useUiStore((s) => s.activeBreakpoint)
  return (
    <div className="flex items-center gap-0.5" role="group" aria-label="Breakpoint switcher">
      {PRESETS.map(({ key, icon, label }) => (
        <button
          key={key}
          type="button"
          onClick={() => useUiStore.getState().setBreakpoint(key)}
          aria-pressed={active === key}
          aria-label={label}
          title={`${label} — ${String(BREAKPOINT_WIDTHS[key])}px`}
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded transition-colors',
            active === key
              ? 'bg-accent text-foreground'
              : 'text-muted-foreground hover:bg-accent hover:text-foreground',
          )}
        >
          <Icon icon={icon} width={16} height={16} />
        </button>
      ))}
      <span
        className="ml-2 min-w-[4.5rem] text-xs text-muted-foreground"
        aria-live="polite"
        aria-atomic="true"
      >
        {BREAKPOINT_WIDTHS[active]}px
      </span>
    </div>
  )
}
