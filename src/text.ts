import colorMap from "./colors";
import Game from "./game";
import letters from "./letters";

import {
  IAnimations,
  IPoint,
  ISize,
  ITouchable,
  } from "./common";

import { floatText as floatTextAnimation } from "./animations";
import { lerp } from "./helpers";

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

  private animations: IAnimations = {};

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

    this.animations.floatText = Object.assign({}, floatTextAnimation);
  }

  public draw(context, timestamp) {
    let currX = this.pos.x;
    const alpha = this.game.transitioning ? Math.min(this.alpha, this.game.transition.nextLevelAlpha) : this.alpha;
    context.globalAlpha = alpha;

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

    this.updateFloat(timestamp);
  }

  public touched() { return; }

  public move(updatedPos: IPoint) {
    this.pos.x = updatedPos.x;
    this.pos.y = updatedPos.y;
  }

  public startFloat(updatedPos: IPoint) {
    this.move(updatedPos);
    this.animations.floatText.startTime = this.game.timestamp;
    this.animations.floatText.startPos = Object.assign({}, updatedPos);
    this.animations.floatText.endPos = { x: updatedPos.x, y: -10 };
    this.animations.floatText.running = true;
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
    updatedPos.x = this.pos.x + t * Math.sin(t * 6 * Math.PI);
    updatedPos.y = lerp(floatText.startPos.y, floatText.endPos.y, t);

    if (t >= 1.0) floatText.running = false;

    this.alpha = 1 - t;
    this.move(updatedPos);
  }

  private updateSize() {
    // Get the longest row per letter
    const maxValues = this.pixelLetters.map((letter) => Math.max(...letter.map((row) => row.length)));

    // Add up the widths of all the letters + spaces
    const width = maxValues.reduce((total, current) => total += current, 0) + this.pixelLetters.length - 1;

    this.size = { width, height: this.game.squareSize };
  }
}
