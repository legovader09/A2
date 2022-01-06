//edit mode vars
var stage = 0; //0 = setup, 1 = play, 2 = end.
var heroCoordsX = -1, heroCoordsY = -1, playHeroCoordsX, playHeroCoordsY;
var selectedGridX = -1, selectedGridY = -1, selectedGridVal = " ";
var buildType;
var map;
var objects = [];
var size = 10;
//play mode vars
var playObjects = [];
var score = 0;
var turnCounter = 0;
var isPlayerTurn = true;
var amountOfTreasure = 0;
var treasureLeft = 0;

/**
 * An ItemObject that holds x and y coordinates, as well as the type of object at those coordinates.
 * @param {string} x Position x on the grid.
 * @param {string} y Position y on the grid.
 * @param {string} type Type of object to place on the grid.
 * @constructor
 */
function ItemObject(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
}

/**
 * A point that represents a location from (x, y) coordinates.
 * @param {string} x
 * @param {string} y
 * @constructor
 */
function Point(x, y) {
    this.x = x;
    this.y = y;
}

initGrid(size);

//adds event listener for keyboard input, for play and edit mode.
document.addEventListener('keypress', function (event) {
    if (stage === 0) { //only proceed if game is in edit mode.
        if (event.key === 'o') {
            addObject('O');
        } else if (event.key >= 48 || event.key <= 57) { //check if keypress is a number.
            console.log("Number pressed!");
            addObject("T(" + event.key + ")");
        } else if (event.key === 'h') {
            addObject('H');
        } else if (event.key === 'k') {
            addObject('K');
        } else if (event.key === 'e') {
            addObject('E');
        } else if (event.key === 'Enter') {
            togglePlayMode(document.getElementById("btnPlay"));
        }
    } else if (stage === 1 && isPlayerTurn)
    {
        var hasMadeMove = false;
        var pos = GetPlayerPosition();
        if (event.key === 'w') {
            moveObject(pos.x, pos.y, "up", "H");
            hasMadeMove = true;
        } else if (event.key === 's') {
            moveObject(pos.x, pos.y, "down", "H");
            hasMadeMove = true;
        } else if (event.key === 'a') {
            moveObject(pos.x, pos.y, "left", "H");
            hasMadeMove = true;
        } else if (event.key === 'd') {
            moveObject(pos.x, pos.y, "right", "H");
            hasMadeMove = true;
        } else if (event.key === 'Enter') {
            togglePlayMode(document.getElementById("btnPlay"));
        }

        checkWinCondition();

        //when player moves, start AI turn.
        if (hasMadeMove && treasureLeft !== 0) {
            turnCounter++;
            isPlayerTurn = false;
            startAITurn();
        }
    }
});

/**
 * =======================
 * = GRID INITIALISATION =
 * =======================
 */

/**
 * Creates the initial grid, and draws a {size} x {size} table.
 * @param size The cubic dimension of the game grid.
 */
function initGrid(size) {
    map = createInitialMap(size);
    drawMap(size);
}

/**
 * Creates a (size) by (size) table grid, and adds a click event listener to each cell.
 * @param size
 */
function drawMap(size) {
    document.writeln("<table id='gameGrid'>");
    for (var x = 0; x < size; x++) {
        document.writeln("<tr>")
        for (var y = 0; y < size; y++) {
            var obj = objects.filter(function(o) {
                return o.x === x && o.y === y;
            })[0];
            if (typeof obj !== 'undefined') {
                document.writeln("<td id=" + x + "," + y + ">" + obj.type + "</td>");
            }
            else {
                document.writeln("<td id=" + x + "," + y + "> </td>");
            }
        }
        document.writeln("</tr>");
    }
    document.writeln("</table>");

    var cells = document.querySelectorAll("#gameGrid td"); //select all table cells.
    for (var i = 0; i < cells.length; i++) { //add listeners to all cells.
        cells[i].addEventListener("click", function() {
            console.log(this.getAttribute('id'));
            var str = this.getAttribute('id').split(","); //ID is set to coordinates.
            selectedGridX = str[0];
            selectedGridY = str[1];
            selectedGridVal = this.innerText;
            if (buildType !== null && stage === 0)
                addObject(buildType);
        });
    }
}

/**
 * Creates initial 2D array map.
 * @param {number} size
 */
function createInitialMap(size) {
    var grid = [];
    while(grid.push([]) < size);
    return grid;
}

