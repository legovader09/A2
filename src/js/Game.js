import { Point, ItemObject, GameProperties } from './components/index.js';
import SampleLevel from './SampleLevel.js';
import Types from "./components/Types.js";
import pathFinder from './helpers/pathFinder.js';
import getDirectionFromCoords from './helpers/getDirectionFromCoords.js';

class Game {
  constructor(board) {
    this.Properties = Object.assign({}, GameProperties);
    this.Properties.board = board;
    this.drawMap();
    this.setObjectNeighbours();
  }

  /**
   * Creates a (boardSize) by (boardSize) table grid, and adds a click event listener to each cell.
   */
  drawMap() {
    const table = document.createElement('table');
    table.id = 'gameGrid';
    for (let y = 0; y < this.Properties.boardSize.y; y++) {
      let tr = document.createElement('tr');
      for (let x = 0; x < this.Properties.boardSize.x; x++) {
        let td = document.createElement('td');
        td.id = `${x},${y}`;
        td.addEventListener('click', () => this.onTileClick(x, y));
        this.Properties.objects.push(new ItemObject(x, y));
        tr.appendChild(td);
      }
      table.appendChild(tr);
    }
    this.Properties.board.insertAdjacentElement('beforeend', table);
  }

  createGridForPathFinding() {
    const grid = [];
    for (let y = 0; y < this.Properties.boardSize.x; y++) {
      const arr = grid[y] = [];
      for (let x = 0; x < this.Properties.boardSize.x; x++) {
        const type = this.Properties.objects.find((item) => item.cell.x === x && item.cell.y === y).type;
        arr[x] = (type == Types.O) || type.startsWith(Types.T) ? 1 : 0;
      }
    }
    return grid;
  }

  setObjectNeighbours() {
    this.Properties.objects.forEach((item) => {
      item.neighbours(
        this.Properties.objects.find((i) => i.cell.x === item.cell.x - 1 && i.cell.y === item.cell.y),
        this.Properties.objects.find((i) => i.cell.x === item.cell.x + 1 && i.cell.y === item.cell.y),
        this.Properties.objects.find((i) => i.cell.y === item.cell.y - 1 && i.cell.x === item.cell.x),
        this.Properties.objects.find((i) => i.cell.y === item.cell.y + 1 && i.cell.x === item.cell.x),
      )
    })
  }

  onTileClick(x, y) {
    if (this.Properties.buildType && this.Properties.isPlaying === false) {
      this.setCell(x, y, this.Properties.buildType);
    }
  }

  /**
   * Updates slider value text.
   * @param {string} val value of the slider
  * @param {string} elementText name of element that reflects the slider value.
   */
  setTreasureVal(val, elementText) {
    elementText.innerText = val;
    this.Properties.buildType = `T(${val})`;
  }

  togglePlayMode(sender) {
    if (!this.canPlay()) return;
    this.Properties.isPlaying = !this.Properties.isPlaying;
    sender.style.backgroundColor = `var(--ui-play-button${this.Properties.isPlaying ? '-pressed' : ''})`;
    sender.value = this.Properties.isPlaying ? 'Stop' : 'Play';
    document.querySelectorAll('.EditUI').forEach((e) => e.classList.toggle('hidden'))
    if (this.Properties.isPlaying) {
      this.Properties.objectsBackup = this.createBackup();
    } else {
      this.clearBoard();
      this.Properties.objectsBackup.forEach((item) => {
        this.setCell(item.x, item.y, item.type);
      });
    }
    this.updateTurnIndicator();
  }

  canPlay() {
    if (!this.Properties.heroTile) {
      alert("Please place down the player character to start the game.");
      return false;
    };
    return !this.Properties.lockGame;
  }

  updateTurnIndicator() {
    const indicator = document.getElementById('turnIndicator');
    const turnButtonText = this.Properties.isPlayerTurn ? 'player' : 'ai';
    const turnLabel = this.Properties.isPlayerTurn ? 'Your Turn' : "Enemy Turn";
    indicator.style.color = `var(--ui-${this.Properties.isPlaying ? turnButtonText : 'edit'}-turn)`;
    indicator.innerText = this.Properties.isPlaying ? turnLabel : 'Edit Mode';
  }

