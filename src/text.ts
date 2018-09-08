import Buddy from "./buddy";
import colorMap from "./colors";
import Game from "./game";
import letters from "./letters";

import {
  IAnimation,
  IAnimations,
  IFadeable,
  IPoint,
  ISize,
  ITouchable,
  IUpdateable,
  L_HEIGHT,
  LISTEN,
  } from "./common";

import { lerp } from "./helpers";

// Text from https://github.com/PaulBGD/PixelFont
export default class Text implements ITouchable, IFadeable, IUpdateable {
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
  public buddy?: Buddy = null;

  public animations: IAnimations = {};
  private upToIndex: number = null;

  constructor(game: Game, words: string, color: string = colorMap[1], pos: IPoint = { x: 0, y: 0 }) {
    this.game = game;
    this.words = words.toUpperCase();
    this.upToIndex = this.words.length;
    this.color = color;
    this.move(pos);
    this.pixelLetters = this.words.split("").map((stringLetter) => letters[stringLetter]);
    this.updateSize();

    const floatText: IAnimation = {
      duration: 3000,
      endPos: { x: 0, y: 0 },
      running: false,
      startPos: { x: 0, y: 0 },
      startTime: 0,
    };

    this.animations.floatText = floatText;
  }

  public draw(context, timestamp) {
    let currX = this.pos.x;
    const alpha = this.game.transitioning() ? Math.min(this.alpha, this.game.transition.nextLevelAlpha) : this.alpha;
    const shadowOffset = Math.floor(this.game.ss / 2);
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
              currX + x * this.game.ss + shadowOffset,
              currY + shadowOffset, this.game.ss, this.game.ss,
            );
          }
          context.fillStyle = this.color;
          context.fillRect(currX + x * this.game.ss, currY, this.game.ss, this.game.ss);
        }

        maxX = Math.max(maxX, row.length * this.game.ss);
        currY = this.game.ss * (y + 1) + this.pos.y;
      }
      currX += this.game.ss + maxX;
    }

    this.updateFloat(timestamp);
  }

  public touched() { return; }

  public move(updatedPos: IPoint) {
    this.pos.x = Math.floor(updatedPos.x);
    this.pos.y = Math.floor(updatedPos.y);
  }

  public showUpToIndex(index: number) {
    this.upToIndex = index;
  }

  public startFloat(startPos: IPoint, endPos: IPoint) {
    this.animations.floatText.startTime = this.game.timestamp;
    this.animations.floatText.startPos = { x: startPos.x, y: startPos.y - this.size.height };
    this.animations.floatText.endPos = { x: endPos.x, y: endPos.y };
    this.animations.floatText.running = true;
    this.move(this.animations.floatText.startPos);
  }

  public update(timestamp) {
    this.updateFloat(timestamp);
  }

  private updateFloat(timestamp) {
    const { floatText } = this.animations;
    if (!floatText.running) return;
    const t = (timestamp - floatText.startTime) / floatText.duration;

    let x = lerp(floatText.startPos.x, floatText.endPos.x, t);

    // If listening, go straight up; otherwise, zigzag
    if (this.words !== LISTEN) x += 10 * Math.sin((t) * 6 * Math.PI);

    const y = lerp(floatText.startPos.y, floatText.endPos.y, t);

    if (t >= 1) floatText.running = false;

    this.alpha = 1 - t;
    this.move({ x, y });
  }

  private updateSize() {
    // Get the longest row per letter
    const maxValues = this.pixelLetters.map((letter) => Math.max(...letter.map((row) => row.length)));

    // Add up the widths of all the letters + spaces
    const width = maxValues.reduce((total, current) => total += current, 0) + this.pixelLetters.length - 1;

    this.size = { width, height: L_HEIGHT };

    this.drawingSize = {
      height: this.size.height * this.game.ss,
      width: this.size.width * this.game.ss,
    };
  }
}
