import { Point, Types } from "../components/index.js";
const es = window.EasyStar;

/**
 * Finds the shortest path between two points.
 * @param {ItemObject} start 
 * @param {ItemObject} end 
 * @param {ItemObject[]} objects
 * @param {Point} gridSize
 */
const pathFinder = async (start, end, grid, callback) => {
  es.setGrid(grid);
  es.setAcceptableTiles([0]);
  es.findPath(start.cell.x, start.cell.y, end.cell.x, end.cell.y, (path) => {
    callback(path ? new Point(path[1].x, path[1].y) : null);
  });
  es.calculate();
}

export default pathFinder;