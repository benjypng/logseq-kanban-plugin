import { BlockEntity } from "@logseq/libs/dist/LSPlugin.user";
import { Card, Column } from "../types";
import { processContent } from "../libs/process-content";

export const createNormalBoard = async (
  board: Column[],
  children: BlockEntity[],
) => {
  for (const col of children) {
    let column: Column = {
      id: col.uuid,
      title: col.content,
      cards: [],
    };
    if (!col.children) continue;
    for (const crd of col.children as BlockEntity[]) {
      const content = (await processContent(crd.content)) as string;
      let card: Card = {
        id: crd.uuid,
        description: content,
      };
      column.cards.push(card);
    }
    board.push(column);
  }
  return board;
};
