import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { BlockEntity, BlockUUIDTuple } from '@logseq/libs/dist/LSPlugin'
import React, { useEffect, useState } from 'react'

import { SortableItem } from '../components/SortableItem'
import { processContent } from '../libs/process-content'

interface ColumnProps {
  id: string
  title: string
  tasks: (BlockEntity | BlockUUIDTuple)[]
}

export const Column: React.FC<ColumnProps> = ({ id, title, tasks }) => {
  const { setNodeRef } = useDroppable({ id })
  const [parsedTasks, setParsedTasks] = useState<
    { id: string; content: React.ReactNode }[]
  >([])

  useEffect(() => {
    const parseTasks = async () => {
      const parsed = await Promise.all(
        tasks.map(async (task) => {
          const taskId =
            typeof task === 'object' && 'uuid' in task ? task.uuid : task[1]
          const taskContent =
            typeof task === 'object' && 'content' in task
              ? task.content
              : task[1]
          const parsedContent = await processContent(taskContent)
          return { id: taskId, content: parsedContent }
        }),
      )
      setParsedTasks(parsed)
    }

    parseTasks()
  }, [tasks])

  return (
    <div ref={setNodeRef} className="column" data-column-id={id}>
      <h2>{title}</h2>
      <div className="column-content">
        <SortableContext
          items={parsedTasks.map((task) => task.id)}
          strategy={verticalListSortingStrategy}
        >
          {parsedTasks.map((task) => (
            <SortableItem key={task.id} id={task.id}>
              {task.content}
            </SortableItem>
          ))}
        </SortableContext>
      </div>
    </div>
  )
}
