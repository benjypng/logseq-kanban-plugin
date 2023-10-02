import { BlockEntity } from "@logseq/libs/dist/LSPlugin.user";
import { Card, Column } from "../types";

export const createNormalBoard = (board: Column[], children: BlockEntity[]) => {
  for (const col of children) {
    let column: Column = {
      id: col.uuid,
      title: col.content,
      cards: [],
    };
    if (!col.children) continue;
    for (const crd of col.children as BlockEntity[]) {
      let card: Card = {
        id: crd.uuid,
        description: crd.content,
      };
      column.cards.push(card);
    }
    board.push(column);
  }
  return board;
};
