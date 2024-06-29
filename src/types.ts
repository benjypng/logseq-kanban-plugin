export interface Card {
  id: string;
  description: string;
}

export interface Column {
  id: string;
  title: string;
  cards: Card[];
}

export interface ParamsProps {
  [key: string]: string | undefined;
  card_w?: string;
  board_w?: string;
  data_type?: "query" | "query-tasks" | "tasks" | "";
}

export interface KanbanProps {
  data: { columns: Column[] };
  query?: boolean;
}

export type Task = "TODO" | "DOING" | "NOW" | "LATER" | "DONE";
