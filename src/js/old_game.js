
/**
 * Loads a sample level defined with the sampleLevel var.
 */
function loadSampleLevel() {
  if (stage === 0) {
    objects = sampleLevel.slice();
    let pos = GetPlayerPosition();
    heroCoords.x = pos.x;
    heroCoords.y = pos.y;
    addAllOriginalObjectsToField();
  }
}

/**
 * Clears all contents from level.
 */
function clearLevel() {
  if (stage === 0) {
    objects = [];
    heroCoords.x = -1;
    heroCoords.y = -1;
    addAllOriginalObjectsToField();
  }
}

/**
 * Clears the table grid, and adds all objects from the edit mode to the field.
 */
function addAllOriginalObjectsToField() {
  // reset all table cells to white.
  let cells = document.querySelectorAll("#gameGrid td"); //select all table cells.
  for (let i = 0; i < cells.length; i++) {
    let io = cells[i];
    io.style.backgroundColor = 'white';
  }

  //iterate through objects list to reset positions for edit mode
  for (let i = 0; i < objects.length; i++) {
    let obj = objects[i];
    let matchFound = false;
    let str = [];
    for (let j = 0; j < cells.length; j++) { //find matching table cell.
      let io = cells[j];
      str = io.getAttribute('id').split(",");
      if (str[0] === obj.x && str[1] === obj.y) {
        matchFound = true;
        break;
      }
    }

    if (matchFound === true) { //if matching table cell is found, check object type and add that colour to the grid from matching cell.
      if (obj.type === 'O') {
        document.getElementById(`${str[0]},${str[1]}`).style.backgroundColor = "grey";
      } else if (obj.type === 'K') {
        document.getElementById(`${str[0]},${str[1]}`).style.backgroundColor = "red";
      } else if (obj.type === 'E') {
        document.getElementById(`${str[0]},${str[1]}`).style.backgroundColor = "white";
      } else if (obj.type.indexOf('T') !== -1) {
        document.getElementById(`${str[0]},${str[1]}`).style.backgroundColor = "gold";
      } else if (obj.type === 'H') {
        document.getElementById(`${str[0]},${str[1]}`).style.backgroundColor = "lightblue";
      }
    }
  }
}

/**
 * Loops through the list of play mode objects to find coordinates of the Hero/Player.
 * @returns {Point|null}
 * @constructor
 */
function GetPlayerPosition() {
  //play mode
  if (stage === 1) {
    for (let i = 0; i < playObjects.length; i++) {
      let item = playObjects[i];
      if (item.type === "H")
        return new Point(item.x, item.y);
    }
  }

  //edit mode
  for (let i = 0; i < objects.length; i++) {
    let item = objects[i];
    if (item.type === "H")
      return new Point(item.x, item.y);
  }
  return null;
}

/**
 * Returns true if a treasure tile is found in the objects list.
 * @returns {boolean}
 */
function isThereAnyTreasure() {
  amountOfTreasure = 0;
  for (let i = 0; i < playObjects.length; i++) { // if there is an obstacle (wall) in the way,
    let item = playObjects[i];
    if (item.type.indexOf("T") !== -1)
      amountOfTreasure++; //this let will be used to determine game completion state later.
  }

  return (amountOfTreasure > 0);
}

/**
 * Checks if there is an obstacle at given coordinates.
 * @param x
 * @param y
 * @returns {string}
 */
function isThereAnObstacle(x, y) {
  for (let i = 0; i < playObjects.length; i++) { // if there is an obstacle (wall) in the way,
    let item = playObjects[i];
    if (item.x.toString() === x.toString() && item.y.toString() === y.toString()) {
      return item.type;
    }
  }
  if (x < 0 || x > 9) //out of bounds x axis.
    return "O";
  if (y < 0 || y > 9) //out of bounds y axis.
    return "O";

  return "";
}

/**
 * Moves an object in a given direction.
 * @param {string} x
 * @param {string} y
 * @param {string} direction
 * @param {string} type
 */
