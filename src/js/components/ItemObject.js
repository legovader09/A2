/**
 * An ItemObject that holds x and y coordinates, as well as the type of object at those coordinates.
 * @param {string} x Position x on the grid.
 * @param {string} y Position y on the grid.
 * @param {string} type Type of object to place on the grid.
 */
class ItemObject {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
    }
}

export default ItemObject;