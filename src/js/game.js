import { ItemObject, Point } from './components/index.js';
import buttonHelper from './helpers/buttonHelper.js';
import colorHelper from './helpers/colorHelper.js';

class Game {
  constructor(boardSize, boardElement) {
    this.boardSize = boardSize;
    this.board = boardElement;

    //edit mode
    this.stage = 0; //0 = setup, 1 = play, 2 = end.
    this.heroCoords = new Point(-1, -1);
    this.selectedGrid = new Point(-1, -1);
    this.playHeroCoords = new Point(null, null);
    this.selectedGridVal = " ";
    this.buildType;
    this.map = this.createInitialMap();
    this.objects = [];

    //play mode
    this.playObjects = [];
    this.score = 0;
    this.turnCounter = 0;
    this.isPlayerTurn = true;
    this.amountOfTreasure = 0;
    this.treasureLeft = 0;
    
    this.drawMap();
  }

  /**
   * =======================
   * = GRID INITIALISATION =
   * =======================
   */

  /**
   * Creates initial 2D array map.
   */
  createInitialMap() {
    let grid = [];
    while(grid.push([]) < this.boardSize);
    return grid;
  }
  
  /**
   * Creates a (boardSize) by (boardSize) table grid, and adds a click event listener to each cell.
   */
  drawMap() {
    const table = document.createElement("table");
    table.id = "gameGrid";
    for (let x = 0; x < this.boardSize; x++) {
      let tr = document.createElement("tr");
      for (let y = 0; y < this.boardSize; y++) {
        let obj = this.objects.filter((o) => o.x === x && o.y === y)[0];
        let td = document.createElement("td");
        td.id = `${x},${y}`;
        td.onclick = this.onTileClick(x, y, obj)
        td.innerText = typeof obj === 'undefined' ? " " : obj.type;
        tr.appendChild(td);
      }
      table.appendChild(tr);
    }
    this.board.insertAdjacentElement('beforeend', table);
  }

  onTileClick(x, y, obj) {
    this.selectedGrid = new Point(x, y);
    this.selectedGridVal = typeof obj === 'undefined' ? " " : obj.type;
    if (typeof obj !== 'undefined' && this.stage === 0)
      this.addObject(obj.type);
  }

  /**
   * =====================
   * = EDIT MODE BUILDER =
   * =====================
   */

  /**
   * Adds an object to the game grid.
   * @param {string} type the type of object to be added to the board.
   */
  addObject(type) {
    if (this.selectedGrid.x === -1 || this.selectedGrid.y === -1) return;
    if (this.stage === 0) this.clearSpaceIfOccupied();
    if (type === 'T') type = "T(1)";
    if (type === 'H') {
      if (!Point.compare(this.heroCoords, new Point(-1, -1))) {
        document.getElementById(this.heroCoords.asString()).style.backgroundColor = "var(--E)";

        for (let i = 0; i < this.objects.length; i++) {
          const item = this.objects[i];
          if (Point.compare(item, this.heroCoords))
            this.objects.splice(i, 1);
        }

        this.map[this.heroCoords.x][this.heroCoords.y] = " ";
        this.heroCoords.setPos(-1, -1);
      }
      this.heroCoords.setPos(this.selectedGrid)
    }

    document.getElementById(`${this.selectedGrid.asString()}`).style.backgroundColor = colorHelper(type);  

    this.map[this.selectedGrid.x][this.selectedGrid.y] = type;
    this.objects.push(new ItemObject(this.selectedGrid.x, this.selectedGrid.y, type));
    if (type === 'E') this.objects.pop();

    this.selectedGrid.setPos(-1, -1);
    return type;
  }

  /**
   Checks whether a selected space already has an object. If true, that occupied space will be cleared.
   */
  clearSpaceIfOccupied() {
    for (let i = 0; i < this.objects.length; i++) {
      let item = this.objects[i];
      if (Point.compare(item, this.selectedGrid)) {
        if (item.type === 'H') this.heroCoords.setPos(-1, -1);
        this.objects.splice(i, 1);
      }
    }
  }
  
  /**
   * Sets build type object that is used when a cell on the grid is clicked.
   * @param {Element} sender element that initiated the event.
   */
  setBuildObjectType(sender) {
    buttonHelper(sender);
    this.buildType = sender.id.toUpperCase();
  }

  /**
   * Updates slider value text.
   * @param {string} val value of the slider
   * @param {Element} sender element that initiated the event.
   */
  setTreasureVal(val, sender) {
    sender.innerText = val;
    this.buildType = `T(${val})`;
  }

  /**
   * =======================
   * = PLAY MODE FUNCTIONS =
   * =======================
   */

  /**
   * Toggles the game state between Edit and Play mode.
   * @param {Element} sender element that initiated the event.
   */
  togglePlayMode(sender) {
    this.playObjects = this.objects.slice();
    if (this.stage === 0) {
      if (Point.compare(new Point(-1, -1), this.heroCoords)) {
        alert("Please ensure you place a hero object on the board.")
        return;
      }
      if (!isThereAnyTreasure()) {
        alert("Please ensure you place a treasure object on the board.")
        return;
      }
      
      this.playHeroCoords.setPosFromPoint(this.heroCoords);
      this.treasureLeft = this.amountOfTreasure;
    } else { //going back to edit mode
      this.playObjects = [];
      this.isPlayerTurn = true;
      this.turnCounter = 0;
      this.setScore("0", false);
      this.addAllOriginalObjectsToField();
    }

    // toggle stage button UI and stage mode.
    this.stage = (this.stage === 0 ? 1 : 0);
    sender.value = (sender.value === "Play" ? "Reset" : "Play");
    sender.style.backgroundColor = (sender.style.backgroundColor !== 'lightgreen' ? 'lightgreen' : 'lightpink');
    this.setBuildObjectType(" ", null); //reset buttons.
  }

  /**
   * Add points to the score if additive is set to true, set the score if additive is set to false.
   * @param {string} scr
   * @param {boolean} additive
   */
  setScore(scr, additive) {
    score = additive ? score + parseInt(scr) : parseInt(scr);
    document.getElementById("score").innerText = "Score: " + score.toString();
  }


}

//adds event listener for keyboard input, for play and edit mode.
document.addEventListener('keypress', function (event) {
  if (this.stage === 1 && this.isPlayerTurn) {
    let hasMadeMove = false;
    let pos = GetPlayerPosition();
    switch (true) {
      case (event.key === 'w' || event.key === 's' || event.key === 'a' || event.key === 'd'):
        this.moveObject(pos.x, pos.y, event.key, "H");
        this.hasMadeMove = true;
        break;
      case (event.key === 'Enter'):
        this.togglePlayMode(document.getElementById("btnPlay"));
        break;
      default: break;
    }

    this.checkWinCondition();

    //when player moves, start AI turn.
    if (hasMadeMove && this.treasureLeft > 0) {
      this.turnCounter++;
      this.isPlayerTurn = false;
      this.startAITurn();
    }
  }
});

export default Game;
