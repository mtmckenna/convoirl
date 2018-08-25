/*
TODO
  - player look left/right
  - house recharges energy
  - animate energy bar
  - make house look nicer
  - add menu on battle
  - npcs can walk around
  - have input keys be an enum
  - have player be an instance on every level
  - gamepad
  - clouds
  - put tinymusic in
  - use diff easing function for level transition
  - add color effects on transition
  - see if the image on transition can scale from the middle?
  - input buffering
  - readme
  - can probably consolidate a lot of the code around walking
  - right side of box is blurry
*/

import Camera from "./camera";
import Game from "./game";
import gameLoopFunction from "./game-loop";

import {
  MS_PER_UPDATE,
  NUM_TILES_ON_LONG_SIDE,
  SQUARE_SIZE,
  TILE_SIZE,
} from "./common";

const gameLoop = gameLoopFunction(MS_PER_UPDATE, update, this);
const canvas: HTMLCanvasElement = document.getElementById("game") as HTMLCanvasElement;

const game: Game = new Game(canvas);
const camera: Camera = new Camera(game);
const sideLength: number = NUM_TILES_ON_LONG_SIDE * TILE_SIZE * SQUARE_SIZE;

let width: number = sideLength;
let height: number = sideLength;
let currentTouch: Touch = null;
let touchDown: boolean = false;

game.camera = camera;

const keyActions = {
  s: camera.shakeScreen.bind(camera),
  t: () => game.queueNextLevel(game.levels.world),
};

function resize() {
  const aspectRatio = window.innerWidth / window.innerHeight;

  if (aspectRatio >= 1.0) {
    width = sideLength;
    height = width / aspectRatio;
  } else {
    height = sideLength;
    width = height * aspectRatio;
  }

  canvas.width = width;
  canvas.height = height;
  camera.size = { width: canvas.width, height: canvas.height };
  game.resize();
}

function update(timestamp: number): void {
  game.update(timestamp);
  camera.move(game.player);
}

function animate(timestamp: number): void {
  game.timestamp = timestamp;
  if (currentTouch && touchDown) game.handleTouch(currentTouch);
  gameLoop(timestamp);
  game.draw(timestamp);
  requestAnimationFrame(animate);
}

function handleTouchDown(event) {
  handleTouchMove(event);
  touchDown = true;
}

function handleTouchMove(event) {
  let touch: MouseEvent | Touch = event;
  if (event.touches) touch = event.changedTouches[0];

  currentTouch = touch as Touch;
}

function handleTouchUp() {
  currentTouch = null;
  touchDown = false;
}

resize();
requestAnimationFrame(animate);

window.addEventListener("resize", () => resize());

window.addEventListener("keydown", (event) => {
  const key = event.key;
  if (keyActions[key]) {
    keyActions[key]();
  } else {
    game.handleInput(key);
  }
});

window.addEventListener("mousedown", handleTouchDown, false);
window.addEventListener("touchstart", handleTouchDown, false);
window.addEventListener("mouseup", handleTouchUp, false);
window.addEventListener("touchend", handleTouchUp, false);
window.addEventListener("mousemove", handleTouchMove, false);
window.addEventListener("touchmove", handleTouchMove, false);

// Prevent iOS scroll bounce
document.body.addEventListener("touchmove", (event) => event.preventDefault(), { passive: false });
