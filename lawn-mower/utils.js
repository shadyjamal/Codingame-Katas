import { readFile } from "node:fs/promises";

const LAWN_LOWER_X = 0;
const LAWN_LOWER_Y = 0;

export const readTxtFile = async (filePath) => {
  try {
    const txt = await readFile(filePath, { encoding: "utf8" });
    return txt.split(/\r?\n/);
  } catch (err) {
    console.error(err.message);
  }
};

export const parseInput = async (input) => {
  const mowersArray = [];

  const lawnDimensions = input?.[0]?.split(" ");

  for (var i = 1; i < input.length; i += 2) {
    const coords = input[i].split(" ");

    const instructions = input?.[i + 1].split("");

    mowersArray.push({
      x: parseInt(coords?.[0]),
      y: parseInt(coords?.[1]),
      direction: coords?.[2],
      instructions,
    });
  }
  return {
    lawnDimensions,
    mowersArray,
  };
};

const directionStep = {
  x: {
    N: 0,
    S: 0,
    E: 1,
    W: -1,
  },
  y: {
    N: 1,
    S: -1,
    E: 0,
    W: 0,
  },
};

const directions = ["N", "E", "S", "W"];

// turn Left is equivalent to decrement one index in directions array
const handleLeft = (directionIndex) =>
  (directionIndex + directions.length - 1) % directions.length;

// turn right is equivalent to increment one index in directions array
const handleRight = (directionIndex) =>
  (directionIndex + 1) % directions.length;

const handleMove = (x, y, directionIndex, lawnDimensions) => {
  const mowerDirection = directions[directionIndex];

  const lawn_Upper_X = parseInt(lawnDimensions[0]);
  const lawn_Upper_Y = parseInt(lawnDimensions[1]);

  // Force the new Mower coords to be within the lower and upper bound of the lawn
  const newX = Math.min(
    Math.max(x + directionStep.x[mowerDirection], LAWN_LOWER_X),
    lawn_Upper_X
  );

  const newY = Math.min(
    Math.max(y + directionStep.y[mowerDirection], LAWN_LOWER_Y),
    lawn_Upper_Y
  );

  return {
    newX,
    newY,
  };
};

export const handleInstructions = ({
  x,
  y,
  instructions,
  direction,
  lawnDimensions,
}) => {
  let currentDirectionIndex = directions.findIndex((e) => e === direction);
  let CoordX = x;
  let CoordY = y;

  for (var j = 0; j < instructions.length; j++) {
    switch (instructions[j]) {
      case "L":
        currentDirectionIndex = handleLeft(currentDirectionIndex);
        break;
      case "R":
        currentDirectionIndex = handleRight(currentDirectionIndex);
        break;
      case "M":
        const { newX, newY } = handleMove(
          CoordX,
          CoordY,
          currentDirectionIndex,
          lawnDimensions
        );

        CoordX = newX;
        CoordY = newY;
        break;
      default:
    }
  }
  return {
    CoordX,
    CoordY,
    newDirection: directions[currentDirectionIndex],
  };
};
