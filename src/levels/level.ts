import colorMap from "../colors";
import Game from "../game";
import Tile from "../tiles/tile";

import {
  IDrawable,
  IInteractable,
  ISize,
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
  public dables: IDrawable[][]; // drawables
  public odables: IDrawable[]; // overlay drawables
  public uables: IUpdateable[]; // updateables
  public bgColor: string = colorMap[2];
  public state: string;

  protected tileIndexes: number[][];
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
    this.dables = new Array(4).fill(null).map(() => new Array().fill(null));
    this.odables = [];
    this.uables = [];
  }

  public configClouds(width, height, alpha) {
    this.clouds = [];
    for (let i = 0; i < 20; i++) {
      const cloud = (new Tile(this.game, "cloud", 0, 0));
      cloud.pos.x = randomNumBetween(0, width);
      cloud.pos.y = randomNumBetween(0, height);
      cloud.speed = randomNumBetween(.2, 1.0);
      cloud.alpha = alpha;
      cloud.lWidth = width;
      this.clouds.push(cloud);
    }
  }

  protected generateTiles() {
    const w = this.tileIndexes[0].length * TS;
    const h = this.tileIndexes.length * TS;

    this.size = { w, h };
    this.dSize = { w: w * this.game.ss, h: h * this.game.ss };

    for (let i = 0; i < this.tileIndexes.length; i++) {
      this.tilesGrid.push(new Array(this.tileIndexes[i].length));
      for (let j = 0; j < this.tileIndexes[i].length; j++) {
        const tileType = this.tileTypeMap[this.tileIndexes[i][j] || 0];
        this.tilesGrid[i][j] = new Tile(this.game, tileType, j, i);
      }
    }

    this.tiles = flatten(this.tilesGrid);
  }

  protected addDables(drawables: IDrawable[], zIndex: number) {
    this.dables[zIndex].push(...drawables);
  }

  protected addOdables(drawables: IDrawable[]) {
    this.odables.push(...drawables);
  }

  protected addUables(updateables: IUpdateable[]) {
    this.uables.push(...updateables);
  }
}

function randomNumBetween(min, max): number {
  return Math.random() * (max - min) + min;
}
