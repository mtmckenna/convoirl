import colorMap from "./colors";
import Game from "./game";
import letters from "./letters";

import {
  IAnimations,
  IFadeable,
  IPoint,
  ISize,
  ITouchable,
  } from "./common";

import { floatText as floatTextAnimation } from "./animations";
import { lerp } from "./helpers";

// Text from https://github.com/PaulBGD/PixelFont
export default class Text implements ITouchable, IFadeable {
  public game: Game;
  public words: string = "";
  public pixelLetters: any[][]; // Why can't I do number[][] without TS errors?
  public size: ISize;
  public drawingSize: ISize = { width: 0, height: 0 };
  public pos: IPoint = { x: 0, y: 0 };
  public color: string;
  public visible: boolean = true;
  public shadow: boolean = true;
  public alpha = 1;

  private animations: IAnimations = {};
  private upToIndex: number = null;

  constructor(game: Game, words: string, color: string = colorMap[1], pos: IPoint = { x: 0, y: 0 }) {
    this.game = game;
    this.words = words.toUpperCase();
    this.upToIndex = this.words.length;
    this.color = color;
    this.move(pos);
    this.pixelLetters = this.words.split("").map((stringLetter) => letters[stringLetter]);
    this.updateSize();

    this.animations.floatText = Object.assign({}, floatTextAnimation);
  }

  public draw(context, timestamp) {
    let currX = this.pos.x;
    const alpha = this.game.transitioning ? Math.min(this.alpha, this.game.transition.nextLevelAlpha) : this.alpha;
    context.globalAlpha = alpha;

    for (let i = 0; i < this.upToIndex; i++) {
      let currY = this.pos.y;
      let maxX = 0;
      const letter = this.pixelLetters[i];

      for (let y = 0; y < letter.length; y++) {
        const row = letter[y];

        for (let x = 0; x < row.length; x++) {
          if (!row[x]) continue;

          if (this.shadow) {
            context.fillStyle = colorMap[0];
            context.fillRect(
              currX + x * this.game.squareSize + 2,
              currY + 2, this.game.squareSize, this.game.squareSize,
            );
          }
          context.fillStyle = this.color;
          context.fillRect(currX + x * this.game.squareSize, currY, this.game.squareSize, this.game.squareSize);
        }

        maxX = Math.max(maxX, row.length * this.game.squareSize);
        currY = this.game.squareSize * (y + 1) + this.pos.y;
      }
      currX += this.game.squareSize + maxX;
    }

    this.updateFloat(timestamp);
  }

  public touched() { return; }

  public move(updatedPos: IPoint) {
    this.pos.x = updatedPos.x;
    this.pos.y = updatedPos.y;
  }

  public showUpToIndex(index: number) {
    this.upToIndex = index;
  }

  public startFloat(updatedPos: IPoint, direction: "left" | "right", goStraightUp = false) {
    let endX = this.game.canvas.width / this.game.squareSize;
    let startX = updatedPos.x;

    if (direction === "left") {
      endX = 0;
      startX = updatedPos.x - this.size.width;
    }

    if (goStraightUp) endX = startX;

    this.animations.floatText.startTime = this.game.timestamp;
    this.animations.floatText.startPos = { x: startX, y: updatedPos.y - this.size.height };
    this.animations.floatText.endPos = { x: endX, y: -10 };
    this.animations.floatText.running = true;
    this.move(this.animations.floatText.startPos);
  }

  public resize() {
    this.drawingSize.width = this.size.width * this.game.squareSize;
    this.drawingSize.height = this.size.height * this.game.squareSize;
  }

  private updateFloat(timestamp) {
    const { floatText } = this.animations;
    if (!floatText.running) return;
    const t = (timestamp - floatText.startTime) / floatText.duration;

    const updatedPos = Object.assign({}, this.pos);
    const x = lerp(floatText.startPos.x, floatText.endPos.x, t);
    updatedPos.x = x + 10 * Math.sin(t * 6 * Math.PI);
    updatedPos.y = lerp(floatText.startPos.y, floatText.endPos.y, t);

    if (t >= 1) floatText.running = false;

    this.alpha = 1 - t;
    this.move(updatedPos);
  }

  private updateSize() {
    // Get the longest row per letter
    const maxValues = this.pixelLetters.map((letter) => Math.max(...letter.map((row) => row.length)));

    // Add up the widths of all the letters + spaces
    const width = maxValues.reduce((total, current) => total += current, 0) + this.pixelLetters.length - 1;

    this.size = { width, height: this.game.squareSize };

    this.drawingSize = {
      height: this.size.height * this.game.squareSize,
      width: this.size.width * this.game.squareSize,
    };
  }
}
