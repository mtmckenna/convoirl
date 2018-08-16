import Game from "./game";
import letters from "./letters";

import { IDrawable, IPoint, ISize, SQUARE_SIZE } from "./common";

// Text from https://github.com/PaulBGD/PixelFont
export default class Text implements IDrawable {
  public game: Game;
  public words: string = "";
  public pixelLetters: any[][]; // Why can't I do number[][] without TS errors?
  public size: ISize;
  public drawingSize: ISize;
  public pos: IPoint;
  public color: string;
  public visible: boolean = true;

  constructor(game: Game, words: string, color: string = "#ffffff", pos: IPoint = { x: 0, y: 0 }) {
    this.game = game;
    this.words = words.toUpperCase();
    this.color = color;
    this.pos = pos;
    this.pixelLetters = this.words.split("").map((stringLetter) => letters[stringLetter]);
    this.updateSize();
    this.drawingSize = {
      height: this.size.height * this.game.squareSize,
      width: this.size.width * this.game.squareSize,
    };
  }

  public draw(context) {
    context.fillStyle = this.color;
    let currX = this.pos.x;

    this.pixelLetters.forEach((letter) => {
      let currY = this.pos.y;
      let maxX = 0;

      for (let y = 0; y < letter.length; y++) {
        const row = letter[y];

        for (let x = 0; x < row.length; x++) {
          if (!row[x]) continue;
          context.fillRect(currX + x * this.game.squareSize, currY, this.game.squareSize, this.game.squareSize);
        }

        maxX = Math.max(maxX, row.length * this.game.squareSize);
        currY = this.game.squareSize * (y + 1) + this.pos.y;
      }
      currX += this.game.squareSize + maxX;
    });
  }

  public resize() {
    this.drawingSize.width = this.size.width * this.game.squareSize;
    this.drawingSize.height = this.size.height * this.game.squareSize;
  }

  public update() {
    return;
  }

  private updateSize() {
    // Get the longest row per letter
    const maxValues = this.pixelLetters.map((letter) => Math.max(...letter.map((row) => row.length)));

    // Add up the widths of all the letters + spaces
    const width = maxValues.reduce((total, current) => total += current, 0) + this.pixelLetters.length - 1;

    this.size = { width, height: SQUARE_SIZE };
  }
}
