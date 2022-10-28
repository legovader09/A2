import Cell from './Cell.js';

/**
 * An ItemObject that holds x and y coordinates, as well as the type of object at those coordinates.
 * @param {string} x Position x on the grid.
 * @param {string} y Position y on the grid.
 * @param {string} type Type of object to place on the grid.
 */
class ItemObject {
  constructor(x, y, type) {
    this.cell = Object.assign({}, Cell);
    this.cell.x = x;
    this.cell.y = y;
    this.type = 'E';
  }

  neighbours(left, right, up, down) {
    this.cell.left = left;
    this.cell.right = right;
    this.cell.up = up;
    this.cell.down = down;
  }

  setType(type) {
    this.type = type;
    const td = document.getElementById(`${this.cell.x},${this.cell.y}`);
    td.style.backgroundColor = `var(--${type})`
  }
}

export default ItemObject;
