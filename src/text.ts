import colorMap from "./colors";
import Game from "./game";
import letters from "./letters";

import {
  IPoint,
  ISize,
  ITouchable,
  SQUARE_SIZE,
  } from "./common";

const SHADOW_COLOR = colorMap[0];
const SHADOW_OFFSET = 2;

// Text from https://github.com/PaulBGD/PixelFont
export default class Text implements ITouchable {
  public game: Game;
  public words: string = "";
  public pixelLetters: any[][]; // Why can't I do number[][] without TS errors?
  public size: ISize;
  public drawingSize: ISize = { width: 0, height: 0 };
  public pos: IPoint = { x: 0, y: 0 };
  public color: string;
  public visible: boolean = true;
  public shadow: boolean = true;
  public alpha = 1.0;

  constructor(game: Game, words: string, color: string = colorMap[1], pos: IPoint = { x: 0, y: 0 }) {
    this.game = game;
    this.words = words.toUpperCase();
    this.color = color;
    this.move(pos);
    this.pixelLetters = this.words.split("").map((stringLetter) => letters[stringLetter]);
    this.updateSize();
    this.drawingSize = {
      height: this.size.height * this.game.squareSize,
      width: this.size.width * this.game.squareSize,
    };
  }

  public draw(context) {
    let currX = this.pos.x;
    context.globalAlpha = this.alpha;
    if (this.game.transitioning) context.globalAlpha = Math.min(this.alpha, this.game.transition.nextLevelAlpha);

    this.pixelLetters.forEach((letter) => {
      let currY = this.pos.y;
      let maxX = 0;

      for (let y = 0; y < letter.length; y++) {
        const row = letter[y];

        for (let x = 0; x < row.length; x++) {
          if (!row[x]) continue;

          if (this.shadow) {
            context.fillStyle = SHADOW_COLOR;
            context.fillRect(
              currX + x * this.game.squareSize + SHADOW_OFFSET,
              currY + SHADOW_OFFSET, this.game.squareSize, this.game.squareSize,
            );
          }
          context.fillStyle = this.color;
          context.fillRect(currX + x * this.game.squareSize, currY, this.game.squareSize, this.game.squareSize);
        }

        maxX = Math.max(maxX, row.length * this.game.squareSize);
        currY = this.game.squareSize * (y + 1) + this.pos.y;
      }
      currX += this.game.squareSize + maxX;
    });
  }

  public touched() { return; }

  public move(updatedPos: IPoint) {
    this.pos.x = updatedPos.x;
    this.pos.y = updatedPos.y;
  }

  public resize() {
    this.drawingSize.width = this.size.width * this.game.squareSize;
    this.drawingSize.height = this.size.height * this.game.squareSize;
  }

  private updateSize() {
    // Get the longest row per letter
    const maxValues = this.pixelLetters.map((letter) => Math.max(...letter.map((row) => row.length)));

    // Add up the widths of all the letters + spaces
    const width = maxValues.reduce((total, current) => total += current, 0) + this.pixelLetters.length - 1;

    this.size = { width, height: SQUARE_SIZE };
  }
}
