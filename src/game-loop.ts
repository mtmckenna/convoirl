import { MS_PER } from "./common";

export default function(frameRate: number, gameLogicFunction: (timestamp: number) => void, context: any) {
  let lag = 0;
  let previousTimestamp = 0;

  return (timestamp: number) => {
    lag += Math.min(timestamp - previousTimestamp, MS_PER * 10);
    previousTimestamp = timestamp;

    while (lag >= frameRate) {
      gameLogicFunction.call(context, timestamp);
      lag -= frameRate;
    }
  };
}
