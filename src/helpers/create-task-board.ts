import { BlockEntity } from "@logseq/libs/dist/LSPlugin.user";
import { processContent } from "../libs/process-content";
import { Column } from "../types";

export const createTaskBoard = async (
  workflow_one: string,
  workflow_two: string,
  board: Column[],
  children: BlockEntity[],
) => {
  board = [
    { id: workflow_one, title: workflow_one, cards: [] },
    { id: workflow_one, title: workflow_two, cards: [] },
    { id: "DONE", title: "DONE", cards: [] },
  ];
  for (const c of children) {
    const content = (await processContent(c.content)) as string;
    if (c.marker === workflow_one) {
      board[0]?.cards.push({ description: content, id: c.uuid });
    } else if (c.marker === workflow_two) {
      board[1]?.cards.push({ description: content, id: c.uuid });
    } else {
      board[2]?.cards.push({ description: content, id: c.uuid });
    }
  }

  return board;
};
