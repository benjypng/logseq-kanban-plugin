import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { BlockEntity, BlockUUIDTuple } from '@logseq/libs/dist/LSPlugin'
import React, { useEffect, useState } from 'react'

interface SortableItemProps {
  id: string
  children: React.ReactNode
}

const SortableItem: React.FC<SortableItemProps> = ({ id, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="task"
    >
      {children}
    </div>
  )
}

interface ColumnProps {
  id: string
  title: string
  tasks: (BlockEntity | BlockUUIDTuple)[]
}

const Column: React.FC<ColumnProps> = ({ id, title, tasks }) => {
  const { setNodeRef } = useDroppable({
    id: id,
  })

  return (
    <div ref={setNodeRef} className="column" data-column-id={id}>
      <h2>{title}</h2>
      <SortableContext
        items={tasks.map((task) =>
          typeof task === 'object' && 'uuid' in task ? task.uuid : task[1],
        )}
        strategy={verticalListSortingStrategy}
      >
        {tasks.map((task) => {
          const taskId =
            typeof task === 'object' && 'uuid' in task ? task.uuid : task[1]
          const taskContent =
            typeof task === 'object' && 'content' in task
              ? task.content
              : task[1]
          return (
            <SortableItem key={taskId} id={taskId}>
              {taskContent}
            </SortableItem>
          )
        })}
      </SortableContext>
    </div>
  )
}

interface KanbanBoardProps {
  uuid: string
  data: BlockEntity[]
}

export const KanbanBoard = ({ uuid, data }: KanbanBoardProps) => {
  const [columns, setColumns] = useState<BlockEntity[]>(data)
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(useSensor(PointerSensor))

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      setColumns((prevColumns) => {
        const newColumns = JSON.parse(
          JSON.stringify(prevColumns),
        ) as BlockEntity[]

        let sourceColumnIndex: number | undefined,
          destColumnIndex: number | undefined,
          sourceItemIndex: number | undefined,
          destItemIndex: number | undefined

        // Find source column and item index
        newColumns.forEach((column, columnIndex: number) => {
          const itemIndex = column.children?.findIndex(
            (item) =>
              (typeof item === 'object' && 'uuid' in item
                ? item.uuid
                : item[1]) === active.id,
          )
          if (itemIndex !== -1 && itemIndex !== undefined) {
            sourceColumnIndex = columnIndex
            sourceItemIndex = itemIndex
          }
        })

        // Find destination column
        destColumnIndex = newColumns.findIndex(
          (column: BlockEntity) => column.uuid === over?.id,
        )
        if (destColumnIndex === -1) {
          // If not dropped on a column, find the column containing the item
          newColumns.forEach((column, columnIndex) => {
            const itemIndex = column.children?.findIndex(
              (item) =>
                (typeof item === 'object' && 'uuid' in item
                  ? item.uuid
                  : item[1]) === over?.id,
            )
            if (itemIndex !== -1 && itemIndex !== undefined) {
              destColumnIndex = columnIndex
              destItemIndex = itemIndex
            }
          })
        }

        if (
          sourceColumnIndex !== undefined &&
          destColumnIndex !== undefined &&
          sourceItemIndex !== undefined
        ) {
          // Move the item
          const [movedItem] =
            newColumns[sourceColumnIndex]?.children?.splice(
              sourceItemIndex,
              1,
            ) || []

          if (movedItem) {
            if (destItemIndex !== undefined) {
              // Insert before the item it was dropped on
              newColumns[destColumnIndex]?.children?.splice(
                destItemIndex,
                0,
                movedItem,
              )
            } else {
              // If dropped directly on a column, add to the end
              newColumns[destColumnIndex]?.children?.push(movedItem)
            }

            // Update the parent of the moved item
            if (typeof movedItem === 'object' && 'parent' in movedItem) {
              movedItem.parent = { id: newColumns[destColumnIndex]!.id }
            }
          }
        }

        updateBlocks(newColumns)
        return newColumns
      })
    }
    setActiveId(null)
  }

  const updateBlocks = async (columns: any) => {
    const blk = await logseq.Editor.getBlock(uuid, { includeChildren: true })
    if (!blk) return
    blk.children?.forEach(async (blk) => {
      await logseq.Editor.removeBlock((blk as BlockEntity).uuid)
    })
    console.log(columns)
    await logseq.Editor.insertBatchBlock(uuid, columns, {
      sibling: false,
      keepUUID: true,
    })
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
    <div className="kanban-board">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {columns.map((column: BlockEntity) => (
          <Column
            key={column.uuid}
            id={column.uuid}
            title={column.content || ''}
            tasks={column.children || []}
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
  uuid: string
  data: BlockEntity[]
}

const KanbanDnd: React.FC<KanbanDndProps> = ({ uuid, data }) => {
  return (
    <div className="app">
      <h1>Kanban Board</h1>
      <KanbanBoard uuid={uuid} data={data} />
    </div>
  )
}

export default KanbanDnd
