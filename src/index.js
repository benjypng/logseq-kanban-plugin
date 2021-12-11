import '@logseq/libs';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import App from './App';

const main = async () => {
  console.log('Kanban plugin loaded');

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
    // Provide style for kanban board
    logseq.provideStyle(`
    .react-kanban-board{padding:2px;margin:0;color:#000}.react-kanban-card{border-radius:3px;background-color:#fff;padding:10px;margin-bottom:7px}.react-kanban-card,.react-kanban-card-skeleton{box-sizing:border-box;max-width:250px;min-width:250px}.react-kanban-card:hover{box-shadow:-5px 10px 15px #aaaaaa;}.react-kanban-card__description{padding-top:0}.react-kanban-card__title{display:none;padding:0;margin:0}.react-kanban-column{white-space:normal;max-width:290px;min-width:290px;padding:15px;border-radius:2px;background-color:#eee;margin:5px}.react-kanban-column input:focus{outline:0}.react-kanban-column-header{padding-bottom:10px;font-weight:700;font-size:120%;}.react-kanban-column:hover{transform:translateY(-8px);transition:all 0.1s;}
    `);

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

    // Use React to render board
    let board = ReactDOMServer.renderToStaticMarkup(
      <App
        dataBlock={block.children[0].children}
        parentBlock={block.children[0]}
      />
    );

    if (!type.startsWith(':kanban')) return;
    logseq.provideUI({
      key: `${kanbanId}`,
      slot,
      reset: true,
      template: drawKanbanBoard(board),
    });
  });
};

logseq.ready(main).catch(console.error);
