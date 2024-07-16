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
        delay: 100,
        tolerance: 5,
      },
    }),
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      try {
        const findColumnAndIndex = (
          id: string,
        ): [BlockEntity | undefined, number | undefined] => {
          for (const column of columns) {
            if (column.uuid === id) return [column, -1]
            const index = column.children?.findIndex(
              (item) =>
                (typeof item === 'object' && 'uuid' in item
                  ? item.uuid
                  : item[1]) === id,
            )
            if (index !== -1 && index !== undefined) {
              return [column, index]
            }
          }
          return [undefined, undefined]
        }

        const [sourceColumn, sourceItemIndex] = findColumnAndIndex(
          active.id as string,
        )
        const [destColumn, destItemIndex] = findColumnAndIndex(
          over?.id as string,
        )

        if (sourceColumn && destColumn && sourceItemIndex !== undefined) {
          const sourceItem = sourceColumn.children?.[sourceItemIndex]
          const sourceUUID =
            typeof sourceItem === 'object' && 'uuid' in sourceItem
              ? sourceItem.uuid
              : sourceItem?.[1]

          let targetUUID: string
          let moveParams: { before: boolean; children: boolean }

          if (destItemIndex === -1) {
            // Move card to empty column or top of column
            targetUUID = destColumn.uuid
            moveParams = { before: false, children: true }
          } else if (destItemIndex === 0) {
            // Move card to first item in non-empty column
            const firstItem = destColumn.children?.[0]
            if (!firstItem) return
            targetUUID =
              typeof firstItem === 'object' && 'uuid' in firstItem
                ? firstItem.uuid
                : firstItem[1]
            moveParams = { before: true, children: true }
          } else {
            // Move card to specific position in a column
            if (!destItemIndex) return
            const targetItem = destColumn.children?.[destItemIndex]
            if (!targetItem) return
            targetUUID =
              typeof targetItem === 'object' && 'uuid' in targetItem
                ? targetItem.uuid
                : targetItem[1]
            moveParams = { before: false, children: false }
          }

          if (sourceUUID && targetUUID) {
            await logseq.Editor.moveBlock(sourceUUID, targetUUID, moveParams)

            const [movedItem] =
              sourceColumn.children?.splice(sourceItemIndex, 1) || []
            if (movedItem) {
              if (destItemIndex === -1) {
                destColumn.children = destColumn.children || []
                destColumn.children.unshift(movedItem)
              } else {
                destColumn.children?.splice(destItemIndex, 0, movedItem)
              }
            }
            setColumns(columns)
          }
        }
      } catch (error) {
        console.error('Error moving block:', error)
      }
    }
    setActiveId(null)
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
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
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
