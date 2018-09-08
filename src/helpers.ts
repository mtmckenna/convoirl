function lerp(start, end, t): number {
  return (1 - t) * start + t * end;
}

function clamp(value, min, max): number {
  return Math.max(Math.min(value, max), min);
}

function clerp(start, end, min, max, t): number {
  return clamp(lerp(start, end, t), min, max);
}

function flatten(arrayOfArrays) {
  return [].concat(...arrayOfArrays);
}

function randomIndex(arrayToPullFrom: any[]) {
  return Math.floor(Math.random() * arrayToPullFrom.length);
}

function removeElement(element, arrayToRemoveFrom: any[]): boolean {
  const index = arrayToRemoveFrom.indexOf(element);

  if (index > -1) {
    arrayToRemoveFrom.splice(index, 1);
    return true;
  }

  return false;
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
  clamp,
  clerp,
  throttle,
  flatten,
  lerp,
  randomIndex,
  removeElement,
};
