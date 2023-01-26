import "@logseq/libs";
import React from "react";
import ReactDOMServer from "react-dom/server";
import App from "./App";
import { kanbanCss } from "./kanban";
import * as chrono from "chrono-node";
import { getYYYMMDD } from "logseq-dateutils";

type Task = {
  content: string;
  id: string;
  description: string;
};

type Kanban = {
  id: number;
  title: string;
  cards: any[];
  children: any[];
  content: string;
};

const main = async () => {
  console.log("Kanban plugin loaded");

  // Set path in settings for adding images to kanban board
  const currGraph = await logseq.App.getCurrentGraph();
  logseq.updateSettings({
    pathToLogseq: `${currGraph!.path}/assets`,
  });

  // Generate unique identifier
  const uniqueIdentifier = () =>
    Math.random()
      .toString(36)
      .replace(/[^a-z]+/g, "");

  // Insert renderer upon slash command
  logseq.Editor.registerSlashCommand("kanban", async () => {
    await logseq.Editor.insertAtEditingCursor(
      `{{renderer :kanban_${uniqueIdentifier()}}}`
    );
  });

  logseq.App.onMacroRendererSlotted(async ({ slot, payload }) => {
    // Get uuid of payload so that child blocks can be retrieved for the board
    const uuid = payload.uuid;
    const [type] = payload.arguments;
    const id = type.split("_")[1]?.trim();
    const kanbanId = `kanban_${id}_${slot}`;

    if (!type.startsWith(":kanban_")) return;

    // Set div for renderer to use
    let drawKanbanBoard = (board: string) => {
      return `<div id="${kanbanId}" data-slot-id="${slot}" data-kanban-id="${kanbanId}">${board}</div>`;
    };

    // Get children data to draw kanban board
    const block = await logseq.Editor.getBlock(uuid, { includeChildren: true });
    // Data from child block comes here
    let dataBlock = block!.children![0]["children"];

    // Get width data from the block to allow flexible widths
    let [parent, width, wrapperWidth] =
      block!.children![0]["content"].split(" ");

    // Provide style for kanban board
    if (width === undefined && wrapperWidth === undefined) {
      logseq.provideStyle(`${kanbanCss(250, 1200, kanbanId)}`);
    } else if (width && wrapperWidth === undefined) {
      width = parseInt(width);
      logseq.provideStyle(`${kanbanCss(width, 1000, kanbanId)}`);
    } else {
      width = parseInt(width);
      wrapperWidth = parseInt(wrapperWidth);
      logseq.provideStyle(`${kanbanCss(width, wrapperWidth, kanbanId)}`);
    }

    // Start creating board
    let board = {};

    // Get user preferred workflows
    const userConfigs = await logseq.App.getUserConfigs();
    const { preferredWorkflow } = userConfigs;

    // DOING Do this and that\n:LOGBOOK:\nCLOCK: [2022-01-24 Mon 12:00:03]--[2022-01-24 Mon 12:00:05] =>  00:00:02\nCLOCK: [2022-01-24 Mon 12:00:06]\n:END:

    const returnPayload = (content: string) => {
      let payload = content.replace(":LOGBOOK:", "").replace(":END:", "");

      if (content.includes("\n")) {
        payload = payload.substring(0, content.indexOf("\n"));
      }
      console.log(payload);
      return payload;
      //let payload = content.replace(/:LOGBOOK:|collapsed:: true/gi, "");

      //if (payload.includes("CLOCK: [")) {
      //  payload = payload.substring(0, payload.indexOf("CLOCK: ["));
      //}

      //if (payload.includes("DEADLINE: <")) {
      //  payload = payload.substring(0, payload.indexOf("DEADLINE: <"));
      //}
      //if (content.indexOf(`\nid:: `) === -1) {
      //  return payload;
      //} else {
      //  return payload.substring(0, content.indexOf(`\nid:: `));
      //}
    };

    if (parent.toLowerCase() === "tasks") {
      let dataContent = dataBlock[0].content;
      let inputs: any;

      // Check if query
      if (
        dataContent.startsWith("#+BEGIN_QUERY") &&
        dataContent.endsWith("#+END_QUERY")
      ) {
        logseq.provideModel({
          async render() {
            const tempBlock = await logseq.Editor.insertBlock(block.uuid, "");
            await logseq.Editor.removeBlock(tempBlock.uuid);
          },
        });

        drawKanbanBoard = (board: string) => {
          return `<div class="queryWrapper"><div id="${kanbanId}" data-slot-id="${slot}" data-kanban-id="${kanbanId}">${board}</div>
          <div class="btnDiv"><button data-on-click="render" class="updateKanbanBtn">Update Kanban</button></div></div>`;
        };

        const regexp = /\:\bquery \[\s(.*)\t\]/s;
        const matched = regexp.exec(dataContent);

        // Remove unnecessary syntax
        dataContent = dataContent
          .replace("#+BEGIN_QUERY", "")
          .replace("#+END_QUERY", "");

        if (dataContent.includes(":inputs [")) {
          inputs = dataContent.slice(dataContent.indexOf(":inputs ["));
          let inputsArr = inputs
            .substring(0, inputs.indexOf("]"))
            .replace(":inputs [", "")
            .replaceAll(":", "")
            .split(" ");

          inputsArr = inputsArr.map((i) =>
            i === "today" || i === "yesterday"
              ? getYYYMMDD(chrono.parse(i)[0].start.date())
              : getYYYMMDD(
                  chrono
                    .parse(i.replace("d", "days").replace("-", " "))[0]
                    .start.date()
                )
          );

          inputs = inputsArr;
        }

        // Get text after :query
        dataContent = dataContent.slice(dataContent.indexOf("[:find"));

        // Pass query through API
        let datascriptQuery: any[];
        if (!inputs) {
          datascriptQuery = await logseq.DB.datascriptQuery(
            `[${matched[1].replaceAll("\t", " ")}]`
          );
        } else if (!inputs[1]) {
          datascriptQuery = await logseq.DB.datascriptQuery(
            dataContent,
            //@ts-ignore
            inputs[0],
            inputs[0]
          );
        } else {
          datascriptQuery = await logseq.DB.datascriptQuery(
            dataContent,
            //@ts-ignore
            inputs[0],
            inputs[1]
          );
        }
        dataBlock = datascriptQuery.map((i) => i[0]);
      }

      // Filter todo
      const todoObj = dataBlock
        .filter((t: Task) =>
          t.content.startsWith(preferredWorkflow === "todo" ? "TODO" : "LATER")
        )
        .map((t: Task) => ({
          id: t.id,
          description:
            preferredWorkflow === "todo"
              ? returnPayload(t.content).substring(4)
              : returnPayload(t.content).substring(5),
        }));

      const todoColumn = {
        id: "todoCol",
        title: preferredWorkflow === "todo" ? "TODO" : "LATER",
        cards: todoObj,
      };

      // Filter doing
      const doingObj = dataBlock
        .filter((t: Task) =>
          t.content.startsWith(preferredWorkflow === "todo" ? "DOING" : "NOW")
        )
        .map((t: Task) => ({
          id: t.id,
          description:
            preferredWorkflow === "todo"
              ? returnPayload(t.content).substring(5)
              : returnPayload(t.content).substring(3),
        }));

      const doingColumn = {
        id: "doingCol",
        title: preferredWorkflow === "todo" ? "DOING" : "NOW",
        cards: doingObj,
      };

      // Filter done
      const doneObj = dataBlock
        .filter((t: Task) => t.content.startsWith("DONE"))
        .map((t: Task) => ({
          id: t.id,
          description: returnPayload(t.content).substring(4),
        }));

      const doneColumn = { id: "doneCol", title: "DONE", cards: doneObj };

      board = { columns: [todoColumn, doingColumn, doneColumn] };
    } else {
      // Map array based on required fields for kanban
      const arr = dataBlock.map((e: Kanban) => ({
        id: e.id,
        title: e.content.includes("collapsed:: true")
          ? e.content.substring(0, e.content.indexOf("collapsed:: true"))
          : e.content,
        cards: [],
        children: e.children,
      }));

      // Populate kanbon cards under their respective headers
      for (let i of arr) {
        for (let j of i.children) {
          let payload = {};
          if (
            j.content.startsWith("![") &&
            j.content.includes("](") &&
            j.content.endsWith(")")
          ) {
            payload = {
              id: j.id,
              description: (
                <React.Fragment>
                  <img
                    src={`assets://${
                      logseq.settings.pathToLogseq
                    }/${j.content.substring(
                      j.content.indexOf("/assets/") + 8,
                      j.content.length - 1
                    )}`}
                  />
                </React.Fragment>
              ),
            };
          } else if (j.content.includes("((") && j.content.includes("))")) {
            let blockContent = j.content;
            // Get content if it's q block reference
            const rxGetId = /\(\(([^)]*)\)\)/;
            const blockId = rxGetId.exec(blockContent);
            const block = await logseq.Editor.getBlock(blockId[1], {
              includeChildren: true,
            });

            blockContent = blockContent.replace(
              `((${blockId[1]}))`,
              block.content.substring(0, block.content.indexOf("id::"))
            );

            payload = {
              id: j.id,
              description: blockContent,
            };
          } else {
            payload = {
              id: j.id,
              description: returnPayload(j.content),
            };
          }
          i.cards.push(payload);
        }
      }

      board = { columns: arr };
    }

    // Use React to render board
    const kanban: string = ReactDOMServer.renderToStaticMarkup(
      <App boardData={board} />
    );

    logseq.provideUI({
      key: `${kanbanId}`,
      slot,
      reset: true,
      template: drawKanbanBoard(kanban),
    });
  });
};

logseq.ready(main).catch(console.error);