/**
 * =====================
 * = EDIT MODE BUILDER =
 * =====================
 */

/**
 * Toggles controls help text.
 */
function toggleHelpText() {
    var x = document.getElementById("ControlsMenu");
    x.style.display = (x.style.display !== "none" ? "none" : "block");
}

/**
 * Updates slider value text.
 * @param {string} val
 */
function setTreasureVal(val) {
    document.getElementById('sliderVal').innerText = val;
    buildType = 'T(' + val + ')';
}

/**
 * Sets build type object that is used when a cell on the grid is clicked.
 * @param {string} type
 * @param {object} sender
 */
function setBuildObjectType(type, sender) {
    var elements = document.querySelectorAll("input[type=button]");

    for(var i = 0, len = elements.length; i < len; i++) { //reset all colours before applying new colour.
        if (elements[i].className === "editMode")
            elements[i].style.backgroundColor = 'lightgrey';
    }

    //UI changes that help indicate which button is currently pressed in.
    if (sender !== null)
        sender.style.backgroundColor = 'lightblue';
    else if (type !== " ")
        document.getElementById(type).style.backgroundColor = 'lightblue';

    var x = document.getElementById("sliderContainer");
    x.style.display = (type !== "t" ? "none" : "block");

    if (x.style.display === "none") {
        document.getElementById("treasureValue").value = 1;
        document.getElementById('sliderVal').innerText = 1;
    }

    buildType = type.toUpperCase();
}

/**
 Checks whether a selected space already has an object. If true, that occupied space will be cleared.
 */
function isSpaceOccupied() {
    for (var i = 0; i < objects.length; i++) {
        var item = objects[i];
        if (item.x === selectedGridX && item.y === selectedGridY) {
            if (item.type === 'H') { // if item that got removed was hero, reset hero coordinates.
                heroCoordsX = -1;
                heroCoordsY = -1;
            }
            objects.splice(i, 1);
        }
    }
}

/**
 Adds an object to the game grid.
 * @param {string} type
 */
function addObject(type) {
     if (typeof type === 'undefined' || selectedGridX === -1 || selectedGridY === -1) //dont add an object if no cell is selected, or if type is empty.
         return;

     var str = " ";

     //if in edit mode, check if a space is occupied, if it is, the object will be cleared.
     if (stage === 0) isSpaceOccupied();

     if (type === 'O') {
         str = "O";
         document.getElementById(selectedGridX + ',' + selectedGridY).style.backgroundColor = "grey";
     }
     else if (type === 'K') {
         str = "K";
         document.getElementById(selectedGridX + ',' + selectedGridY).style.backgroundColor = "red";
     }
     else if (type === 'E') {
         str = " ";
         document.getElementById(selectedGridX + ',' + selectedGridY).style.backgroundColor = "white";
     }
     else if (type.indexOf('T') !== -1) {
         if (type === 'T') //default value is T only instead of T(1) for some strange reason.
             str = "T(1)";
         else
            str = type;
         document.getElementById(selectedGridX + ',' + selectedGridY).style.backgroundColor = "gold";
     }
     else if (type === 'H') {
         str = "H";
         //as there can only be one hero object, check if hero has already been placed.
         if (heroCoordsX !== -1 && heroCoordsY !== -1) {
             //clear hero space if it already exists.
             document.getElementById(heroCoordsX + ',' + heroCoordsY).style.backgroundColor = "white";

             //delete hero object from list.
             for (var i = 0; i < objects.length; i++) {
                 var item = objects[i];
                 if (item.x === heroCoordsX && item.y === heroCoordsY) {
                     objects.splice(i, 1);
                 }
             }

             map[heroCoordsX][heroCoordsY] = " ";
             heroCoordsX = -1;
             heroCoordsY = -1;
         }
         //set new hero object position on grid, and update hero coords.
         document.getElementById(selectedGridX + ',' + selectedGridY).style.backgroundColor = "lightblue";
         heroCoordsX = selectedGridX;
         heroCoordsY = selectedGridY;
     }

     //add new object to the objects list.
     map[selectedGridX][selectedGridY] = str;
     objects.push(new ItemObject(selectedGridX, selectedGridY, str));

     //if erase, pop the most recent object that has been added.
     if (type === 'E')
        objects.pop();

     //deselect the current grid.
     selectedGridX = -1;
     selectedGridY = -1;
     return str;
}

