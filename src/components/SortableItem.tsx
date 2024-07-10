import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import React from 'react'

interface SortableItemProps {
  id: string
  children: React.ReactNode
}
export const SortableItem: React.FC<SortableItemProps> = ({ id, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  // Handle clicks on links instead of starting drag
  const handleClick = (e: React.MouseEvent) => {
    if (e.target instanceof HTMLAnchorElement) {
      e.stopPropagation()
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="task"
      onClick={handleClick}
    >
      {children}
    </div>
  )
}
