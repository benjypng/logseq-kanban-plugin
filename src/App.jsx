import React, { useState } from 'react';
import Board from '@asseinfo/react-kanban';

const App = (props) => {
  const prepareDataForKanban = () => {
    // Data from child block comes here
    const { dataBlock, parentBlock } = props;

    if (parentBlock.content.toLowerCase() === 'tasks') {
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

      const board = { columns: [todoColumn, doingColumn, doneColumn] };
      return board;
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

      const board = { columns: arr };
      return board;
    }
  };

  // Prepare to draw board
  const [kanbanBoard] = useState(prepareDataForKanban());

  if (kanbanBoard.columns.length === 0) {
    return (
      <div
        style={{
          border: '1px solid white',
          padding: '0.5em',
          marginTop: '-2rem',
        }}
      >
        Waiting for data to be rendered... Start by creating a child block
        below, and adding your data below it!
      </div>
    );
  } else {
    return <Board>{kanbanBoard}</Board>;
  }
};

export default App;