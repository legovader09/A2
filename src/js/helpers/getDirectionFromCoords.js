/**
 * Gets direction based on coordinate change.
 * @param {Point} from 
 * @param {Point} to 
 */
const getDirectionFromCoords = (from, to) => {
  if (from.x < to.x) return 'right';
  if (from.x > to.x) return 'left';
  if (from.y < to.y) return 'down';
  if (from.y > to.y) return 'up';
}

export default getDirectionFromCoords;
