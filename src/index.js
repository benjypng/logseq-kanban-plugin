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
    // Provide style for kanban board
    logseq.provideStyle(`${kanbanCss()}`);

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
