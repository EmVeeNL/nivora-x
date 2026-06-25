import { Icon } from '@iconify/react'
import { useDraggable } from '@dnd-kit/core'
import { cn } from '@/lib/utils'
import type { ElementDefinition } from '@/elements/types'

interface ElementCardProps {
  def: ElementDefinition
}

/**
 * A draggable tile representing one registered element type.
 * Displayed as a vertical icon + label card inside a grid.
 */
export function ElementCard({ def }: ElementCardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `insert:${def.type}`,
    data: { intent: 'insert', elementType: def.type },
  })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      data-testid={`element-card-${def.type}`}
      title={def.label}
      className={cn(
        'flex h-[52px] cursor-grab flex-col items-center justify-center gap-1 rounded px-1',
        'select-none transition-colors hover:bg-accent/50 active:cursor-grabbing',
        isDragging && 'opacity-40',
      )}
      aria-label={`Add ${def.label}`}
    >
      <Icon icon={def.icon} width={18} height={18} className="shrink-0 text-muted-foreground" />
      <span className="w-full truncate text-center text-[10px] leading-tight text-foreground/70">
        {def.label}
      </span>
    </div>
  )
}
