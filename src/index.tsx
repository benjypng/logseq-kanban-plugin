import "@logseq/libs";
import { renderToString } from "react-dom/server";
import { BlockEntity } from "@logseq/libs/dist/LSPlugin.user";
import { checkParams } from "./libs/check-params";
import { Column, ParamsProps } from "./types";
import { Kanban } from "./components/Kanban";
import { createTaskBoard } from "./helpers/create-task-board";
import { createQueryBoard } from "./helpers/create-query-board";
import { createNormalBoard } from "./helpers/create-normal-board";
import { handleStyles } from "./libs/handle-styles";

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

    const params: ParamsProps = checkParams(content);

    let html: string;
    let board: Column[] = [];
    if (params.data_type === "tasks") {
      // render kanban with tasks
      const markers = children.map((c: BlockEntity) => c.marker);

      switch (true) {
        case markers.includes("TODO") || markers.includes("DOING"):
          board = await createTaskBoard("TODO", "DOING", board, children);
          break;
        default:
          board = await createTaskBoard("NOW", "LATER", board, children);
      }
    } else if (params.data_type === "query") {
      // render kanban with query
      const content = children[0]?.content;
      if (!content) return;
      board = await createQueryBoard(content, board);
      logseq.provideModel({
        async render() {
          // Needed to re-render the block
          const tempBlock = await logseq.Editor.insertBlock(uuid, "", {
            sibling: false,
          });
          if (!tempBlock) return;
          await logseq.Editor.removeBlock(tempBlock.uuid);
        },
      });
    } else {
      // render regular kanban
      board = await createNormalBoard(board, children);
    }

    // handle styles
    logseq.provideStyle(handleStyles(slot, params.card_w, params.board_w));
    if (params.data_type === "query") {
      html = renderToString(<Kanban data={{ columns: board }} query={true} />);
    } else {
      html = renderToString(<Kanban data={{ columns: board }} />);
    }

    logseq.provideUI({
      key: `${kanbanId}`,
      slot,
      reset: true,
      template: html,
    });
  });
};

logseq.ready(main).catch(console.error);
