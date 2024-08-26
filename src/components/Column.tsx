import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { BlockEntity } from '@logseq/libs/dist/LSPlugin'
import React, { useEffect, useState } from 'react'

import { SortableItem } from '../components/SortableItem'
import { processContent } from '../libs/process-content'

interface ColumnProps {
  id: string
  title: string
  tasks: BlockEntity[]
}

export const Column: React.FC<ColumnProps> = ({ id, title, tasks }) => {
  const { setNodeRef } = useDroppable({ id })
  const [parsedTasks, setParsedTasks] = useState<
    { id: string; content: React.ReactNode }[]
  >([])

  useEffect(() => {
    const parseTasks = async () => {
      const parsed = await Promise.all(
        tasks.map(async (task: BlockEntity) => {
          const parsedContent = await processContent(task.content)
          return { id: task.uuid, content: parsedContent }
        }),
      )
      setParsedTasks(parsed)
    }

    parseTasks()
  }, [tasks])

  // const addCard = () => {
  //   // Column uuid: id
  //   // Append block to uuid
  // }
  //
  // const removeCard = () => {
  //   // Remove block
  // }
  //
  // const editCard = () => {
  //   // Update block content
  // }

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
