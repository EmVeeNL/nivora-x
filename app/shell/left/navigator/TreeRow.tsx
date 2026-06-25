import { useState, type KeyboardEvent } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { Icon } from '@iconify/react'
import { canInteract, isHidden, isLocked } from '@/document/canInteract'
import { useDocumentStore } from '@/document/store'
import type { NxNode } from '@/document/schema/types'
import { getElementDefinition, hasElement } from '@/elements/registry'
import { cn } from '@/lib/utils'

interface TreeRowProps {
  node: NxNode
  depth: number
  selected: boolean
  expanded: boolean
  canExpand: boolean
  onSelect(this: void, nodeId: string): void
  onToggleExpanded(this: void, nodeId: string): void
}

function nodeIcon(type: string): string {
  if (!hasElement(type)) return 'tabler:layout-grid'
  return getElementDefinition(type).icon
}

export function nodeLabel(node: NxNode): string {
  if (node.meta.name) return node.meta.name
  const htmlId = node.props['htmlId']
  if (typeof htmlId === 'string' && htmlId.trim()) return `#${htmlId.trim()}`
  if (!hasElement(node.type)) return 'Page'
  return getElementDefinition(node.type).label
}

export function TreeRow({
  node,
  depth,
  selected,
  expanded,
  canExpand,
  onSelect,
  onToggleExpanded,
}: TreeRowProps) {
  const [renaming, setRenaming] = useState(false)
  const [draftName, setDraftName] = useState(nodeLabel(node))
  const interactive = canInteract(node)
  const hidden = isHidden(node)
  const locked = isLocked(node)
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `tree:${node.id}`,
    data: { intent: 'move', nodeId: node.id },
    disabled: !interactive,
  })

  function commitRename() {
    const name = draftName.trim()
    useDocumentStore.getState().updateMeta(node.id, { name })
    setRenaming(false)
  }

  function handleNameKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') commitRename()
    if (event.key === 'Escape') {
      setDraftName(nodeLabel(node))
      setRenaming(false)
    }
  }

  function toggleVisible() {
    useDocumentStore.getState().updateMeta(node.id, { visible: hidden ? true : false })
  }

  function toggleLocked() {
    useDocumentStore.getState().updateMeta(node.id, { locked: locked ? false : true })
  }

  function duplicate() {
    if (!interactive) return
    const newId = useDocumentStore.getState().duplicateNode(node.id)
    if (newId) useDocumentStore.getState().selectNode(newId)
  }

  function remove() {
    if (!interactive) return
    useDocumentStore.getState().removeNode(node.id)
  }

  return (
    <li
      role="treeitem"
      data-row-id={node.id}
      aria-selected={selected}
      aria-expanded={canExpand ? expanded : undefined}
      style={{ paddingLeft: `${depth * 12 + 2}px` }}
      className={cn(
        'group relative flex h-7 items-center gap-1 pr-1',
        selected
          ? 'bg-primary/15 text-foreground'
          : 'text-foreground/75 hover:bg-accent/50 hover:text-foreground',
        isDragging && 'opacity-40',
        !interactive && 'text-muted-foreground',
      )}
      onClick={() => {
        if (interactive) onSelect(node.id)
      }}
      onDoubleClick={() => {
        if (interactive) setRenaming(true)
      }}
    >
      {/* Drag handle — reveals on hover, drag source for tree reorder */}
      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
        title="Drag to reorder"
        className={cn(
          'flex h-5 w-4 shrink-0 items-center justify-center rounded',
          interactive
            ? 'cursor-grab opacity-0 group-hover:opacity-40 active:cursor-grabbing active:opacity-70'
            : 'pointer-events-none opacity-0',
        )}
      >
        <Icon icon="tabler:grip-vertical" width={10} height={10} />
      </div>

      {/* Expand / collapse toggle */}
      <button
        type="button"
        className="flex h-4 w-4 shrink-0 items-center justify-center rounded hover:bg-accent disabled:hover:bg-transparent"
        onClick={(event) => {
          event.stopPropagation()
          if (canExpand) onToggleExpanded(node.id)
        }}
        aria-label={canExpand ? (expanded ? 'Collapse' : 'Expand') : 'No children'}
        disabled={!canExpand}
        tabIndex={-1}
      >
        {canExpand ? (
          <Icon
            icon={expanded ? 'tabler:chevron-down' : 'tabler:chevron-right'}
            width={10}
            height={10}
            className="text-muted-foreground"
          />
        ) : (
          <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
        )}
      </button>

      <Icon
        icon={nodeIcon(node.type)}
        width={13}
        height={13}
        className={cn('shrink-0', selected ? 'text-primary' : 'text-muted-foreground')}
      />

      {renaming ? (
        <input
          className="h-5 min-w-0 flex-1 rounded border border-input bg-background px-1 text-[11px] outline-none"
          value={draftName}
          autoFocus
          onChange={(event) => setDraftName(event.target.value)}
          onClick={(event) => event.stopPropagation()}
          onDoubleClick={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
          onBlur={commitRename}
          onKeyDown={handleNameKeyDown}
        />
      ) : (
        <span className={cn('min-w-0 flex-1 truncate text-[11px]', hidden && 'line-through')}>
          {nodeLabel(node)}
        </span>
      )}

      {/* Action buttons — absolutely positioned so they overlay the label instead of
          squeezing it. Gradient background fades in with the row hover state. */}
      <div
        className={cn(
          'pointer-events-none absolute bottom-0 right-0 top-0 flex items-center pr-1',
          'bg-gradient-to-l from-background pl-8 to-transparent',
          'opacity-0 transition-opacity duration-100',
          'group-hover:pointer-events-auto group-hover:opacity-100',
          'group-focus-within:pointer-events-auto group-focus-within:opacity-100',
        )}
      >
        <button
          type="button"
          className="flex h-5 w-5 items-center justify-center rounded hover:bg-accent"
          aria-label={hidden ? 'Show node' : 'Hide node'}
          title={hidden ? 'Show' : 'Hide'}
          onClick={(event) => {
            event.stopPropagation()
            toggleVisible()
          }}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <Icon icon={hidden ? 'tabler:eye-off' : 'tabler:eye'} width={12} height={12} />
        </button>
        <button
          type="button"
          className="flex h-5 w-5 items-center justify-center rounded hover:bg-accent"
          aria-label={locked ? 'Unlock node' : 'Lock node'}
          title={locked ? 'Unlock' : 'Lock'}
          onClick={(event) => {
            event.stopPropagation()
            toggleLocked()
          }}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <Icon icon={locked ? 'tabler:lock' : 'tabler:lock-open'} width={12} height={12} />
        </button>
        <button
          type="button"
          className="flex h-5 w-5 items-center justify-center rounded hover:bg-accent disabled:opacity-40"
          aria-label="Duplicate node"
          title="Duplicate"
          disabled={!interactive}
          onClick={(event) => {
            event.stopPropagation()
            duplicate()
          }}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <Icon icon="tabler:copy" width={12} height={12} />
        </button>
        <button
          type="button"
          className="flex h-5 w-5 items-center justify-center rounded hover:bg-destructive/15 hover:text-destructive disabled:opacity-40"
          aria-label="Delete node"
          title="Delete"
          disabled={!interactive}
          onClick={(event) => {
            event.stopPropagation()
            remove()
          }}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <Icon icon="tabler:trash" width={12} height={12} />
        </button>
      </div>
    </li>
  )
}