function moveObject(x, y, direction, type) {
  let posX = x, posY = y;

  //translate string literal to position value.
  if (direction === "w") {
    posX--;
  } else if (direction === "s") {
    posX++;
  } else if (direction === "a") {
    posY--;
  } else if (direction === "d") {
    posY++;
  }

  //check if obstacle isn't a wall.
  let obstacle = isThereAnObstacle(posX, posY);
  if (obstacle !== "O") {
    //if there is an obstacle at coordinates
    if (obstacle.charAt(0) === "K") {
      // if player walks into robot,
      if (type === "H") {
        gameOver(false);
      }
    } else if (obstacle.charAt(0) === "H") {
      // if robot walks into player.
      if (type === "K") {
        gameOver(false);
      }
    }

    //check for treasure at coords.
    if (obstacle.charAt(0) === "T") { //add score if it's treasure.
      setScore(isThereAnObstacle(posX, posY).charAt(2), true);
      treasureLeft--; //reduce the amount of treasure left.
      //loop through play objects and remove collected treasure.
      for (let i = 0; i < playObjects.length; i++) {
        let obj = playObjects[i];
        if (obj.x === posX.toString() && obj.y === posY.toString()) {
          playObjects.splice(i, 1);
        }
      }
    }
    let returnable;
    //this if statement exists to mainly prevent robots from walking into each other.
    if (obstacle !== type) {
      document.getElementById(x + "," + y).style.backgroundColor = "white";
      //clear previous position, remove object from play objects.
      for (let j = 0; j < playObjects.length; j++) {
        let item = playObjects[j];
        if (item.x === x && item.y === y) {
          playObjects.splice(j, 1);
          break;
        }
      }
      if (type === "H") { //hero colour
        document.getElementById(posX + ',' + posY).style.backgroundColor = 'lightblue';
        playHeroCoords.x = posX;
        playHeroCoords.y = posY;
      } else if (type === "K") { //robot colour.
        document.getElementById(posX + ',' + posY).style.backgroundColor = 'red';
      }

      map[x][y] = " ";
      map[posX][posY] = type;
      returnable = new ItemObject(posX, posY, type);
      playObjects.push(returnable);

      return returnable;
    } else {
      // if obstacle is in the way, and it's a robot,
      // keep robot at same position, re-added to the end of the list, so that the turn order updates.
      if (type === "K") { //robot colour.
        document.getElementById(x + "," + y).style.backgroundColor = "white";
        for (let j = 0; j < playObjects.length; j++) {
          let item = playObjects[j];
          if (item.x === x && item.y === y) {
            playObjects.splice(j, 1);
            break;
          }
        }

        document.getElementById(x + ',' + y).style.backgroundColor = 'red';
        returnable = new ItemObject(x, y, type);
        playObjects.push(returnable);

        return returnable;
      } else {
        map[x][y] = " ";
        map[posX][posY] = type;
        returnable = new ItemObject(posX, posY, type);
        playObjects.push(returnable);

        return returnable;
      }
    }
  }
}

/**
 * Checks whether the game has any treasure left to collect.
 */
const checkWinCondition = () => { if (treasureLeft === 0) gameOver(true) }

/**
 * Initiates game over sequence.
 */
function gameOver(victory) {
  isPlayerTurn = true;
  if (victory)
    alert("You Win! Elapsed turns: " + (turnCounter + 1));
  else
    alert("Game Over! Elapsed turns: " + (turnCounter + 1));

  document.getElementById("btnPlay").disabled = true;
  //delay resetting game state so that the most recent move can be executed, otherwise the move will be executed in edit mode.
  setTimeout(function () {
    togglePlayMode(document.getElementById("btnPlay"));
    document.getElementById("btnPlay").disabled = false;
  }, 501)
}

function startAITurn() {
  if (isPlayerTurn) //this happens should play mode be toggled again.
    return;

  document.getElementById("turnIndicator").innerText = "Enemy Turn";
  document.getElementById("turnIndicator").style.color = "red";

  //ai decision is set to a timeout so that there is a pause between the player's move and AI's move,
  // this is done purposefully to allow a "dramatic pause" for the player to observe what is happening.
  setTimeout(function() {
    for (let k = 0; k < playObjects.length; k++) {
      const item = playObjects[k];
      if (item.type === "K") {
        /** Loop through surrounding tiles of each robot. */
        let isGuarding = false;
        const min = new Point(item.x - 1, item.y - 1);
        const max = new Point(parseInt(item.x) + 1, parseInt(item.y) + 1)
        for (let l = min.x; l <= max.x; l++) {
          for (let m = min.y; m <= max.y; m++) {
            if (isThereAnObstacle(l, m).charAt(0) === "H") {
              /** if player is next to robot, while it guards treasure, robot will stop guarding. */
              isGuarding = false;
            } else if (isThereAnObstacle(l, m).charAt(0) === "T") {
              /** if there is treasure, do not move, guard the treasure */
              isGuarding = true;
            }
          }
        }
        if (!isGuarding) {
          let newObj = moveObject(item.x, item.y, getDirectionString(item.x, item.y, playHeroCoords.x, playHeroCoords.y, false), "K");
          if (typeof newObj === 'undefined') { //move has failed.
            newObj = moveObject(item.x, item.y, getDirectionString(item.x, item.y, playHeroCoords.x, playHeroCoords.y, true), "K");
          }
          break;
        }
      }
    }

    //AI Turn End.
    isPlayerTurn = true;
    document.getElementById("turnIndicator").innerText = "Your Turn";
    document.getElementById("turnIndicator").style.color = "limegreen";
  }, 500);
}

/**
 * Gets direction of which the bot should be heading.
 * @param {boolean} failedAttempt try the next possible move instead of the first possible move.
 * @returns {string} direction of AI
 */
function getDirectionString(x1, y1, x2, y2, failedAttempt) {
  let str = "";
  if (x1 < x2) {
    str = "down";
    if (!failedAttempt) return str;
  }
  if (x1 > x2) {
    str = "up";
    if (!failedAttempt) return str;
  }
  if (y1 < y2) {
    str = "right";
    if (!failedAttempt) return str;
  }
  if (y1 > y2) {
    str = "left";
    if (!failedAttempt) return str;
  }
  return str;
}
