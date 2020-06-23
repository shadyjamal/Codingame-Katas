////////////////////////////
// BFS
var findShortestPath = function (startCoordinates, grid, limit, goal) {
  var distanceFromTop = startCoordinates[0];
  var distanceFromLeft = startCoordinates[1];
  let counter = 0;
  var location = {
    distanceFromTop: distanceFromTop,
    distanceFromLeft: distanceFromLeft,
    path: [],
    status: "Start",
  };

  var queue = [location];

  // Loop through the grid searching for the goal
  while (queue.length > 0) {
    // Take the first location off the queue
    var currentLocation = queue.shift();
    var directions = ["Up", "Right", "Down", "Left"];

    for (dir in directions) {
      var newLocation = exploreInDirection(
        currentLocation,
        directions[dir],
        grid,
        distanceFromLeft,
        distanceFromTop,
        goal
      );
      // console.error(
      //   "TEST",
      //   counter,
      //   goal,
      //   distanceFromTop,
      //   distanceFromLeft,
      //   newLocation.path,
      //   newLocation.status
      // );
      if (newLocation.status === goal) {
        return newLocation.path.length;
      } else if (counter === limit) return false;
      else if (newLocation.status === "Valid") {
        queue.push(newLocation);
      }
      counter++;
    }
  }

  return false;
};

var locationStatus = function (location, grid, sizeX, sizeY, goal) {
  var dft = location.distanceFromTop;
  var dfl = location.distanceFromLeft;
  let test = sizeY - 2;
  // console.error('in Location', goal, grid[dft][dfl]);
  if (
    location.distanceFromLeft < 0 ||
    location.distanceFromLeft >= width ||
    location.distanceFromLeft < sizeX - 5 ||
    location.distanceFromLeft > sizeX + 5 ||
    location.distanceFromTop < 0 ||
    location.distanceFromTop >= height ||
    location.distanceFromTop < sizeY - 5 ||
    location.distanceFromTop > sizeY + 5
  ) {
    // location is not on the grid--return false
    return "Invalid";
  } else if (grid[dft][dfl] === goal) {
    return goal;
  } else if (grid[dft][dfl] === "#") {
    // location is either an obstacle or has been visited
    return "Blocked";
  } else {
    return "Valid";
  }
};

var exploreInDirection = function (
  currentLocation,
  direction,
  grid,
  sizeX,
  sizeY,
  goal
) {
  var newPath = currentLocation.path.slice();
  newPath.push(direction);

  var dft = currentLocation.distanceFromTop;
  var dfl = currentLocation.distanceFromLeft;

  if (direction === "Up") {
    dft -= 1;
  } else if (direction === "Right") {
    dfl += 1;
  } else if (direction === "Down") {
    dft += 1;
  } else if (direction === "Left") {
    dfl -= 1;
  }

  var newLocation = {
    distanceFromTop: dft,
    distanceFromLeft: dfl,
    path: newPath,
    status: "Unknown",
  };
  newLocation.status = locationStatus(newLocation, grid, sizeX, sizeY, goal);
  return newLocation;
};