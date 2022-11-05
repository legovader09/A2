import Game from './Game.js';
import toggleHelpText from './helpers/toggleHelpText.js';
import setBuildObjectType from './helpers/setBuildObjectType.js';
import getDirection from './helpers/getDirection.js';

window.Game = new Game(document.getElementById('board'));
window.toggleHelpText = toggleHelpText;
window.setBuildObjectType = setBuildObjectType;
window.addEventListener("keydown", (e) => {
  e.preventDefault();
  return window.Game.movePlayer(getDirection(e.key));
});

window.Game.loadSampleLevel();
