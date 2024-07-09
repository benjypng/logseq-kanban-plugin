import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { BlockEntity, BlockUUIDTuple } from '@logseq/libs/dist/LSPlugin'
import React from 'react'

import { SortableItem } from '../components/SortableItem'

interface ColumnProps {
  id: string
  title: string
  tasks: (BlockEntity | BlockUUIDTuple)[]
}

export const Column: React.FC<ColumnProps> = ({ id, title, tasks }) => {
  const { setNodeRef } = useDroppable({ id })

  return (
    <div ref={setNodeRef} className="column" data-column-id={id}>
      <h2>{title}</h2>
      <div className="column-content">
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
    </div>
  )
}
