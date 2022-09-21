import Game from './Game.js';
import toggleHelpText from './helpers/toggleHelpText.js';

window.Game = new Game(10, document.getElementById('board'));
window.toggleHelpText = toggleHelpText();
