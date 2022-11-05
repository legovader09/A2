import Point from './Point.js';

const GameProperties = {
  board: board,
  boardSize: new Point(10, 10),
  objects: [],
  objectsBackup: [],
  heroTile: null,
  isPlaying: false,
  isPlayerTurn: true,
  lockGame: false,
  buildType: null,
  score: 0,
}

export default GameProperties;