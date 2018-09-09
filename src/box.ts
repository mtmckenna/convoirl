import colorMap from "./colors";
import Game from "./game";
import Text from "./text";

import {
  IFadeable,
  IPoint,
  ISize,
  ITouchable,
  L_HEIGHT,
  L_SPACE,
 } from "./common";

export default class Box implements IFadeable {
  public game: Game;
  public pos: IPoint;
  public size: ISize;
  public dSize: ISize;
  public visible: boolean = true;
  public alpha = 1;

  private strokePos: IPoint;
  private color: string;
  private texts: Text[] = [];
  private startTime: number = null;

  constructor(game: Game, pos: IPoint, size: ISize, color: string = colorMap[8]) {
    this.game = game;
    this.pos = pos;
    this.strokePos = pos;
    this.color = color;
    this.updateSize(size);
    this.move(pos);
  }

  get textLength() {
    return this.texts.reduce((prev, text) => prev + text.words.length, 0);
  }

  public move(updatedPos: IPoint) {
    this.pos.x = updatedPos.x;
    this.pos.y = updatedPos.y;

    // tslint:disable-next-line
    // https://stackoverflow.com/questions/28057881/javascript-either-strokerect-or-fillrect-blurry-depending-on-translation
    this.strokePos.x = Math.floor(this.pos.x) + .5;
    this.strokePos.y = Math.floor(this.pos.y) + .5;
    moveTexts.call(this);
  }

  public updateSize(updatedSize: ISize) {
    this.size = { h: updatedSize.h, w: updatedSize.w };
    this.dSize = {
      h: this.size.h * this.game.ss,
      w: this.size.w * this.game.ss,
    };
  }

  public draw(context, timestamp) {
    const alpha = this.game.transitioning() ? Math.min(this.alpha, this.game.transition.nextLevelAlpha) : this.alpha;
    context.globalAlpha = alpha;
    context.fillStyle = this.color;
    context.fillRect(this.pos.x, this.pos.y, this.dSize.w, this.dSize.h);
    context.strokeStyle = colorMap[1];
    context.fillStyle = colorMap[1];
    context.lineWidth = this.game.ss;
    context.strokeRect(this.strokePos.x, this.strokePos.y, this.dSize.w, this.dSize.h);

    let indexes = new Array(this.texts.length).fill(0);

    if (this.startTime) {
      // TODO: gotta be a simpler way of doing the animation here
      const showUpToIndex = Math.min(Math.floor((timestamp - this.startTime) / 50), this.textLength);
      indexes = this.texts.map((text, i) => {
        // Add up lengths of previous texts
        const prevSum = this.texts.slice(0, i).reduce((prev, toCount) => toCount.words.length + prev, 0);
        return Math.min(showUpToIndex - prevSum, text.words.length);
      });
    }

    this.texts.forEach((text, i) => {
      // Animate text in
      text.showUpToIndex(indexes[i]);
      text.draw(context, timestamp);
    });
  }

  public setWords(words: string[]) {
    this.texts = words.map((word) => new Text(this.game, word));
    moveTexts.call(this);
  }

  public animateTextIn(time: number) {
    this.startTime = time;
  }
}

function moveTexts() {
  if (!this.texts.length) return;
  const drawingLineSize = L_SPACE * this.game.ss;
  const drawingLetterSize = L_HEIGHT * this.game.ss;
  const numLines = this.texts.length;

  // TODO: Why minus -2???
  const textHeight = numLines * drawingLetterSize + (numLines - 2) * drawingLineSize;
  this.texts.forEach((text, index) => {
    const x = this.pos.x + this.game.ss * (this.size.w - text.size.w) / 2;
    const y = this.pos.y + (this.dSize.h - textHeight) / 2 + drawingLineSize * index;
    text.move({ x, y });
  });
}
