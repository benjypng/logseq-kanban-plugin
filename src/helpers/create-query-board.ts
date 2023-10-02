import { BlockEntity } from "@logseq/libs/dist/LSPlugin.user";
import { processContent } from "../libs/process-content";
import { Column } from "../types";

export const createQueryBoard = async (
  content: string,
  board: Column[],
): Promise<Column[]> => {
  const queryString = /\{\{query (.*?)\}\}/.exec(content);
  if (!queryString || !queryString[1]) return board;

  const queryResults = await logseq.DB.q(queryString[1]);
  if (!queryResults) return board;

  const markers = queryResults.map((c: BlockEntity) => c.marker);
  board = markers.map((m) => ({ id: m, title: m, cards: [] }));

  for (const r of queryResults) {
    const content = processContent(r.content);
    let assignCol = board.filter((c) => c.id === r.marker)[0];
    if (!assignCol) continue;
    assignCol?.cards.push({ id: r.uuid, description: content });
  }

  return board;
};
