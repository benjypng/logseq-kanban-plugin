import {
  closestCenter,
  CollisionDetection,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { BlockEntity } from '@logseq/libs/dist/LSPlugin'
import React, { useState } from 'react'

import { Column } from '../../components/Column'

interface KanbanBoardProps {
  data: BlockEntity[]
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ data }) => {
  const [columns, setColumns] = useState<BlockEntity[]>(data)
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4,
      },
    }),
  )

  const collisionDetection: CollisionDetection = (args) => {
    if (!args.pointerCoordinates) return closestCenter(args)

    const collisions = pointerWithin({
      ...args,
      droppableContainers: args.droppableContainers.filter(
        (container) => container.id !== args.active.id,
      ),
    })
    // Cards and their containing column overlap. Prefer the card so that
    // dropping over it preserves the intended position within the column.
    const card = collisions.find(
      (collision) => !columns.some((column) => column.uuid === collision.id),
    )
    return card ? [card] : collisions.slice(0, 1)
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    try {
      const { active, over } = event
      if (!over || active.id === over.id) return

      const containsCard = (column: BlockEntity, id: string | number) =>
        column.children?.some(
          (item) =>
            (typeof item === 'object' && 'uuid' in item
              ? item.uuid
              : item[1]) === id,
        )
      const sourceColumn = columns.find((column) =>
        containsCard(column, active.id),
      )
      const destColumn = columns.find(
        (column) => column.uuid === over.id || containsCard(column, over.id),
      )
      if (!sourceColumn || !destColumn) return

      const moveParams = { before: false, children: true }
      if (destColumn.uuid !== over.id) {
        const draggedRect = active.rect.current.translated
        moveParams.before =
          !draggedRect ||
          draggedRect.top + draggedRect.height / 2 <=
            over.rect.top + over.rect.height / 2
        moveParams.children = false
      }
      await logseq.Editor.moveBlock(
        active.id as string,
        over.id as string,
        moveParams,
      )

      // Use persisted ordering and new child arrays so Column's parsing effect
      // runs again. Mutating the existing arrays leaves rendered cards stale.
      const updatedColumns = await Promise.all(
        columns.map(async (column) => {
          const block = await logseq.Editor.getBlock(column.uuid, {
            includeChildren: true,
          })
          if (!block)
            throw new Error(`Cannot reload Kanban column ${column.uuid}`)
          return { ...block, children: [...(block.children || [])] }
        }),
      )
      setColumns(updatedColumns)
    } catch (error) {
      console.error('Error moving Kanban card:', error)
      await logseq.UI.showMsg(
        'Kanban move failed or could not refresh. Reopen the page to check the saved position.',
        'error',
      )
    } finally {
      setActiveId(null)
    }
  }

  const getTaskContent = (uuid: string): string => {
    for (const column of columns) {
      if (!column.children) continue
      const task = column.children.find(
        (task) =>
          (typeof task === 'object' && 'uuid' in task ? task.uuid : task[1]) ===
          uuid,
      )
      if (task)
        return typeof task === 'object' && 'content' in task
          ? task.content || ''
          : task[1]
    }
    return ''
  }

  return (
    <div
      className="kanban-board"
      style={{
        overflowY: 'auto',
        height: '100%', // Or any other value that fits your layout
        maxHeight: '100vh', // Adjust as needed
      }}
    >
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        {columns.map((column: BlockEntity) => (
          <Column
            key={column.uuid}
            id={column.uuid}
            title={column.content || ''}
            tasks={(column.children as BlockEntity[]) || []}
          />
        ))}
        <DragOverlay>
          {activeId ? (
            <div className="task dragging">{getTaskContent(activeId)}</div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}

interface KanbanDndProps {
  data: BlockEntity[]
}

export const KanbanDnd: React.FC<KanbanDndProps> = ({ data }) => {
  return (
    <div className="app">
      <KanbanBoard data={data} />
    </div>
  )
}
