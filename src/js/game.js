import { ItemObject, Point } from './components/index.js';
import buttonHelper from './helpers/buttonHelper.js';
import colorHelper from './helpers/colorHelper.js';
import SampleLevel from './SampleLevel.js';

class Game {
  constructor(boardSize, boardElement) {
    this.boardSize = boardSize;
    this.board = boardElement;

    //edit mode
    this.stage = 0; //0 = setup, 1 = play, 2 = end.
    this.heroCoords = new Point(-1, -1);
    this.selectedGrid = new Point(-1, -1);
    this.playHeroCoords = new Point(null, null);
    this.selectedGridVal = ' ';
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
    const table = document.createElement('table');
    table.id = 'gameGrid';
    for (let x = 0; x < this.boardSize; x++) {
      let tr = document.createElement('tr');
      for (let y = 0; y < this.boardSize; y++) {
        let td = document.createElement('td');
        td.id = `${x},${y}`;
        td.addEventListener('click', () => this.onTileClick(x, y));
        td.innerText = typeof obj === 'undefined' ? ' ' : obj.type;
        tr.appendChild(td);
      }
      table.appendChild(tr);
    }
    this.board.insertAdjacentElement('beforeend', table);
  }

  onTileClick(x, y) {
    this.selectedGrid = new Point(x, y);
    this.selectedGridVal = typeof this.buildType === 'undefined' ? ' ' : this.buildType;
    if (typeof this.buildType !== 'undefined' && this.stage === 0) {
      this.addObject(this.buildType);
    }
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
    if (type === 'H') {
      if (!Point.compare(this.heroCoords, new Point(-1, -1))) {
        document.getElementById(this.heroCoords.asString()).style.backgroundColor = 'var(--E)';

        for (let i = 0; i < this.objects.length; i++) {
          const item = this.objects[i];
          if (Point.compare(item, this.heroCoords))
            this.objects.splice(i, 1);
        }

        this.map[this.heroCoords.x][this.heroCoords.y] = ' ';
        this.heroCoords.setPos(-1, -1);
      }
      this.heroCoords.setPosFromPoint(this.selectedGrid);
    }

    document.getElementById(`${this.selectedGrid.asString()}`).style.backgroundColor = colorHelper(type.startsWith('T') ? 'T' : type);  

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
    this.buildType = sender && sender.id.toUpperCase();
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
        alert('Please ensure you place a hero object on the board.')
        return;
      }
      if (!this.isThereAnyTreasure()) {
        alert('Please ensure you place a treasure object on the board.')
        return;
      }
      
