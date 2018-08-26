import { SQUARE_SIZE } from "../common";

const tileCache: { [key: string]: { squareSize: number, canvas: HTMLCanvasElement } } = {
  door: { squareSize: SQUARE_SIZE, canvas: null },
  flowers: { squareSize: SQUARE_SIZE, canvas: null },
  grass: { squareSize: SQUARE_SIZE, canvas: null },
  green: { squareSize: SQUARE_SIZE, canvas: null },
  house: { squareSize: SQUARE_SIZE, canvas: null },
  sky: { squareSize: SQUARE_SIZE, canvas: null },
  tree: { squareSize: SQUARE_SIZE, canvas: null },
  unwalkable: { squareSize: SQUARE_SIZE, canvas: null },
};

export default tileCache;