/**
 * =======================
 * = PLAY MODE FUNCTIONS =
 * =======================
 */

/**
 * Toggles the game state between Edit and Play mode.
 */
function togglePlayMode(sender) {

    playObjects = objects.slice();
    if (stage === 0) { //preparing for play mode
        if (heroCoordsX === -1 || heroCoordsY === -1) {
            alert("Please ensure you place a hero object on the board.")
            return;
        }
        if (!isThereAnyTreasure()) {
            alert("Please ensure you have placed treasure on the board.")
            return;
        }

        //we need to keep the original hero coords for edit mode, so this creates a duplicate, same with treasure amounts.
        playHeroCoordsX = heroCoordsX;
        playHeroCoordsY = heroCoordsY;
        treasureLeft = amountOfTreasure;

    } else { //going back to edit mode
        playObjects = [];

        //reset to initial variable values.
        isPlayerTurn = true;
        turnCounter = 0;
        setScore("0", false);
        addAllOriginalObjectsToField()
    }

    // toggle stage button UI and stage mode.
    stage = (stage === 0 ? 1 : 0);
    sender.value = (sender.value === "Play" ? "Reset" : "Play");
    sender.style.backgroundColor = (sender.style.backgroundColor !== 'lightgreen' ? 'lightgreen' : 'lightpink');
    setBuildObjectType(" ", null); //reset buttons.
}

/**
 * Loads a sample level defined with the sampleLevel var.
 */
function loadSampleLevel() {
    if (stage === 0) {
        objects = sampleLevel.slice();
        var pos = GetPlayerPosition();
        heroCoordsX = pos.x;
        heroCoordsY = pos.y;
        addAllOriginalObjectsToField();
    }
}

/**
 * Clears all contents from level.
 */
function clearLevel() {
    if (stage === 0) {
        objects = [];
        heroCoordsX = -1;
        heroCoordsY = -1;
        addAllOriginalObjectsToField();
    }
}

/**
 * Clears the table grid, and adds all objects from the edit mode to the field.
 */
