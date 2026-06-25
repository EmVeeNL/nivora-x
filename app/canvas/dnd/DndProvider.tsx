import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type MutableRefObject,
  type ReactNode,
} from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { Icon } from '@iconify/react'
import { useDocumentStore } from '@/document/store'
import { useUiStore } from '@/state/uiStore'
import { canInteract } from '@/document/canInteract'
import { getElementDefinition } from '@/elements/registry'
import { generateId } from '@/document/ids'
import type { NxNode } from '@/document/schema/types'
import type { DropDescriptor } from './dropResolution'

// ---------------------------------------------------------------------------
// Dragged-item shapes
// ---------------------------------------------------------------------------

export type DraggedItem =
  | { intent: 'insert'; elementType: string }
  | { intent: 'move'; nodeId: string }

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface DndEditorContextValue {
  isDragging: boolean
  draggedItem: DraggedItem | null
  /** Write the current resolved drop position here on pointer-move. */
  dropDescriptorRef: MutableRefObject<DropDescriptor | null>
  /** Tree navigator writes its resolved drop position here on pointer-move. */
  treeDropDescriptorRef: MutableRefObject<DropDescriptor | null>
}

const DndEditorContext = createContext<DndEditorContextValue | null>(null)

export function useDndEditor(): DndEditorContextValue {
  const ctx = useContext(DndEditorContext)
  if (!ctx) throw new Error('useDndEditor must be used inside DndProvider')
  return ctx
}

// ---------------------------------------------------------------------------
// DragOverlay ghost
// ---------------------------------------------------------------------------

function DragGhost({ item }: { item: DraggedItem | null }) {
  if (!item) return null

  let label = ''
  let icon = ''

  if (item.intent === 'insert') {
    const def = getElementDefinition(item.elementType)
    label = def.label
    icon = def.icon
  } else {
    const tree = useDocumentStore.getState().tree
    const node = tree?.nodes[item.nodeId]
    if (node) {
      const def = getElementDefinition(node.type)
      label = def.label
      icon = def.icon
    }
  }

  return (
    <div className="flex cursor-grabbing items-center gap-2 rounded border border-primary bg-background px-3 py-1.5 text-sm shadow-lg">
      {icon && <Icon icon={icon} width={14} height={14} className="text-muted-foreground" />}
      <span>{label}</span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

interface DndProviderProps {
  children: ReactNode
}

/**
 * Wraps the entire editor with dnd-kit's DndContext.
 * Manages drag state and commits insert / move on drag-end.
 *
 * Cross-iframe strategy: when isDragging is true, CanvasFrame sets
 * pointer-events:none on the <iframe>, and CanvasDropOverlay (a fixed
 * full-viewport div) captures pointer events so dnd-kit sensors keep firing.
 */
export function DndProvider({ children }: DndProviderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [draggedItem, setDraggedItem] = useState<DraggedItem | null>(null)
  const dropDescriptorRef = useRef<DropDescriptor | null>(null)
  const treeDropDescriptorRef = useRef<DropDescriptor | null>(null)
  const previewMode = useUiStore((s) => s.previewMode)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor),
  )

  function handleDragStart(event: DragStartEvent) {
    if (previewMode) return

    const data = event.active.data.current as Record<string, unknown> | undefined
    if (!data) return

    if (data['intent'] === 'insert' && typeof data['elementType'] === 'string') {
      setDraggedItem({ intent: 'insert', elementType: data['elementType'] })
    } else if (data['intent'] === 'move' && typeof data['nodeId'] === 'string') {
      const node = useDocumentStore.getState().tree?.nodes[data['nodeId']]
      if (!node || !canInteract(node)) return
      setDraggedItem({ intent: 'move', nodeId: data['nodeId'] })
    }
    setIsDragging(true)
    dropDescriptorRef.current = null
    treeDropDescriptorRef.current = null
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function handleDragEnd(_e: DragEndEvent) {
    const descriptor = dropDescriptorRef.current ?? treeDropDescriptorRef.current
    const item = draggedItem

    setIsDragging(false)
    setDraggedItem(null)
    dropDescriptorRef.current = null
    treeDropDescriptorRef.current = null
    useUiStore.getState().setHoveredId(null)

    if (!descriptor || !descriptor.valid || !item) return

    const { targetParentId, index } = descriptor
    const store = useDocumentStore.getState()

    if (item.intent === 'insert') {
      const def = getElementDefinition(item.elementType)
      if (def.insertConfig) {
        // Show config modal before inserting
        useUiStore
          .getState()
          .setPendingInsert({ elementType: item.elementType, targetParentId, index })
        return
      }
      const node: NxNode = {
        id: generateId(),
        type: item.elementType,
        props: { ...def.defaultProps },
        children: [],
        overrides: {},
        meta: {},
      }
      store.insertNode(node, targetParentId, index)
      store.selectNode(node.id)
    } else {
      const success = store.moveNode(item.nodeId, targetParentId, index)
      if (success) store.selectNode(item.nodeId)
    }
  }

  function handleDragCancel() {
    setIsDragging(false)
    setDraggedItem(null)
    dropDescriptorRef.current = null
    treeDropDescriptorRef.current = null
  }

  useEffect(() => {
    if (!previewMode || !isDragging) return
    setIsDragging(false)
    setDraggedItem(null)
    dropDescriptorRef.current = null
    treeDropDescriptorRef.current = null
  }, [previewMode, isDragging])

  return (
    <DndEditorContext.Provider
      value={{ isDragging, draggedItem, dropDescriptorRef, treeDropDescriptorRef }}
    >
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        {children}
        <DragOverlay dropAnimation={null}>
          <DragGhost item={draggedItem} />
        </DragOverlay>
      </DndContext>
    </DndEditorContext.Provider>
  )
}
