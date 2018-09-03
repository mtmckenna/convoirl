import { IAnimation, IPoint, IPositionable, TS } from "./common";

import Level from "./levels/level";

function canThingMoveToPosition(thing: IPositionable, position: IPoint, level: Level): boolean {
  const inMap = position.x >= 0 &&
    position.x <= level.size.width - thing.size.width &&
    position.y >= 0 &&
    position.y < level.size.height;

  let { x, y } = position;
  x /= TS;
  y /= TS;

  const { walkable } = level.tilesGrid[y][x];

  return inMap && walkable;
}

function shouldDoAnimation(animation: IAnimation, timestamp: number): boolean {
  if (animation.running) return false;
  const enoughTimeHasPassed = timestamp - animation.startTime > animation.minTimeDelta;
  const lucky = animation.percentChance > Math.random();
  return enoughTimeHasPassed && lucky;
}

function lerp(start, end, t): number {
  return (1 - t) * start + t * end;
}

function clamp(value, min, max): number {
  return Math.max(Math.min(value, max), min);
}

function clerp(start, end, min, max, t): number {
  return clamp(lerp(start, end, t), min, max);
}

function oneOrMinusOne(): number {
  return Math.round(Math.random()) * 2 - 1;
}

function flatten(arrayOfArrays) {
  return [].concat(...arrayOfArrays);
}

function randomElementFromArray(arrayToPullFrom: any[]) {
  return arrayToPullFrom[Math.floor(Math.random() * arrayToPullFrom.length)];
}

function randomIndexFromArray(arrayToPullFrom: any[]) {
  return Math.floor(Math.random() * arrayToPullFrom.length);
}

function twoPhaseClerp(t: number, min: number, max: number, reverse = false): number {
  let start = max;
  let end = min;

  if (reverse) {
    start = min;
    end = max;
  }

  // if in second half of animation
  if (t >= .5) {
    const t2 = (t - .5) / .5;
    return clerp(start, end, min, max, t2);
  // else if in the first half of animation
  } else {
    const t2 = t / .5;
    return clerp(end, start, min, max, t2);
  }
}

function singleColorTileArray(colorIndex) {
  return new Array(TS).fill(null).map(() => new Array(TS).fill(colorIndex));
}

function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

export {
  canThingMoveToPosition,
  clerp,
  throttle,
  flatten,
  lerp,
  oneOrMinusOne,
  randomElementFromArray,
  randomIndexFromArray,
  singleColorTileArray,
  shouldDoAnimation,
  twoPhaseClerp,
};
