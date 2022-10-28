import { Point, ItemObject } from './components/index.js';

class Game {
  constructor(board) {
    this.board = board;
    this.boardSize = new Point(10, 10);
    this.mode = 'Edit';
    this.editObjects = [];
    this.playObjects = [];
    this.gamePaused = false;
    this.lockGame = false;
    this.drawMap();
    this.setObjectNeighbours();
  }

  /**
   * Creates a (boardSize) by (boardSize) table grid, and adds a click event listener to each cell.
   */
   drawMap() {
    const table = document.createElement('table');
    table.id = 'gameGrid';
    for (let y = 0; y < this.boardSize.y; y++) {
      let tr = document.createElement('tr');
      for (let x = 0; x < this.boardSize.x; x++) {
        let td = document.createElement('td');
        td.id = `${x},${y}`;
        this.editObjects.push(new ItemObject(x, y));
        tr.appendChild(td);
      }
      table.appendChild(tr);
    }
    this.board.insertAdjacentElement('beforeend', table);
  }

  setObjectNeighbours() {
    this.editObjects.forEach((item) => {
      item.neighbours(
        this.editObjects.find((i) => i.cell.x === item.cell.x - 1 && i.cell.y === item.cell.y),
        this.editObjects.find((i) => i.cell.x === item.cell.x + 1 && i.cell.y === item.cell.y),
        this.editObjects.find((i) => i.cell.y === item.cell.y - 1 && i.cell.x === item.cell.x),
        this.editObjects.find((i) => i.cell.y === item.cell.y + 1 && i.cell.x === item.cell.x),
      )
    })
  }
  
  /**
   * Updates slider value text.
   * @param {string} val value of the slider
   * @param {string} element name of element that reflects the slider value.
   */
   setTreasureVal(val, element) {
    element.innerText = val;
    this.buildType = `T(${val})`;
  }
}

export default Game;
