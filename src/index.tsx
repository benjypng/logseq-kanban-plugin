import "@logseq/libs";
import { renderToString } from "react-dom/server";
import { BlockEntity } from "@logseq/libs/dist/LSPlugin.user";
import { checkParams } from "./libs/check-params";
import { Card, Column } from "./types";
import { Kanban } from "./components/Kanban";
import { processContent } from "./libs/process-content";
import { createTaskBoard } from "./helpers/create-task-board";

const main = async () => {
  console.log("Kanban plugin loaded");

  // Insert renderer upon slash command
  logseq.Editor.registerSlashCommand("kanban", async (e) => {
    await logseq.Editor.insertAtEditingCursor(`{{renderer :kanban_${e.uuid}}}`);
  });

  logseq.App.onMacroRendererSlotted(async ({ slot, payload }) => {
    // Get uuid of payload so that child blocks can be retrieved for the board
    const uuid = payload.uuid;
    const [type] = payload.arguments;
    if (!type) return;

    const kanbanId = `kanban_${uuid}_${slot}`;
    if (!type.startsWith(":kanban_")) return;

    // Get block data to render
    const blk = await logseq.Editor.getBlock(uuid, {
      includeChildren: true,
    });
    if (!blk || !blk.children || blk.children.length === 0) return;

    const paramsBlk = blk?.children![0];
    if (!paramsBlk) return;

    const { content, children } = paramsBlk as {
      content: string;
      children: BlockEntity[];
    };
    if (children?.length === 0) return;

    const params = checkParams(content);

    let html: string;
    let board: Column[] = [];
    if (params.data_type === "tasks") {
      // render kanban with tasks
      const markers = children.map((c: BlockEntity) => c.marker);

      switch (true) {
        case markers.includes("TODO") || markers.includes("DOING"):
          board = createTaskBoard("TODO", "DOING", board, children);
          break;
        default:
          board = createTaskBoard("NOW", "LATER", board, children);
      }
    } else if (params.data_type === "query") {
      // render kanban with query
    } else {
      // render regular kanban
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
    }

    html = renderToString(<Kanban columns={board} />);

    logseq.provideUI({
      key: `${kanbanId}`,
      slot,
      reset: true,
      template: html,
    });
  });
};

logseq.ready(main).catch(console.error);
