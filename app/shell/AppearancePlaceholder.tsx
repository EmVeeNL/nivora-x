import { Icon } from '@iconify/react'

interface AppearancePlaceholderProps {
  title: string
  description: string
  icon: string
}

export function AppearancePlaceholder({ title, description, icon }: AppearancePlaceholderProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden bg-background">
      {/* Header */}
      <div className="shrink-0 border-b border-border bg-shell-bar px-5 py-3">
        <h1 className="text-sm font-semibold text-foreground">{title}</h1>
        <p className="mt-0.5 text-[10px] text-muted-foreground">{description}</p>
      </div>

      {/* Body */}
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-shell-bar">
            <Icon icon={icon} width={30} height={30} className="text-muted-foreground/40" />
          </div>
          <h2 className="mb-1 text-sm font-medium text-foreground/70">{title}</h2>
          <p className="text-xs text-muted-foreground/50">Coming in a future phase.</p>
        </div>
      </div>
    </div>
  )
}
