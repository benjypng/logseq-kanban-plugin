import { KanbanProps } from "~/types";
import Board from "@asseinfo/react-kanban";
import { kanbanStyle } from "./styles";

export const Kanban = (columns: KanbanProps) => {
  logseq.provideStyle(kanbanStyle);

  if (!columns || columns.columns.length === 0) {
    return (
      <div className="wrapper">
        Enter some parameters, data or access the README for more instructions.
      </div>
    );
  } else {
    return (
      <div className="wrapper">
        <Board>{columns}</Board>
      </div>
    );
  }
};
