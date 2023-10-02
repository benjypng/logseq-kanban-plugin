export type Card = {
  id: string;
  description: string;
};

export type Column = {
  id: string;
  title: string;
  cards: Card[];
};

export type ParamsProps = {
  [key: string]: string | undefined;
  card_w?: string;
  board_w?: string;
  data_type?: "query" | "tasks" | "";
};

export type KanbanProps = {
  columns: Column[];
};

export type Task = "TODO" | "DOING" | "NOW" | "LATER" | "DONE";