      this.playHeroCoords.setPosFromPoint(this.heroCoords);
      this.treasureLeft = this.amountOfTreasure;
    } else { //going back to edit mode
      this.playObjects = [];
      this.isPlayerTurn = true;
      this.turnCounter = 0;
      this.setScore('0', false);
      this.addAllOriginalObjectsToField();
    }

    // toggle stage button UI and stage mode.
    this.stage = (this.stage === 0 ? 1 : 0);
    sender.value = (sender.value === 'Play' ? 'Reset' : 'Play');
    sender.style.backgroundColor = (sender.style.backgroundColor !== 'lightgreen' ? 'lightgreen' : 'lightpink');
    this.setBuildObjectType(null); //reset buttons.
  }

  /**
   * Add points to the score if additive is set to true, set the score if additive is set to false.
   * @param {string} scr
   * @param {boolean} additive
   */
  setScore(scr, additive) {
    this.score = additive ? score + parseInt(scr) : parseInt(scr);
    document.getElementById('score').innerText = 'Score: ' + this.score.toString();
  }
  
  /**
   * Returns true if a treasure tile is found in the objects list.
   * @returns {boolean}
   */
  isThereAnyTreasure() {
    this.amountOfTreasure = 0;
    this.playObjects.forEach((item) => {
      //this let will be used to determine game completion state later.
      if (item.type.indexOf("T") !== -1) this.amountOfTreasure++; 
    })

    return (this.amountOfTreasure > 0);
  }
  
  /**
   * Checks if there is an obstacle at given coordinates.
   * @param {Point} point
   * @returns {string}
   */
  isThereAnObstacle(point) {
    this.playObjects.forEach((item) => {
      if (Point.compare(item, point)) return item.type;
    })

    //check for out of bounds
    if (point.x < 0 || point.x > 9 || point.y < 0 || point.y > 9) return "O";
    return "";
  }

  /**
   * Loads a sample level defined with the sampleLevel var.
   */
  loadSampleLevel() {
    if (this.stage === 0) {
      this.objects = SampleLevel().slice();
      const pos = this.getPlayerPosition();
      this.heroCoords.setPos(pos.x, pos.y);
      this.addAllOriginalObjectsToField();
    }
  }
  /**
   * Loops through the list of play mode objects to find coordinates of the Hero/Player.
   * @returns {Point|null} Point or null if not found.
   */
  getPlayerPosition() {
    //play mode
    if (this.stage === 1) {
      for (let i = 0; i < this.playObjects.length; i++) {
        let item = this.playObjects[i];
        if (item.type === 'H')
          return new Point(item.x, item.y);
      }
    }

    //edit mode
    for (let i = 0; i < this.objects.length; i++) {
      let item = this.objects[i];
      if (item.type === 'H')
        return new Point(item.x, item.y);
    }
    return null;
  }

  /** Clears all contents from level. */
  clearLevel() {
    if (this.stage === 0) {
      this.objects = [];
      this.heroCoords.setPos(-1, -1);
      this.addAllOriginalObjectsToField();
    }
  }

  /** Clears the table grid, and adds all objects from the edit mode to the field. */
  addAllOriginalObjectsToField() {
    // reset all table cells to white.
    const cells = document.querySelectorAll('#gameGrid td');
    cells.forEach((io) => {
      io.style.backgroundColor = 'var(--E)';
    })

    this.objects.forEach((obj) => {
      cells.forEach((io) => {
        const str = io.getAttribute('id').split(',');
        if (str[0] === obj.x && str[1] === obj.y) {
          document.getElementById(`${str[0]},${str[1]}`).style.backgroundColor = colorHelper(obj.type.startsWith('T') ? 'T' : obj.type);  
        }
      })
    })
  }
  
  /** Checks whether the game has any treasure left to collect. */
  checkWinCondition() { if (this.treasureLeft === 0) this.gameOver(true) }

  /** Initiates game over sequence. */
  gameOver(victory) {
    this.isPlayerTurn = true;
    alert(`You ${victory ? 'win' : 'lose'}! Elapsed turns: ` + (this.turnCounter + 1));

    document.getElementById("btnPlay").disabled = true;

    //delay resetting game state so that the most recent move can be executed, otherwise the move will be executed in edit mode.
    setTimeout(() => {
      this.togglePlayMode(document.getElementById("btnPlay"));
      document.getElementById("btnPlay").disabled = false;
    }, 501)
  }

  /**
   * Moves an object in a given direction.
   * @param {string} x
   * @param {string} y
   * @param {string} direction
   * @param {string} type
   */
  moveObject(x, y, direction, type) {
    let pos = new Point(x, y);

    //translate string literal to position value.
    if (direction === "w") pos.x--;
    else if (direction === "s") pos.x++;
    else if (direction === "a") pos.y--;
    else if (direction === "d") pos.y++;

    //check if obstacle isn't a wall.
    const obstacle = this.isThereAnObstacle(pos);
    if (obstacle !== "O") {
      //if there is an obstacle at coordinates
      if (obstacle.charAt(0) === "K") {
        // if player walks into robot,
        if (type === "H") this.gameOver(false);
      } else if (obstacle.charAt(0) === "H") {
        // if robot walks into player.
        if (type === "K") this.gameOver(false);
      }

      //check for treasure at coords.
      if (obstacle.charAt(0) === "T") { //add score if it's treasure.
        this.setScore(this.isThereAnObstacle(pos).charAt(2), true);
        this.treasureLeft--;
        this.playObjects.forEach((obj, i) => {
          if (Point.compare(obj, pos)) this.playObjects.splice(i, 1);
        })
      }
      
      let returnable;
      //this if statement exists to mainly prevent robots from walking into each other.
      if (obstacle !== type) {
        //clear previous position, remove object from play objects.
        this.playObjects.forEach((item, i) => {
          if (Point.compare(item, new Point(x, y))) this.playObjects.splice(i, 1);
        })
        if (type === "H") this.playHeroCoords.setPosFromPoint(pos);
        
        document.getElementById(`${x},${y}`).style.backgroundColor = colorHelper('E');
        document.getElementById(`${pos.x},${pos.y}`).style.backgroundColor = colorHelper(type);
        this.map[x][y] = " ";
        this.map[pos.x][pos.y] = type;

        returnable = new ItemObject(pos.x, pos.y, type);
        this.playObjects.push(returnable);
        return returnable;
      } else {
        // if obstacle is in the way, and it's a robot,
        // keep robot at same position, re-added to the end of the list, so that the turn order updates.
        if (type === "K") { //robot colour.
          this.playObjects.forEach((item, i) => {
            if (Point.compare(item, new Point(x, y))) this.playObjects.splice(i, 1);
          })

          document.getElementById(`${x},${y}`).style.backgroundColor = colorHelper('E');
          document.getElementById(`${pos.X},${pos.Y}`).style.backgroundColor = colorHelper(type);
          returnable = new ItemObject(x, y, type);
          this.playObjects.push(returnable);

          return returnable;
        } else {
          this.map[x][y] = " ";
          this.map[pos.y][pos.y] = type;
          returnable = new ItemObject(pos.x, pos.y, type);
          this.playObjects.push(returnable);

          return returnable;
        }
      }
    }
  }
  
  startAITurn() {
    if (this.isPlayerTurn) //this happens should play mode be toggled again.
      return;

    document.getElementById("turnIndicator").innerText = "Enemy Turn";
    document.getElementById("turnIndicator").style.color = "red";

    //ai decision is set to a timeout so that there is a pause between the player's move and AI's move,
    // this is done purposefully to allow a "dramatic pause" for the player to observe what is happening.
    setTimeout(() => {
      this.playObjects.forEach((item) => {
        if (item.type === 'K') {
          let isGuarding = false;
          const min = new Point(item.x - 1, item.y - 1);
          const max = new Point(parseInt(item.x) + 1, parseInt(item.y) + 1)
          for (let i = min.x; i <= max.x; i++) {
            for (let j = min.y; j <= max.y; j++) {
              // if player is next to robot, while it guards treasure, robot will stop guarding.
              isGuarding = this.isThereAnObstacle(i, j).charAt(0) === "T";
            }
            if (!isGuarding) {
              let newObj = this.moveObject(item.x, item.y, this.getDirectionString(item, playHeroCoords, false), "K");
              if (typeof newObj === 'undefined') { //move has failed.
                newObj = this.moveObject(item.x, item.y, this.getDirectionString(item, playHeroCoords, true), "K");
              }
              break;
            }
          }
        }
      })

      //AI Turn End.
      this.isPlayerTurn = true;
      document.getElementById("turnIndicator").innerText = "Your Turn";
      document.getElementById("turnIndicator").style.color = "limegreen";
    }, 500);
  }

  /**
   * Gets direction of which the bot should be heading.
   * @param {boolean} failedAttempt try the next possible move instead of the first possible move.
   * @returns {string} direction of AI
   */
  getDirectionString(p1, p2, failedAttempt) {
    let str = "";
    if (p1.x < p2.x) {
      str = "down";
      if (!failedAttempt) return str;
    }
    if (p1.x > p2.x) {
      str = "up";
      if (!failedAttempt) return str;
    }
    if (p1.y < p2.y) {
      str = "right";
      if (!failedAttempt) return str;
    }
    if (p1.y > p2.y) {
      str = "left";
      if (!failedAttempt) return str;
    }
    return str;
  }
}

export default Game;
