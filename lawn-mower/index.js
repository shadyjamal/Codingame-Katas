import { handleInstructions, parseInput, readTxtFile } from "./utils.js";

export const lawnMower = async (input) => {
  const { lawnDimensions, mowersArray } = (await parseInput(input)) || {};

  let output = [];

  mowersArray.map((mower) => {
    const { x, y, direction, instructions } = mower;

    const { CoordX, CoordY, newDirection } = handleInstructions({
      x,
      y,
      instructions,
      direction,
      lawnDimensions,
    });

    output.push(`${CoordX} ${CoordY} ${newDirection}`);
  });

  return output.toString();
};

const main = async () => {
  // read the input txt file and
  const inputArr = await readTxtFile("./input.txt");

  const result = await lawnMower(inputArr);

  //console.log(result)
};

main();
