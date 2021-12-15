const kanbanCss = () => {
  return `
  .react-kanban-board {
    padding: 2px;
    margin: 0;
    color: #000
  }
  
  .react-kanban-card {
    border-radius: 3px;
    background-color: #fff;
    padding: 10px;
    margin-bottom: 7px
  }
  
  .react-kanban-card,
  .react-kanban-card-skeleton {
    box-sizing: border-box;
    max-width: 250px;
    min-width: 250px
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
    max-width: 290px;
    min-width: 290px;
    padding: 15px;
    border-radius: 2px;
    background-color: #eee;
    margin: 5px
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
 `;
};

export default kanbanCss;
