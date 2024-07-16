import Board from '@asseinfo/react-kanban'

import { KanbanProps } from '../../types'

export const Kanban = ({ data, query }: KanbanProps) => {
  const { columns } = data
  if (!columns || columns.length === 0) {
    return (
      <div className="wrapper">
        Enter some parameters, data or access the README for more instructions.
      </div>
    )
  } else {
    return (
      <div className="wrapper">
        <Board>{data}</Board>
        {query && (
          <button className="query-btn" data-on-click="render">
            Re-render Query Data
          </button>
        )}
      </div>
    )
  }
}
