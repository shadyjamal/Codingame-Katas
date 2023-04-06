import { lawnMower } from "./index.js";

test("one mower in a lawn with 3,4 dimesion", async () => {
  expect(lawnMower(["3 4", "0 0 N", "MMMRMM"])).resolves.toBe("2 3 E");
});

test("two mowers in a square lawn (5,5 dimesion)", async () => {
  expect(
    lawnMower(["5 5", "1 2 N", "LMLMLMLMM", "3 3 E", "MMRMMRMRRM"])
  ).resolves.toBe("1 3 N,5 1 E");
});

test("one mower in a square lawn (2,2 dimesion), test the border limit", async () => {
  expect(lawnMower(["2 2", "0 0 N", "MMRMMRMMRMMR"])).resolves.toBe("0 0 N");
});

test("one mower in a lawn with 2,3 dimesions, test the border limit", async () => {
  expect(lawnMower(["2 3", "0 0 E", "MMMLMMMLMMMLMMML"])).resolves.toBe(
    "0 0 E"
  );
});
