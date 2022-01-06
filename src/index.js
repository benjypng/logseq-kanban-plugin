import '@logseq/libs';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import App from './App';
import kanbanCss from './kanban.js';

const main = async () => {
  console.log('Kanban plugin loaded');

  // Set path in settings for adding images to kanban board
  const currGraph = await logseq.App.getCurrentGraph();
  logseq.updateSettings({
    pathToLogseq: `${currGraph.path}/assets`,
  });

  // Generate unique identifier
  const uniqueIdentifier = () =>
    Math.random()
      .toString(36)
      .replace(/[^a-z]+/g, '');

  // Insert renderer upon slash command
  logseq.Editor.registerSlashCommand('kanban', async () => {
    await logseq.Editor.insertAtEditingCursor(
      `{{renderer :kanban_${uniqueIdentifier()}}}`
    );
  });

  logseq.App.onMacroRendererSlotted(async ({ slot, payload }) => {
    // Get uuid of payload so that child blocks can be retrieved for the board
    const uuid = payload.uuid;
    const [type] = payload.arguments;
    const id = type.split('_')[1]?.trim();
    const kanbanId = `kanban_${id}`;

    // Set div for renderer to use
    const drawKanbanBoard = (board) => {
      return `<div id="${kanbanId}" data-slot-id="${slot}" data-kanban-id="${kanbanId}">${board}</div>`;
    };

    // Get children data to draw kanban board
    const block = await logseq.Editor.getBlock(uuid, { includeChildren: true });
    // Data from child block comes here
    const dataBlock = block.children[0].children;

    // Get width data from the block to allow flexible widths
    let [parent, width] = block.children[0].content.split(' ');
    if (width === undefined) {
      // Provide style for kanban board
      logseq.provideStyle(`${kanbanCss(250)}`);
    } else {
      width = parseInt(width);
      logseq.provideStyle(`${kanbanCss(width)}`);
    }

    // Start creating board
    let board = {};

    if (parent.toLowerCase() === 'tasks') {
      const returnPayload = (content, char) => {
        if (
          content.includes(':LOGBOOK:') &&
          content.includes('collapsed:: true')
        ) {
          const x = content.substring(char, t.content.indexOf(':LOGBOOK:'));

          return x.substring(char, t.content.indexOf('collapsed:: true'));
        } else if (content.includes(':LOGBOOK:')) {
          return content.substring(char, t.content.indexOf(':LOGBOOK:'));
        } else if (content.includes('collapsed:: true')) {
          return content.substring(char, e.content.indexOf('collapsed:: true'));
        } else {
          return content.substring(char);
        }
      };
      // Filter todo
      const todoObj = dataBlock
        .filter((t) => t.content.startsWith('TODO'))
        .map((t) => ({
          id: t.id,
          description: returnPayload(t.content, 5),
        }));

      const todoColumn = { id: 'todoCol', title: 'TODO', cards: todoObj };

      // Filter doing
      const doingObj = dataBlock
        .filter((t) => t.content.startsWith('DOING'))
        .map((t) => ({
          id: t.id,
          description: returnPayload(t.content, 6),
        }));

      const doingColumn = { id: 'doingCol', title: 'DOING', cards: doingObj };

      // Filter done
      const doneObj = dataBlock
        .filter((t) => t.content.startsWith('DONE'))
        .map((t) => ({
          id: t.id,
          description: returnPayload(t.content, 5),
        }));

      const doneColumn = { id: 'doneCol', title: 'DONE', cards: doneObj };

      board = { columns: [todoColumn, doingColumn, doneColumn] };
    } else {
      // Map array based on required fields for kanban
      const arr = dataBlock.map((e) => ({
        id: e.id,
        title: e.content.includes('collapsed:: true')
          ? e.content.substring(0, e.content.indexOf('collapsed:: true'))
          : e.content,
        cards: [],
        children: e.children,
      }));

      // Populate kanbon cards under their respective headers
      for (let i of arr) {
        for (let j of i.children) {
          console.log();
          let payload = {};
          if (
            j.content.startsWith('![') &&
            j.content.includes('](') &&
            j.content.endsWith(')')
          ) {
            payload = {
              id: j.id,
              description: (
                <React.Fragment>
                  <img
                    src={`assets://${
                      logseq.settings.pathToLogseq
                    }/${j.content.substring(
                      j.content.indexOf('/assets/') + 8,
                      j.content.length - 1
                    )}`}
                  />
                </React.Fragment>
              ),
            };
          } else if (j.content.includes('((') && j.content.includes('))')) {
            let blockContent = j.content;
            // Get content if it's q block reference
            const rxGetId = /\(([^(())]+)\)/;
            const blockId = rxGetId.exec(blockContent);
            const block = await logseq.Editor.getBlock(blockId[1], {
              includeChildren: true,
            });

            blockContent = blockContent.replace(
              `((${blockId[1]}))`,
              block.content.substring(0, block.content.indexOf('id::'))
            );

            payload = {
              id: j.id,
              description: blockContent,
            };
            console.log(payload);
          } else {
            payload = {
              id: j.id,
              description: j.content.includes('collapsed:: true')
                ? j.content.substring(0, j.content.indexOf('collapsed:: true'))
                : j.content,
            };
          }
          i.cards.push(payload);
        }
      }

      board = { columns: arr };
    }

    // Use React to render board
    let kanban = ReactDOMServer.renderToStaticMarkup(<App boardData={board} />);

    if (!type.startsWith(':kanban')) return;
    logseq.provideUI({
      key: `${kanbanId}`,
      slot,
      reset: true,
      template: drawKanbanBoard(kanban),
    });
  });
};

logseq.ready(main).catch(console.error);