function addAllOriginalObjectsToField() {
    // reset all table cells to white.
    var cells = document.querySelectorAll("#gameGrid td"); //select all table cells.
    for (var i = 0; i < cells.length; i++) {
        var io = cells[i];
        io.style.backgroundColor = 'white';
    }

    //iterate through objects list to reset positions for edit mode
    for (var i = 0; i < objects.length; i++) {
        var obj = objects[i];
        var matchFound = false;
        var str = [];
        for (var j = 0; j < cells.length; j++) { //find matching table cell.
            var io = cells[j];
            str = io.getAttribute('id').split(",");
            if (str[0] === obj.x && str[1] === obj.y) {
                matchFound = true;
                break;
            }
        }

        if (matchFound === true) { //if matching table cell is found, check object type and add that colour to the grid from matching cell.
            if (obj.type === 'O') {
                document.getElementById(str[0] + ',' + str[1]).style.backgroundColor = "grey";
            } else if (obj.type === 'K') {
                document.getElementById(str[0] + ',' + str[1]).style.backgroundColor = "red";
            } else if (obj.type === 'E') {
                document.getElementById(str[0] + ',' + str[1]).style.backgroundColor = "white";
            } else if (obj.type.indexOf('T') !== -1) {
                document.getElementById(str[0] + ',' + str[1]).style.backgroundColor = "gold";
            } else if (obj.type === 'H') {
                document.getElementById(str[0] + ',' + str[1]).style.backgroundColor = "lightblue";
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
        for (var i = 0; i < playObjects.length; i++) {
            var item = playObjects[i];
            if (item.type === "H")
                return new Point(item.x, item.y);
        }
    } else {
        //edit mode
        for (var i = 0; i < objects.length; i++) {
            var item = objects[i];
            if (item.type === "H")
                return new Point(item.x, item.y);
        }
    }
    return null;
}

/**
 * Returns true if a treasure tile is found in the objects list.
 * @returns {boolean}
 */
function isThereAnyTreasure() {
    amountOfTreasure = 0;
    for (var i = 0; i < playObjects.length; i++) { // if there is an obstacle (wall) in the way,
        var item = playObjects[i];
        if (item.type.indexOf("T") !== -1)
            amountOfTreasure++; //this var will be used to determine game completion state later.
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
    for (var i = 0; i < playObjects.length; i++) { // if there is an obstacle (wall) in the way,
        var item = playObjects[i];
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
    var posX = x, posY = y;

    //translate string literal to position value.
    if (direction === "up") {
        posX--;
    } else if (direction === "down") {
        posX++;
    } else if (direction === "left") {
        posY--;
    } else if (direction === "right") {
        posY++;
    }

    //check if obstacle isn't a wall.
    if (isThereAnObstacle(posX, posY) !== "O") {
        //if there is an obstacle at coordinates
        if (isThereAnObstacle(posX, posY).charAt(0) === "K") {
            // if player walks into robot,
            if (type === "H") {
                gameOver(false);
            }
        } else if (isThereAnObstacle(posX, posY).charAt(0) === "H") {
            // if robot walks into player.
            if (type === "K") {
                gameOver(false);
            }
        }

        //check for treasure at coords.
        if (isThereAnObstacle(posX, posY).charAt(0) === "T") { //add score if it's treasure.
            setScore(isThereAnObstacle(posX, posY).charAt(2), true);
            treasureLeft--; //reduce the amount of treasure left.
            //loop through play objects and remove collected treasure.
            for (var i = 0; i < playObjects.length; i++) {
                var obj = playObjects[i];
                if (obj.x === posX.toString() && obj.y === posY.toString()) {
                    playObjects.splice(i, 1);
                }
            }
        }
        var returnable;
        //this if statement exists to mainly prevent robots from walking into each other.
        if (isThereAnObstacle(posX, posY) !== type) {
            document.getElementById(x + "," + y).style.backgroundColor = "white";
            //clear previous position, remove object from play objects.
            for (var j = 0; j < playObjects.length; j++) {
                var item = playObjects[j];
                if (item.x === x && item.y === y) {
                    playObjects.splice(j, 1);
                    break;
                }
            }
            if (type === "H") { //hero colour
                document.getElementById(posX + ',' + posY).style.backgroundColor = 'lightblue';
                playHeroCoordsX = posX;
                playHeroCoordsY = posY;
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
                for (var j = 0; j < playObjects.length; j++) {
                    var item = playObjects[j];
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
function checkWinCondition() {
    if (treasureLeft === 0) {
        gameOver(true)
    }
}

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
    }, 1001)
}

function startAITurn() {
    if (isPlayerTurn) //this happens should play mode be toggled again.
        return;

    document.getElementById("turnIndicator").innerText = "Enemy Turn";
    document.getElementById("turnIndicator").style.color = "red";

    //ai decision is set to a timeout so that there is a pause between the player's move and AI's move,
    // this is done purposefully to allow a "dramatic pause" for the player to observe what is happening.
    setTimeout(function() {
        for (var k = 0; k < playObjects.length; k++) {
            var item = playObjects[k];
            if (item.type === "K") {
                /** Loop through surrounding tiles of each robot. */
                var isGuarding = false;
                //var walls = [];
                //var openSpaces = [];
                var minX = item.x - 1;
                var maxX = parseInt(item.x) + 1;
                var minY = item.y - 1;
                var maxY = parseInt(item.y) + 1;
                for (var l = minX; l <= maxX; l++) {
                    for (var m = minY; m <= maxY; m++) {
                        if (isThereAnObstacle(l, m).charAt(0) === "H") {
                            /** if player is next to robot, while it guards treasure, robot will stop guarding. */
                            isGuarding = false;
                        } else if (isThereAnObstacle(l, m).charAt(0) === "T") {
                            /** if there is treasure, do not move, guard the treasure */
                            isGuarding = true;
                        } //else if (isThereAnObstacle(l, m).charAt(0) === "O") {
                        //    /** if there is an obstacle, add that to the walls array. */
                            //walls.push(new Point(l.toString(), m.toString()));
                        //} else if (isThereAnObstacle(l, m) === "") {
                            //openSpaces.push(new Point(l.toString(), m.toString()));
                        //}
                    }
                }
                if (!isGuarding) {
                    var newObj = moveObject(item.x, item.y, getDirectionString(item.x, item.y, playHeroCoordsX, playHeroCoordsY, false), "K");
                    if (typeof newObj === 'undefined') { //move has failed.
                        newObj = moveObject(item.x, item.y, getDirectionString(item.x, item.y, playHeroCoordsX, playHeroCoordsY, true), "K");
                    }
                    break;
                }
            }
        }

        //AI Turn End.
        //UI updates.
        isPlayerTurn = true;
        document.getElementById("turnIndicator").innerText = "Your Turn";
        document.getElementById("turnIndicator").style.color = "limegreen";
    }, 1000);
}

/**
 * Gets direction of which the bot should be heading.
 * @param x1
 * @param y1
 * @param x2
 * @param y2
 * @param {boolean} failedAttempt try the next possible move instead of the first possible move.
 * @returns {string}
 */
function getDirectionString(x1, y1, x2, y2, failedAttempt) {
    var str = "";
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

/**
 * Add points to the score if additive is set to true, set the score if additive is set to false.
 * @param {string} scr
 * @param {boolean} additive
 */
function setScore(scr, additive) {
    if (additive)
        score += parseInt(scr);
    else
        score = parseInt(scr);
    document.getElementById("score").innerText = "Score: " + score.toString();
}

//sample level for quick testing purposes.
var sampleLevel =
[
    {
        "x": "0",
        "y": "0",
        "type": "O"
    },
    {
        "x": "0",
        "y": "1",
        "type": "O"
    },
    {
        "x": "0",
        "y": "2",
        "type": "O"
    },
    {
        "x": "0",
        "y": "3",
        "type": "O"
    },
    {
        "x": "0",
        "y": "4",
        "type": "O"
    },
    {
        "x": "0",
        "y": "5",
        "type": "O"
    },
    {
        "x": "0",
        "y": "6",
        "type": "O"
    },
    {
        "x": "0",
        "y": "7",
        "type": "O"
    },
    {
        "x": "0",
        "y": "8",
        "type": "O"
    },
    {
        "x": "0",
        "y": "9",
        "type": "O"
    },
    {
        "x": "1",
        "y": "0",
        "type": "O"
    },
    {
        "x": "1",
        "y": "9",
        "type": "O"
    },
    {
        "x": "2",
        "y": "0",
        "type": "O"
    },
    {
        "x": "2",
        "y": "9",
        "type": "O"
    },
    {
        "x": "3",
        "y": "0",
        "type": "O"
    },
    {
        "x": "3",
        "y": "9",
        "type": "O"
    },
    {
        "x": "4",
        "y": "0",
        "type": "O"
    },
    {
        "x": "4",
        "y": "9",
        "type": "O"
    },
    {
        "x": "5",
        "y": "0",
        "type": "O"
    },
    {
        "x": "5",
        "y": "9",
        "type": "O"
    },
    {
        "x": "6",
        "y": "0",
        "type": "O"
    },
    {
        "x": "6",
        "y": "9",
        "type": "O"
    },
    {
        "x": "7",
        "y": "0",
        "type": "O"
    },
    {
        "x": "7",
        "y": "9",
        "type": "O"
    },
    {
        "x": "8",
        "y": "0",
        "type": "O"
    },
    {
        "x": "8",
        "y": "9",
        "type": "O"
    },
    {
        "x": "9",
        "y": "0",
        "type": "O"
    },
    {
        "x": "9",
        "y": "1",
        "type": "O"
    },
    {
        "x": "9",
        "y": "2",
        "type": "O"
    },
    {
        "x": "9",
        "y": "3",
        "type": "O"
    },
    {
        "x": "9",
        "y": "4",
        "type": "O"
    },
    {
        "x": "9",
        "y": "5",
        "type": "O"
    },
    {
        "x": "9",
        "y": "6",
        "type": "O"
    },
    {
        "x": "9",
        "y": "7",
        "type": "O"
    },
    {
        "x": "9",
        "y": "8",
        "type": "O"
    },
    {
        "x": "9",
        "y": "9",
        "type": "O"
    },
    {
        "x": "1",
        "y": "2",
        "type": "T(5)"
    },
    {
        "x": "2",
        "y": "2",
        "type": "K"
    },
    {
        "x": "1",
        "y": "4",
        "type": "O"
    },
    {
        "x": "2",
        "y": "4",
        "type": "O"
    },
    {
        "x": "2",
        "y": "8",
        "type": "O"
    },
    {
        "x": "2",
        "y": "7",
        "type": "O"
    },
    {
        "x": "2",
        "y": "6",
        "type": "O"
    },
    {
        "x": "1",
        "y": "8",
        "type": "K"
    },
    {
        "x": "7",
        "y": "4",
        "type": "H"
    },
    {
        "x": "5",
        "y": "6",
        "type": "T(5)"
    }
]