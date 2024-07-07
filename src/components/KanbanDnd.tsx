import {
  closestCenter,
  DndContext,
  DragOverlay,
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
import { BlockEntity } from '@logseq/libs/dist/LSPlugin'
import { useState } from 'react'

const SortableItem = ({ id, children }) => {
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

const Column = ({ id, title, tasks }) => {
  const { setNodeRef } = useDroppable({
    id: id,
  })

  return (
    <div ref={setNodeRef} className="column" data-column-id={id}>
      <h2>{title}</h2>
      <SortableContext
        items={tasks.map((task) => task.uuid)}
        strategy={verticalListSortingStrategy}
      >
        {tasks.map((task) => (
          <SortableItem key={task.uuid} id={task.uuid}>
            {task.content}
          </SortableItem>
        ))}
      </SortableContext>
    </div>
  )
}

interface KanbanEvent {
  active: {
    id: string
  }
  over: {
    id: string
  }
}

export const KanbanBoard = ({ data }: { data: BlockEntity[] }) => {
  const [columns, setColumns] = useState(data)
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(useSensor(PointerSensor))

  const handleDragStart = (event: KanbanEvent) => {
    setActiveId(event.active.id)
  }

  const handleDragEnd = (event: KanbanEvent) => {
    const { active, over } = event

    console.log('Drag ended:', { active, over })

    if (active.id !== over.id) {
      setColumns((prevColumns) => {
        const newColumns = JSON.parse(
          JSON.stringify(prevColumns),
        ) as BlockEntity[]

        let sourceColumnIndex, destColumnIndex, sourceItemIndex, destItemIndex

        // Find source column and item index
        newColumns.forEach((column, columnIndex: number) => {
          const itemIndex = column.children?.findIndex(
            (item: BlockEntity) => item.uuid === active.id,
          )
          if (itemIndex !== -1) {
            sourceColumnIndex = columnIndex
            sourceItemIndex = itemIndex
          }
        })

        // Find destination column
        destColumnIndex = newColumns.findIndex(
          (column: BlockEntity) => column.uuid === over.id,
        )
        if (destColumnIndex === -1) {
          // If not dropped on a column, find the column containing the item
          newColumns.forEach((column, columnIndex) => {
            const itemIndex = column.children?.findIndex(
              (item: BlockEntity) => item.uuid === over.id,
            )
            if (itemIndex !== -1) {
              destColumnIndex = columnIndex
              destItemIndex = itemIndex
            }
          })
        }

        if (sourceColumnIndex !== undefined && destColumnIndex !== undefined) {
          // Move the item
          const [movedItem] = newColumns[sourceColumnIndex].children.splice(
            sourceItemIndex,
            1,
          )

          if (destItemIndex !== undefined) {
            // Insert before the item it was dropped on
            newColumns[destColumnIndex].children.splice(
              destItemIndex,
              0,
              movedItem,
            )
          } else {
            // If dropped directly on a column, add to the end
            newColumns[destColumnIndex].children.push(movedItem)
          }

          // Update the parent of the moved item
          movedItem.parent = { id: newColumns[destColumnIndex].id }
        }

        console.log('Updated Kanban Board State:', newColumns)

        return newColumns
      })
    }
    setActiveId(null)
  }

  const getTaskContent = (uuid: string) => {
    for (const column of columns) {
      if (!column.children) continue
      const task = column.children.find((task) => task.uuid === uuid)
      if (task) return task.content
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
            title={column.content}
            tasks={column.children}
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

const KanbanDnd = ({ data }: { data: BlockEntity[] }) => {
  return (
    <div className="app">
      <h1>Kanban Board</h1>
      <KanbanBoard data={data} />
    </div>
  )
}

export default KanbanDnd
