import { KanbanProps } from "~/types";
import Board from "@asseinfo/react-kanban";
import { kanbanStyle } from "./styles";

export const Kanban = (columns: KanbanProps) => {
  logseq.provideStyle(kanbanStyle);

  return (
    <div className="wrapper">
      <Board>{columns}</Board>
    </div>
  );
};
