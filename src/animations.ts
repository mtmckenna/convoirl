import { IAnimation } from "./common";

const blinking: IAnimation = {
  duration: 300,
  minTimeDelta: 3000,
  openness: 1,
  percentChance: .5,
  running: false,
  startTime: 0,
};

const lookAway: IAnimation = {
  duration: 0,
  minTimeDelta: 1000,
  offset: 0,
  percentChance: .008,
  running: false,
  startTime: 0,
};

const walking: IAnimation = {
  duration: 250,
  endPos: { x: 0, y: 0 },
  running: false,
  startPos: { x: 0, y: 0 },
  startTime: 0,
  t: 0,
};

const animateEnergy: IAnimation = {
  duration: 1000,
  endLevel: 0,
  running: false,
  startLevel: 0,
  startTime: 0,
};

const transition: IAnimation = {
  duration: 1000,
  nextLevelAlpha: 0,
  prevLevelAlpha: 1,
  prevLevelScale: 1,
  running: false,
  startTime: 0,
};

const floatText: IAnimation = {
  duration: 1500,
  endPos: { x: 0, y: 0 },
  running: false,
  startPos: { x: 0, y: 0 },
  startTime: 0,
};

export {
  animateEnergy,
  blinking,
  floatText,
  lookAway,
  transition,
  walking,
};
