export const handleStyles = (
  slot: string,
  card_w: string | undefined,
  board_w: string | undefined,
) => {
  return `
#${slot} .query-btn {
  color: #000;
  border: 1px solid black;
  margin-top: 2px;
  margin-bottom: 2px;
  margin-left: 10px;
  padding: 1px 10px;
  border-radius: 8px;
  background-color: #eee;
}
#${slot} .kanban-static-wrapper {
  color: #000;
  max-width: ${board_w ? `${board_w}px` : '100%'};
  overflow-x: auto;
  white-space: nowrap;
}
#${slot} .kanban-static-board {
  white-space: normal;
}
#${slot} .kanban-static-board .column {
  width: ${card_w ?? 250}px;
  min-width: ${card_w ?? 250}px;
}
#${slot} .kanban-static-board .column h2,
#${slot} .kanban-static-board .task {
  white-space: normal;
  overflow-wrap: anywhere;
  word-break: normal;
}
#${slot} .kanban-static-board .task {
  cursor: default;
}
#${slot} .kanban-static-board .task:hover {
  background-color: #ffffff;
}
#${slot} .kanban-static-card-description {
  min-width: 0;
}`;
};
