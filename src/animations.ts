import { IAnimation } from "./common";

const blinking: IAnimation = {
  duration: 300.0,
  minTimeDelta: 3000.0,
  openness: 1.0,
  percentChance: 0.5,
  running: false,
  startTime: 0,
};

const lookAway: IAnimation = {
  duration: 0.0,
  minTimeDelta: 1000.0,
  offset: 0,
  percentChance: 0.008,
  running: false,
  startTime: 0,
};

const walking: IAnimation = {
  duration: 300.0,
  endPos: { x: 0, y: 0 },
  running: false,
  startTime: 0,
};

const transition: IAnimation = {
  duration: 1500.0,
  nextLevelAlpha: 0.0,
  prevLevelAlpha: 1.0,
  prevLevelScale: 1.0,
  running: false,
  startTime: 0.0,
};

export { blinking, lookAway, transition, walking };
