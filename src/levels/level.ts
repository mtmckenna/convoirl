import colorMap from "../colors";
import Game from "../game";
import Tile from "../tiles/tile";

import {
  IDrawable,
  IInteractable,
  IPoint,
  ISize,
  ITouchable,
  IUpdateable,
  TS,
 } from "../common";

import { flatten, randomIndex } from "../helpers";

export default abstract class Level {
  public game: Game;

  public size: ISize;
  public dSize: ISize;

  public tiles: Tile[];
  public tilesGrid: Tile[][] = [];

  public dables: IDrawable[][];
  public odables: IDrawable[];
  public uables: IUpdateable[];
  public iables: IInteractable[];
  public tables: ITouchable[];
  public bgColor: string = colorMap[2];
  public state: string;

  protected  tileIndexes: number[][];
  protected clouds: Tile[] = [];
  protected abstract tileTypeMap: string[];

  constructor(game: Game) {
    this.game = game;
  }

  public abstract resize();
  public abstract handleInput(key: string);
  public abstract handleTouch(touch: Touch);

  public levelWillStart() { return; }
  public levelStarted() { return; }

  public update(timestamp: number) {
    this.uables.forEach((updateable) => updateable.update(timestamp));
    this.clouds.forEach((c) => c.moveleft());
  }

  public configViz() {
    this.clearDrawables();
    this.clearOverlayDrawables();
    this.clearUpdateables();
    this.clearInteractables();
    this.clearTouchables();
  }

  public tileAtIndex(tileIndex: IPoint) {
    return this.tilesGrid[tileIndex.y][tileIndex.x];
  }

  public configClouds(width, height) {
    this.clouds = [];
    for (let i = 0; i < 20; i++) {
      const cloud = (new Tile(this.game, "cloud", 0, 0));
      cloud.pos.x = randomNumBetween(0, width);
      cloud.pos.y = randomNumBetween(0, height);
      cloud.speed = randomNumBetween(.2, 1.0);
      cloud.alpha = .8;
      cloud.lWidth = width;
      this.clouds.push(cloud);
    }
  }

  protected generateTiles() {
    const width = this.tileIndexes[0].length * TS;
    const height = this.tileIndexes.length * TS;

    this.size = { width, height };
    this.dSize = { width: width * this.game.ss, height: height * this.game.ss };

    for (let i = 0; i < this.tileIndexes.length; i++) {
      this.tilesGrid.push(new Array(this.tileIndexes[i].length));
      for (let j = 0; j < this.tileIndexes[i].length; j++) {
        const tileType = this.tileTypeMap[this.tileIndexes[i][j] || 0];
        this.tilesGrid[i][j] = new Tile(this.game, tileType, j, i);
      }
    }

    this.tiles = flatten(this.tilesGrid);
  }

  protected addDrawables(drawables: IDrawable[], zIndex: number) {
    this.dables[zIndex].push(...drawables);
  }

  protected addOverlayDrawables(drawables: IDrawable[]) {
    this.odables.push(...drawables);
  }

  protected addUpdateables(updateables: IUpdateable[]) {
    this.uables.push(...updateables);
  }

  protected addTouchables(touchables: ITouchable[]) {
    this.tables.push(...touchables);
  }

  protected addInteractables(interactables: IInteractable[]) {
    this.iables.push(...interactables);
  }

  protected clearDrawables() {
    this.dables = new Array(4).fill(null).map(() => new Array().fill(null));
  }

  protected clearOverlayDrawables() {
    this.odables = [];
  }

  protected clearUpdateables() {
    this.uables = [];
  }

  protected clearInteractables() {
    this.iables = [];
  }

  protected clearTouchables() {
    this.tables = [];
  }

  protected generateTileIndexes(sizeInTiles?: ISize) {
    // The tiles should fit the screen size since we don't scroll in convo
    sizeInTiles = sizeInTiles || this.game.sizeInTiles();

    this.tileIndexes = new Array(sizeInTiles.height)
      .fill(null).map(() => new Array(sizeInTiles.width)
        .fill(null).map(() => randomIndex(this.tileTypeMap)));
  }

  protected touchedTouchable(touch: Touch): ITouchable {
    const fuzz = 20 * this.game.scaleFactor;

    const touched = this.tables.find((touchable) => {
      const size = Object.assign({}, touchable.dSize);
      const pos = Object.assign({}, touchable.pos);
      size.width *= this.game.scaleFactor;
      size.height *= this.game.scaleFactor;
      pos.x *= this.game.scaleFactor;
      pos.y *= this.game.scaleFactor;

      return touch.clientX + fuzz >= pos.x &&
      touch.clientX - fuzz <= pos.x + size.width &&
      touch.clientY + fuzz >= pos.y &&
      touch.clientY - fuzz <= pos.y + size.height;
    });

    if (touched && touched.visible) return touched;
  }
}

function randomNumBetween(min, max): number {
  return Math.random() * (max - min) + min;
}
