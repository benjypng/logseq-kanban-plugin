const kanbanCss = (width, wrapperWidth) => {
  return `
  .wrapper {
    max-width: ${wrapperWidth}px;
    overflow-x: scroll;
    white-space: nowrap;
  }

  .react-kanban-board {
    padding: 2px;
    margin: 0;
    color: #000
  }
  
  .react-kanban-card {
    border-radius: 3px;
    background-color: #fff;
    padding: 10px;
    margin-bottom: 7px;
    width: ${width}px;
  }
  
  .react-kanban-card,
  .react-kanban-card-skeleton {
    box-sizing: border-box;
    min-width: 250px;
  }
  
  .react-kanban-card:hover {
    box-shadow: -5px 10px 15px #aaaaaa;
  }
  
  .react-kanban-card__description {
    padding-top: 0
  }
  
  .react-kanban-card__title {
    display: none;
    padding: 0;
    margin: 0
  }
  
  .react-kanban-column {
    white-space: normal;
    min-width: 290px;
    padding: 15px;
    border-radius: 2px;
    background-color: #eee;
    margin: 5px;
    width: ${width + 40}px;
  }
  
  .react-kanban-column input:focus {
    outline: 0
  }
  
  .react-kanban-column-header {
    padding-bottom: 10px;
    font-weight: 700;
    font-size: 120%;
  }
  
  .react-kanban-column:hover {
    transform: translateY(-8px);
    transition: all 0.1s;
  }

  /* Query and query button related */
  .queryWrapper {
    display: flex;
    flex-direction: column;
  }

  .btnDiv {
    margin-top: 5px;
  }

  .updateKanbanBtn {
    border: 1px solid gray;
    padding: 0 4px;
    border-radius: 8px;
  }

  .updateKanbanBtn:hover {
    background-color: pink;
    color: black;
  }
 `;
};

export default kanbanCss;