  async movePlayer(e) {
    if (this.Properties.isPlaying && this.Properties.isPlayerTurn) {
      const move = (c) => {
        this.Properties.heroTile.setType(Types.E);
        c.setType(Types.H);
        this.Properties.heroTile = c;
        if (!this.Properties.objects.find((item) => item.type.startsWith(Types.T))) 
          this.endGame(true);
        else
          this.startAITurn();
      }
  
      const c = this.Properties.heroTile.cell[e];
      if (!c) return;
      switch (c.type) {
        case Types.O:
          break;
        case Types.T + c.type.substring(1):
          this.setScore(Number(c.type.charAt(2)));
          move(c);
          break;
        case Types.K:
          this.endGame(false);
          break;
        default:
          move(c);
          break;
      }
    }
  }

  async moveEnemies() {
    const endAITurn = (aiWin = false) => {
      this.Properties.isPlayerTurn = true;
      this.updateTurnIndicator();
      this.Properties.lockGame = false;
      if (aiWin) {
        this.endGame();
      }
    }
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const grid = this.createGridForPathFinding();
    const enemies = this.Properties.objects.filter((e) => e.type === Types.K);
    if (enemies.length === 0) endAITurn();
    await delay(500).then(() => {
      let AIWIN = false;
      enemies.forEach(async (e, index) => {
        await delay(500 * index).then(() => {
          pathFinder(e, this.Properties.heroTile, grid, ((coords) => {
            const next = e.cell[getDirectionFromCoords(new Point(e.cell.x, e.cell.y), coords)];
            if (next.type === Types.K) return;
            if (next.type === Types.H) AIWIN = true;
            e.setType(Types.E);
            e = next;
            e.setType(Types.K);
            if (AIWIN) endAITurn(AIWIN);
          }));
        }).then(() => {
          if (index === enemies.length - 1) endAITurn();
        });
      });
    });
  }

  async startAITurn() {
    this.Properties.lockGame = true;
    this.Properties.isPlayerTurn = false;
    this.updateTurnIndicator();
    await this.moveEnemies();
  }

  setScore(score, additive = true) {
    this.Properties.score = additive ? this.Properties.score + score : score;
    document.getElementById('score').innerText = `Score: ${this.Properties.score}`;
  }

  endGame(win) {
    alert(`You ${win ? 'won' : 'lost'}! You scored ${this.Properties.score} points.`);
    this.togglePlayMode(document.getElementById('btnPlay'));
  }

  setCell(x, y, type) {
    const cell = this.Properties.objects.find((i) => i.cell.x === x && i.cell.y === y);
    cell.setType(type);
    if (type === Types.H) {
      if (this.Properties.heroTile) 
        this.Properties.heroTile.setType(Types.E);
      this.Properties.heroTile = cell;
    }
  }

  clearBoard() {
    if (this.Properties.isPlaying) return;
    this.Properties.heroTile = null;
    this.Properties.objects.forEach((e) => {
      e.setType(Types.E);
    });
    this.setScore(0, false);
  }

  createBackup() {
    const arr = [];
    this.Properties.objects.forEach((item) => {
      if (item.type === Types.E) return;
      arr.push({ x: item.cell.x, y: item.cell.y, type: item.type });
    })
    return arr;
  }

  importLevel() {
    if (this.Properties.isPlaying) return;
    const code = prompt("Please enter a level code", "");
    if (code) {
      try {
        const obj = JSON.parse(code);
        obj.forEach((e) => {
          this.setCell(e.x, e.y, e.type);
        })
      } catch (error) {
        alert("Invalid level code!");
      }
    }
  }

  shareLevel() {
    if (this.Properties.isPlaying) return;
    const backup = this.createBackup();
    prompt("Copy and share the text below:", JSON.stringify(backup));
  }

  loadSampleLevel() {
    if (this.Properties.isPlaying) return;
    this.clearBoard();
    SampleLevel.forEach((e) => {
      this.setCell(e.x, e.y, e.type);
    });
  }
}

export default Game;
