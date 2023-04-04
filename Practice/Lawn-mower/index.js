import { handleInstructions, parseInput } from "./utils.js";

const main = async () => {
  const { lawnDimensions, mowersArray } = (await parseInput()) || {};

  mowersArray.map((mower) => {
    const { x, y, direction, instructions } = mower;

    const { CoordX, CoordY, newDirection } = handleInstructions({
      x,
      y,
      instructions,
      direction,
      lawnDimensions,
    });

    console.log(`${CoordX} ${CoordY} ${newDirection}`);
  });
};

main();
