import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { BlockEntity, IBatchBlock } from '@logseq/libs/dist/LSPlugin'
import React, { useState } from 'react'

import { Column } from '../components/Column'

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
              console.log('Moved Item', movedItem)
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

        setTimeout(() => {
          updateBlocks(newColumns)
        }, 0)
        return newColumns
      })
    }
    setActiveId(null)
  }

  const updateBlocks = async (columns: BlockEntity[]) => {
    const blk = await logseq.Editor.getBlock(uuid, { includeChildren: true })
    if (!blk) return
    blk.children?.forEach((blk) => {
      if ('children' in blk && blk.children) {
        blk.children.forEach(async (child) => {
          await logseq.Editor.removeBlock((child as BlockEntity).uuid)
        })
      }
      //await logseq.Editor.insertBlock(blk.uuid, )
    })
    // TODO: For some reason, references are lost despite blocks retaining their UUID
    // TODO: Maybe can try to insert just the child blocks

    await logseq.Editor.insertBatchBlock(
      uuid,
      columns as unknown as IBatchBlock[],
      {
        sibling: false,
        keepUUID: true,
      },
    )
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
