import { MS_PER_UPDATE } from "./common";

const MAX_LAG = MS_PER_UPDATE * 10;

export default function(frameRate: number, gameLogicFunction: (timestamp: number) => void, context: any) {
  let lag = 0;
  let previousTimestamp = 0;

  return (timestamp: number) => {
    lag += Math.min(timestamp - previousTimestamp, MAX_LAG);
    previousTimestamp = timestamp;

    while (lag >= frameRate) {
      gameLogicFunction.call(context, timestamp);
      lag -= frameRate;
    }
  };
}
