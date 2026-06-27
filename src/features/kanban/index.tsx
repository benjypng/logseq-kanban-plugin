import { KanbanProps } from '../../types'

export const Kanban = ({ data, query }: KanbanProps) => {
  const { columns } = data
  if (!columns || columns.length === 0) {
    return (
      <div className="kanban-static-wrapper">
        Enter some parameters, data or access the README for more instructions.
      </div>
    )
  } else {
    return (
      <div className="kanban-static-wrapper">
        <div className="kanban-board kanban-static-board">
          {columns.map((column) => (
            <div className="column" key={column.id}>
              <h2>{column.title}</h2>
              <div className="column-content">
                {column.cards.map((card) => (
                  <div className="task" key={card.id}>
                    <div className="kanban-static-card-description">
                      {card.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        {query && (
          <button className="query-btn" data-on-click="render">
            Re-render Query Data
          </button>
        )}
      </div>
    )
  }
}
