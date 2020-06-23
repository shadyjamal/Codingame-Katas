var inputs = readline().split(" ");
const width = parseInt(inputs[0]); // size of the grid
const height = parseInt(inputs[1]);
let flag = 0;
let pacInfo = [];
let pacEnemy = [];
let oldCoords = {};
let oldEnemyCoords = {};
let tabMap = [];

let allPellets = {};
let pelletsV10 = [];

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
    location.distanceFromTop < 0 ||
    location.distanceFromTop >= height
  ) {
    // location is not on the grid--return false
    return "Invalid";
  } else if (grid[dft][dfl] === goal) {
    return goal;
  } else if (grid[dft][dfl] !== " ") {
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
  const visited = String.fromCharCode(64);
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

  if (newLocation.status === "Valid") {
    grid[newLocation.distanceFromTop] = setCharAt(
      grid[newLocation.distanceFromTop],
      newLocation.distanceFromLeft,
      visited
    );
  }
  return newLocation;
};

////////////////////////////////////////////////////////////////////////////
// GET MAP
for (let i = 0; i < height; i++) {
  const row = readline(); // one line of the grid: space " " is floor, pound "#" is wall
  tabMap[i] = row;
}
let copyTabMap = [...tabMap];

////////////////////////////////////////////////////////////////////////////
// Set All Pellets
for (let i = 0; i < height; i++) {
  for (let j = 0; j < width; j++) {
    if (tabMap[i][j] !== "#") {
      // tabMap[`${i}`] = setCharAt(tabMap[`${i}`], j, "o");
      allPellets[`${j},${i}`] = {
        x: j,
        y: i,
        value: 1,
        closestPacId: [],
        distance: [],
      };
    }
  }
}

////////////////////////////////////////////////////////////////////////////
// Functions
const storePac = (
  pacArray,
  pacId,
  x,
  y,
  typeId,
  speedTurnsLeft,
  abilityCooldown,
  oldCoords
) => {
  pacArray.push({
    pacId: pacId,
    xpac: x,
    ypac: y,
    typeId: typeId,
    speedTurnsLeft: speedTurnsLeft,
    abilityCooldown: abilityCooldown,
    oldx: oldCoords && oldCoords.oldx ? oldCoords.oldx : x,
    oldy: oldCoords && oldCoords.oldy ? oldCoords.oldy : y,
    xdest: oldCoords && oldCoords.xdest ? oldCoords.xdest : 0,
    ydest: oldCoords && oldCoords.ydest ? oldCoords.ydest : 0,
    count: oldCoords && oldCoords.count ? oldCoords.count : 0,
    changedir: oldCoords && oldCoords.changedir ? oldCoords.changedir : false,
    targetCounter:
      oldCoords && oldCoords.targetCounter ? oldCoords.targetCounter : 0,
    targetedPellet:
      oldCoords && oldCoords.targetedPellet ? oldCoords.targetedPellet : null,
    move: true,
    switch: null,
    speed: null,
    canMovePellets: null,
    stopped: oldCoords && oldCoords.stopped ? oldCoords.stopped : false,
  });
};

const getClosestEnemy = (pacCoords, xPac, yPac) => {
  let oldcount = width + height;
  let target;
  for (let key in pacCoords) {
    let newcount =
      Math.abs(xPac - pacCoords[key].xpac) +
      Math.abs(yPac - pacCoords[key].ypac);
    if (newcount < oldcount) {
      target = key;
      oldcount = newcount;
    }
  }
  if (oldcount <= 4) return { target: target, distance: oldcount };
  else return null;
};

const multiPush = (arr, times, val) => {
  for (let i = 0; i < times; i++) {
    arr.push(val);
  }
};

const getarroundPelletTab = (
  singlePac,
  pelletTab,
  pellets,
  possibleTargets,
  pelletOrigin,
  limitedPellets
) => {
  let xarround;
  let yarround;
  let pelletIndex;
  let pelletKeys = Object.keys(pellets);
  let keyToAvoid = Object.keys(possibleTargets);
  let tabPelletsArround = [];
  let potentialPellet = null;
  let hasV10 = false;

  for (var pKey in pelletTab) {
    if ((singlePellet = pellets[pelletTab[pKey]])) {
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          if ((i !== 0 || j !== 0) && (i === 0 || j === 0)) {
            if (
              (singlePellet.x === 0 && i === -1) ||
              (singlePellet.x === width - 1 && i === 1)
            )
              xarround = width - 1 - singlePellet.x;
            else xarround = singlePellet.x + i;
            yarround = singlePellet.y + j;
            potentialPellet = `${xarround},${yarround}`;
            if (
              keyToAvoid.indexOf(potentialPellet) === -1 &&
              pelletTab.indexOf(potentialPellet) === -1 &&
              tabPelletsArround.indexOf(potentialPellet) === -1 &&
              potentialPellet !== pelletOrigin &&
              (pelletIndex = pelletKeys.indexOf(potentialPellet)) > -1 &&
              (!limitedPellets || limitedPellets[pelletKeys[pelletIndex]]) &&
              (pellets[pelletKeys[pelletIndex]].closestPacId.length === 0 ||
                pellets[pelletKeys[pelletIndex]].closestPacId[0] ===
                  `${singlePac.pacId}`)
            ) {
              if (
                pellets[pelletKeys[pelletIndex]].closestPacId.length === 0 ||
                pellets[pelletKeys[pelletIndex]].closestPacId[0] ===
                  `${singlePac.pacId}`
              ) {
                if (pellets[pelletKeys[pelletIndex]].value === 10)
                  hasV10 = true;
                multiPush(
                  tabPelletsArround,
                  pellets[pelletKeys[pelletIndex]].value,
                  `${pelletKeys[pelletIndex]}`
                );
              }
            }
          }
        }
      }
    }
  }
  return { tab: tabPelletsArround, hasV10: hasV10 };
};

const arroundPelletFirstCheck = (
  singlePac,
  singlePellet,
  pellets,
  limitedPellets
) => {
  let xarround;
  let yarround;
  let pelletKey;
  let pelletKeys = Object.keys(pellets);
  let pelletsArround = {};
  let hasV10Obj = {};
  let ratioV10 = {};

  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if ((i !== 0 || j !== 0) && (i === 0 || j === 0)) {
        if (
          (singlePellet.x === 0 && i === -1) ||
          (singlePellet.x === width - 1 && i === 1)
        )
          xarround = width - 1 - singlePellet.x;
        else xarround = singlePellet.x + i;

        yarround = singlePellet.y + j;
        if (
          (pelletKey = pelletKeys.indexOf(`${xarround},${yarround}`)) > -1 &&
          (!limitedPellets || limitedPellets[pelletKeys[pelletKey]]) &&
          (pellets[pelletKeys[pelletKey]].closestPacId.length === 0 ||
            pellets[pelletKeys[pelletKey]].closestPacId[0] ===
              `${singlePac.pacId}`)
        ) {
          let newArray = [];
          multiPush(
            newArray,
            pellets[pelletKeys[pelletKey]].value,
            `${pelletKeys[pelletKey]}`
          );
          pelletsArround[`${pelletKeys[pelletKey]}`] = newArray;
          if (pellets[pelletKeys[pelletKey]].value === 10) {
            hasV10Obj[`${pelletKeys[pelletKey]}`] = true;
            ratioV10[`${pelletKeys[pelletKey]}`] = 2;
          } else {
            hasV10Obj[`${pelletKeys[pelletKey]}`] = false;
            ratioV10[`${pelletKeys[pelletKey]}`] = 1;
          }
        }
      }
    }
  }

  return {
    pelletsObj: pelletsArround,
    hasV10Obj: hasV10Obj,
    ratioV10: ratioV10,
  };
};

const optimalDirection = (
  pInd,
  pellets,
  singlePac,
  pelletsToEdit,
  limitedPellets
) => {
  let coeff = 20;
  let counterObj = {};
  let hasV10Obj = {};
  let ratioV10Obj = {};
  let hasV10 = false;
  let ratioV10 = 0;
  let sumCounts = pelletsToEdit[pInd].value;
  let limit = 0;
  let bestChoice = {
    key: null,
    count: 0,
  };
  let firstResult = arroundPelletFirstCheck(
    singlePac,
    pelletsToEdit[pInd],
    pellets,
    limitedPellets
  );

  possibleTargets = firstResult.pelletsObj;
  hasV10Obj = firstResult.hasV10Obj;
  ratioV10Obj = firstResult.ratioV10;
  const key = Object.keys(possibleTargets);
  // console.error("optimalDirection FOR ", singlePac.pacId);
  // console.error(
  //   "optimalDirection OF ",
  //   pInd,
  //   possibleTargets,
  //   hasV10Obj, ratioV10Obj
  // );
  if (key.length === 0) {
    // console.error("RESULT", pInd, sumCounts);
    if (pellets[pInd].value === 10) {
      hasV10 = true;
      ratioV10 = 2;
    }
    return {
      pelletKey: pInd,
      count: sumCounts,
      tabTargets: [],
      hasV10: hasV10,
      ratioV10: ratioV10,
    };
  }

  while (limit <= 10) {
    for (var [pelletInd, pelletKeyTab] of Object.entries(possibleTargets)) {
      let result = getarroundPelletTab(
        singlePac,
        pelletKeyTab,
        pellets,
        possibleTargets,
        pInd,
        limitedPellets
      );
      if (hasV10Obj[pelletInd] === false) {
        ratioV10Obj[pelletInd] = (coeff - limit * 2) / coeff;
        hasV10Obj[pelletInd] = result.hasV10;
        if (hasV10Obj[pelletInd] && limit === 0) ratioV10Obj[pelletInd] = 2;
      }
      if (!hasV10) hasV10 = hasV10Obj[pelletInd];
      possibleTargets[pelletInd] = possibleTargets[pelletInd].concat(
        result.tab
      );
      counterObj[`${pelletInd}`] = possibleTargets[pelletInd]
        ? possibleTargets[pelletInd].length
        : 0;

      if (
        (hasV10 === false && counterObj[`${pelletInd}`] > bestChoice.count) ||
        !bestChoice.key ||
        (hasV10 === true &&
          hasV10Obj[bestChoice.key] === true &&
          counterObj[`${pelletInd}`] * ratioV10Obj[pelletInd] >
            bestChoice.count * ratioV10Obj[bestChoice.key]) ||
        (hasV10 === true &&
          hasV10Obj[bestChoice.key] === false &&
          counterObj[`${pelletInd}`] >
            bestChoice.count * ratioV10Obj[bestChoice.key])
      ) {
        bestChoice.count = counterObj[`${pelletInd}`];
        bestChoice.key = pelletInd;
      }
    }
    // console.error('Ratio V10',counterObj, ratioV10Obj );
    limit++;
  }
  sumCounts += possibleTargets[bestChoice.key]
    ? possibleTargets[bestChoice.key].length
    : 0;

  ratioV10 =
    ratioV10Obj[bestChoice.key] === 1 ? 2 : ratioV10Obj[bestChoice.key];
  ratioV10 =
    ratioV10Obj[bestChoice.key] <= 0 ? 0.15 : ratioV10Obj[bestChoice.key];
  if (pellets[pInd].value === 10) {
    hasV10 = true;
    ratioV10 = 2;
  }

  // console.error(
  //   "optimalDirection RESULT",
  //   bestChoice.key,
  //   sumCounts,
  //   hasV10,
  //   ratioV10Obj[bestChoice.key]
  // );
  return {
    pelletKey: bestChoice.key,
    count: sumCounts,
    tabTargets: possibleTargets[bestChoice.key],
    hasV10: hasV10,
    ratioV10: ratioV10,
  };
};

function setCharAt(str, index, chr) {
  if (index > str.length - 1) return str;
  return str.substr(0, index) + chr + str.substr(index + 1);
}

const filterPellet = (pellets, indextoFilter, pelletKeys) => {
  for (var key of pelletKeys) {
    pellets[key].distance.splice(indextoFilter, 1);
    pellets[key].closestPacId.splice(indextoFilter, 1);
  }
};

const closestPellets = (singlePac, allPellets, limitedPellets) => {
  let ascii = 0;
  let xarround;
  let yarround;
  let distance = 0;
  let potentialPellet = null;
  let allPelletsKeys = Object.keys(allPellets);
  let mainTab = [];
  let tabRes = [];
  let realcount;
  let counterTobreak = 1;
  let j;
  let keySafe = [];
  let pelletsHolder = {};

  while (distance < width && counterTobreak) {
    if (mainTab.length !== 0) counterTobreak--;
    distance++;
    // console.error("Distance", singlePac.pacId, distance);
    for (let i = -distance; i <= distance; i++) {
      xarround = singlePac.xpac + i;
      if (i <= 0) j = distance + i;
      else j = distance - i;
      for (let k = -1; k <= 1; k++) {
        if (!k) continue;
        if ((i === -distance || i === distance) && k === -1) continue;
        if (
          ((singlePac.xpac === 0 && i === -1) ||
            (singlePac.xpac === width - 1 && i === 1)) &&
          j === 0
        )
          xarround = width - 1 - singlePac.xpac;
        yarround = singlePac.ypac + j * k;
        potentialPellet = `${xarround},${yarround}`;
        // console.error(
        //   "PELLET ARROUND",
        //   singlePac.xpac,
        //   singlePac.ypac,
        //   potentialPellet,
        //   distance,
        //   allPelletsKeys.indexOf(potentialPellet)
        // );
        if (
          allPelletsKeys.indexOf(potentialPellet) > -1 &&
          (!limitedPellets || limitedPellets[potentialPellet]) &&
          (allPellets[potentialPellet].closestPacId.length === 0 ||
            allPellets[potentialPellet].closestPacId[0] ===
              `${singlePac.pacId}`)
        ) {
          // console.error('ENTERED');
          if (singlePac.xpac !== 0 && singlePac.xpac !== width - 1) {
            let cpTabMap = [...copyTabMap];

            const goal = String.fromCharCode(36 + ascii);
            cpTabMap[allPellets[potentialPellet]["y"]] = setCharAt(
              cpTabMap[allPellets[potentialPellet]["y"]],
              allPellets[potentialPellet]["x"],
              goal
            );
            realcount = findShortestPath(
              [singlePac.ypac, singlePac.xpac],
              cpTabMap,
              500,
              goal
            );
            ascii++;
            // console.error("BFS COMPARE", potentialPellet, distance, realcount);
            // if (singlePac.pacId === 1) console.error(cpTabMap);
          } else if (yarround === singlePac.ypac) realcount = distance;

          if (
            realcount &&
            realcount === distance &&
            mainTab.indexOf(potentialPellet) === -1
          ) {
            mainTab.push(potentialPellet);
            tabRes.push([potentialPellet, distance]);
          } else if (realcount && realcount > distance) {
            let newArray = [];
            newArray.push(potentialPellet);
            if (pelletsHolder[`${realcount}`])
              pelletsHolder[`${realcount}`] = pelletsHolder[
                `${realcount}`
              ].concat(newArray);
            else pelletsHolder[`${realcount}`] = newArray;
            // console.error(
            //   "STORING due to BFS",
            //   distance,
            //   realcount,
            //   pelletsHolder[`${realcount}`]
            // );
          } else if (mainTab.indexOf(potentialPellet) === -1) {
            // console.error("KeySafe", potentialPellet);
            keySafe.push([potentialPellet, 1]);
          }
        }
      }
    }
    if (pelletsHolder.length !== 0 && pelletsHolder[`${distance}`]) {
      for (var pKey in pelletsHolder[`${distance}`]) {
        // console.error(
        //   "CHOICES due to BFS",
        //   distance,
        //   pelletsHolder[`${distance}`][pKey],
        //   allPelletsKeys.indexOf( pelletsHolder[`${distance}`][pKey]),
        //   pelletsHolder[`${distance}`]
        // );
        if (
          allPelletsKeys.indexOf(pelletsHolder[`${distance}`][pKey]) > -1 &&
          (!limitedPellets ||
            limitedPellets[pelletsHolder[`${distance}`][pKey]]) &&
          allPellets[pelletsHolder[`${distance}`][pKey]].closestPacId.length ===
            0 &&
          mainTab.indexOf(pelletsHolder[`${distance}`][pKey]) === -1
        ) {
          mainTab.push(pelletsHolder[`${distance}`][pKey]);
          tabRes.push([pelletsHolder[`${distance}`][pKey], distance]);
        }
      }
    }
  }
  // console.error("MainTab", singlePac.pacId, mainTab, distance);
  return { mainTab: mainTab, safeTab: keySafe, tabRes };
};

const assignPellet = (
  pellets,
  singlePac,
  allPellets,
  limitedPellets
) => {
  let ratioPelletsArround = 0;
  let oldRatio = -1;
  let targetsArroundTab = [];
  let mainTarget = null;
  let mainPelletsKeys = closestPellets(
    singlePac,
    allPellets,
    limitedPellets
  );
  let pelletKeys = mainPelletsKeys.tabRes
    ? mainPelletsKeys.tabRes
    : mainPelletsKeys.keySafe;
  let distanceFromPellet;
  let closestDistance;
  let mainKey = null;
  // console.error("assignPellet CHOICES", singlePac.pacId, pelletKeys);
  for (var key of pelletKeys) {
    distanceFromPellet = key[1];
    if (
      (targetArround = optimalDirection(
        key[0],
        allPellets,
        singlePac,
        pellets,
        limitedPellets
      ))
    ) {
      let ratioV10 = targetArround.ratioV10;
      if (targetArround.hasV10)
        ratioPelletsArround =
          (targetArround.count / distanceFromPellet) * ratioV10;
      else
        ratioPelletsArround = targetArround.count / (distanceFromPellet + 13);
      if (oldRatio < ratioPelletsArround) {
        mainKey = key[0];
        targetsArroundTab = targetArround.tabTargets;
        mainTarget = targetArround.pelletKey;
        oldRatio = ratioPelletsArround;
        closestDistance = distanceFromPellet;
      }
      // console.error(
      //   "assignPellet DIR",
      //   singlePac.pacId,

      //   targetArround.pelletKey,
      //   targetArround.count,
      //   distanceFromPellet,
      //   targetArround.hasV10,
      //   ratioV10,
      //   ratioPelletsArround,
      //   oldRatio
      // );
    }
  }
  // console.error("MainKey", mainKey);
  if (mainKey && pellets[`${mainKey}`]) {
    // console.error('YES')
    pellets[`${mainKey}`].distance.unshift(closestDistance);
    pellets[`${mainKey}`].closestPacId.unshift(`${singlePac.pacId}`);

    if (pellets !== allPellets) {
      allPellets[`${mainKey}`].distance.unshift(closestDistance);
      allPellets[`${mainKey}`].closestPacId.unshift(`${singlePac.pacId}`);
    }
  }
  if (targetsArroundTab && mainTarget) {
    if (targetsArroundTab.length > 3)
      targetsArroundTab = targetsArroundTab.slice(0, 3);
    for (var pelletKey of targetsArroundTab) {
      if (pellets[`${pelletKey}`]) {
        pellets[`${pelletKey}`].distance.unshift(closestDistance);
        pellets[`${pelletKey}`].closestPacId.unshift(`${singlePac.pacId}`);
        // console.error("Editing Targets", pellets[`${pelletKey}`]);
      }
      if (pellets !== allPellets) {
        allPellets[`${pelletKey}`].distance.unshift(closestDistance);
        allPellets[`${pelletKey}`].closestPacId.unshift(`${singlePac.pacId}`);
        // console.error("Editing Targets for All", allPellets[`${pelletKey}`]);
      }
    }
  }
  // console.error("MAIN TARGET", singlePac.pacId, mainKey, mainTarget);
  return mainTarget;
};

const assignV10 = () => {
  let calcHolder = [];
  let tabPacs = [];
  let tabPV10 = [...pelletsV10];
  for (let coord of pelletsV10) {
    let realdistance = 0;
    let ascii = 0;
    for (let pac in pacInfo) {
      tabPacs.indexOf(pacInfo[pac].pacId) === -1
        ? tabPacs.push(pacInfo[pac].pacId)
        : null;
      let cpTabMap = [...copyTabMap];
      const goal = String.fromCharCode(36 + ascii);
      cpTabMap[allPellets[`${coord}`]["y"]] = setCharAt(
        cpTabMap[allPellets[`${coord}`]["y"]],
        allPellets[`${coord}`]["x"],
        goal
      );
      realdistance = findShortestPath(
        [pacInfo[pac].ypac, pacInfo[pac].xpac],
        cpTabMap,
        500,
        goal
      );
      ascii++;
      calcHolder.push([coord, pacInfo[pac].pacId, realdistance]);
    }
    calcHolder.sort((a, b) => {
      return a[2] - b[2];
    });
  }
  // console.error(calcHolder);
  for (let i = 0; i < calcHolder.length; i++) {
    if (
      calcHolder[i][2] &&
      tabPV10.indexOf(calcHolder[i][0]) > -1 &&
      tabPacs.indexOf(calcHolder[i][1]) > -1
    ) {
      // console.error("ASSIGNED", calcHolder[i][0], calcHolder[i][1]);
      allPellets[`${calcHolder[i][0]}`].closestPacId.unshift(
        `${calcHolder[i][1]}`
      );
      const idxDel = tabPacs.indexOf(calcHolder[i][1]);
      const idxPV10Del = tabPV10.indexOf(calcHolder[i][0]);
      tabPacs.splice(idxDel, 1);
      tabPV10.splice(idxPV10Del, 1);
    }
  }
};

const cleanMap = (map, x, y, pellets, allPellets) => {
  let pelletsTokeep = Object.keys(pellets);
  let potentialPellet;

  // console.error('KEEP', pelletsTokeep);
  for (let i = x; i >= 0; i--) {
    if (map[y][i] === "#") break;
    potentialPellet = `${i},${y}`;
    if (pelletsTokeep.indexOf(potentialPellet) === -1) {
      if (allPellets[potentialPellet]) delete allPellets[potentialPellet];
      // tabMap[`${y}`] = setCharAt(tabMap[`${y}`], i, "X");
    }
  }
  for (let i = x; i < width; i++) {
    if (map[y][i] === "#") break;
    potentialPellet = `${i},${y}`;
    if (pelletsTokeep.indexOf(potentialPellet) === -1) {
      if (allPellets[potentialPellet]) delete allPellets[potentialPellet];
      // tabMap[`${y}`] = setCharAt(tabMap[`${y}`], i, "X");
    }
  }
  for (let i = y; i >= 0; i--) {
    if (map[i][x] === "#") break;
    potentialPellet = `${x},${i}`;
    if (pelletsTokeep.indexOf(potentialPellet) === -1) {
      if (allPellets[potentialPellet]) delete allPellets[potentialPellet];
      // tabMap[`${i}`] = setCharAt(tabMap[`${i}`], x, "X");
    }
  }
  for (let i = y; i < height; i++) {
    if (map[i][x] === "#") break;
    potentialPellet = `${x},${i}`;
    if (pelletsTokeep.indexOf(potentialPellet) === -1) {
      if (allPellets[potentialPellet]) delete allPellets[potentialPellet];
      // tabMap[`${i}`] = setCharAt(tabMap[`${i}`], x, "X");
    }
  }
};

const clearMapEnemy = (x, y, pellets, allPellets) => {
  let pelletsTokeep = Object.keys(pellets);
  let potentialPellet;

  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      potentialPellet = `${x + i},${y + j}`;
      if (pelletsTokeep.indexOf(potentialPellet) === -1) {
        if (allPellets[potentialPellet]) {
          delete allPellets[potentialPellet];
          // tabMap[`${y + j}`] = setCharAt(tabMap[`${y + j}`], x + i, "X");
        }
      }
    }
  }
};

const AbleToAttack = (enemyTypeid, pacTypeId) => {
  if (enemyTypeid === "SCISSORS" && pacTypeId !== "ROCK") return "ROCK";
  if (enemyTypeid === "PAPER" && pacTypeId !== "SCISSORS") return "SCISSORS";
  if (enemyTypeid === "ROCK" && pacTypeId !== "PAPER") return "PAPER";
  return null;
};

const isSafe = (enemyTypeid, pacTypeId) => {
  if (enemyTypeid === "SCISSORS" && pacTypeId !== "PAPER") return true;
  if (enemyTypeid === "PAPER" && pacTypeId !== "ROCK") return true;
  if (enemyTypeid === "ROCK" && pacTypeId !== "SCISSORS") return true;
  return false;
};

const generatePellets = (pellets, xStart, yStart, xEnd, yEnd) => {
  let pelletKeys = Object.keys(pellets);
  let pelletsCopy = {};

  for (let i = yStart; i < yEnd; i++) {
    for (let j = xStart; j < xEnd; j++) {
      potentialPellet = `${j},${i}`;
      if ((pelletIndex = pelletKeys.indexOf(potentialPellet)) > -1) {
        pelletsCopy[potentialPellet] = pellets[pelletKeys[pelletIndex]];
      }
    }
  }
  return pelletsCopy;
};

const moveAway = (allPellets, enemy, pac, distance) => {
  let pelletsCpy = null;
  let xStart;
  let xEnd;
  let yStart;
  let yEnd;

  let diffX = Math.abs(enemy.xpac - pac.xpac);
  let diffY = Math.abs(enemy.ypac - pac.ypac);
  // console.error("Copying", enemy.xpac, enemy.ypac, pac.xpac, pac.ypac);
  if (diffX > diffY) {
    if (enemy.xpac > pac.xpac) {
      xStart = 0;
      xEnd = pac.xpac + 1;
    } else {
      xStart = pac.xpac;
      xEnd = width;
    }
    pelletsCpy = generatePellets(allPellets, xStart, 0, xEnd, height - 1);
  } else {
    if (enemy.ypac > pac.ypac) {
      yStart = 0;
      yEnd = pac.ypac + 1;
    } else {
      yStart = pac.ypac;
      yEnd = height;
    }
    pelletsCpy = generatePellets(allPellets, 0, yStart, width - 1, yEnd);
  }
  // console.error(pelletsCpy)
  return pelletsCpy;
};

const comparePacs = (allPellets, pacInfo, singlePac) => {
  let stop = false;
  for (let pac in pacInfo) {
    if (pacInfo[pac].pacId !== singlePac.pacId) {
      let newcount =
        Math.abs(singlePac.xpac - pacInfo[pac].xpac) +
        Math.abs(singlePac.ypac - pacInfo[pac].ypac);
      if (newcount <= 2) {
        stop = true;
        singlePac.stopped = stop;
        if (singlePac.xpac === pacInfo[pac].xpac) {
          if (singlePac.ypac > pacInfo[pac].ypac)
            pacInfo[pac].canMovePellets = generatePellets(
              allPellets,
              0,
              0,
              width,
              singlePac.ypac
            );
          else
            pacInfo[pac].canMovePellets = generatePellets(
              allPellets,
              0,
              singlePac.ypac,
              width,
              height
            );
        } else if (singlePac.xpac > pacInfo[pac].xpac)
          pacInfo[pac].canMovePellets = generatePellets(
            allPellets,
            0,
            0,
            singlePac.xpac,
            height
          );
        else
          pacInfo[pac].canMovePellets = generatePellets(
            allPellets,
            singlePac.xpac,
            0,
            width,
            height
          );
      }
    }
  }
  return stop;
};
const getIndx2dArr = (val, arr) => {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].indexOf(val) !== -1) return i;
  }
  return -1;
};

////////////////////////////////////////////////////////////////////////////
// game loop
while (true) {
  var inputs = readline().split(" ");
  // const myScore = parseInt(inputs[0]);
  // const opponentScore = parseInt(inputs[1]);
  const visiblePacCount = parseInt(readline());
  pacInfo = [];
  tabPacIdsVisible = [];
  pacEnemy = [];
  pelletsV10 = [];
  let pellets = {};
  let pacPositions = [];
  let pacCount = 0;

  ////////////////////////////////////////////////////////////////////////////
  //Store Pacs
  for (let i = 0; i < visiblePacCount; i++) {
    var inputs = readline().split(" ");
    const pacId = parseInt(inputs[0]); // pac number (unique within a team)
    const mine = inputs[1] !== "0"; // true if this pac is yours
    const x = parseInt(inputs[2]); // position in the grid
    const y = parseInt(inputs[3]); // position in the grid
    const typeId = inputs[4];
    const speedTurnsLeft = parseInt(inputs[5]);
    const abilityCooldown = parseInt(inputs[6]);
    if (flag === 0) {
      oldCoords[pacId] = {};
    }

    if (mine && typeId !== "DEAD") {
      storePac(
        pacInfo,
        pacId,
        x,
        y,
        typeId,
        speedTurnsLeft,
        abilityCooldown,
        oldCoords[pacId]
      );
      ////////////////////////////
      //store Map
    } else if (typeId !== "DEAD") {
      storePac(
        pacEnemy,
        pacId,
        x,
        y,
        typeId,
        speedTurnsLeft,
        abilityCooldown,
        null
      );
    }
  }

  ////////////////////////////////////////////////////////////////////////////
  //Update Pellets
  const visiblePelletCount = parseInt(readline()); // all pellets in sight
  for (let i = 0; i < visiblePelletCount; i++) {
    var inputs = readline().split(" ");
    const x = parseInt(inputs[0]);
    const y = parseInt(inputs[1]);
    const value = parseInt(inputs[2]);

    if (value === 10 || !allPellets[`${x},${y}`]) {
      if (value === 10) pelletsV10.push(`${x},${y}`);
      allPellets[`${x},${y}`] = {
        x: x,
        y: y,
        value: value,
        closestPacId: [],
        distance: [],
      };
      // console.error("added", `${x},${y}`, allPellets[`${x},${y}`]);
    }
    pellets[`${x},${y}`] = {
      x: x,
      y: y,
      value: value,
      closestPacId: [],
      distance: [],
    };
  }

  ////////////////////////////////////////////////////////////////////////////
  //Deleting Pellets Eaten
  for (let pac in pacInfo) {
    cleanMap(tabMap, pacInfo[pac].xpac, pacInfo[pac].ypac, pellets, allPellets);
    pacPositions.push([pac, pacInfo[pac].xpac, pacInfo[pac].ypac]);
    pacCount++;
  }
  pacPositions.sort((a, b) => {
    return a[1] - b[1];
  });
  for (const [pellet, pelletInfo] of Object.entries(allPellets)) {
    if (pelletInfo.value === 10 && pelletsV10.indexOf(pellet) === -1)
      delete allPellets[pellet];

    pelletInfo.closestPacId = [];
    pelletInfo.distance = [];
  }

  assignV10();
  ////////////////////////////////////////////////////////////////////////////
  // ASSIGN PELLETS

  // console.error(tabMap);

  // console.error('all',allPellets);
  ////////////////////////////////////////////////////////////////////////////
  // loop pacs to choose action
  // console.error("Count", pacCount);

  for (let pac in pacInfo) {
    let keyPellet = null;
    let targetInfo;
    let target = null;
    let distanceToEnemy = null;
    let changeType = null;
    let pelletsCpy = null;
    /////////////////////////////////////////////////////////////////////////
    // Action SPEED || SWITCH

    const idxPacPosition = getIndx2dArr(pac, pacPositions);
    if (
      pacInfo[pac].xpac !== 0 &&
      pacInfo[pac].xpac !== width - 1 &&
      !pelletsV10.length
    )
      pelletsCpy = generatePellets(
        allPellets,
        Math.floor((idxPacPosition / pacCount) * width),
        0,
        Math.floor(((idxPacPosition + 1) / pacCount) * width),
        height
      );

    //Get ENEMY
    targetInfo = getClosestEnemy(
      pacEnemy,
      pacInfo[pac].xpac,
      pacInfo[pac].ypac
    );

    if (targetInfo) {
      target = targetInfo.target;
      distanceToEnemy = targetInfo.distance;
      // console.error(
      //   "enemy Found",
      //   targetInfo,
      //   pac,
      //   pacEnemy[target],
      //   pacInfo[pac].abilityCooldown
      // );
      if (
        (changeType = AbleToAttack(
          pacEnemy[target].typeId,
          pacInfo[pac].typeId
        ))
      ) {
        if (!pacInfo[pac].abilityCooldown && distanceToEnemy <= 1) {
          //SWITCH TO Better Type
          // console.error("SWITCHING", pacInfo[pac].pacId);
          pacInfo[pac].switch = changeType;
        } else if (!isSafe(pacEnemy[target].typeId, pacInfo[pac].typeId)) {
          // Move Away
          // console.error("Not Able to Attack", pacInfo[pac].pacId);
          pelletsCpy = moveAway(
            allPellets,
            pacEnemy[target],
            pacInfo[pac],
            distanceToEnemy
          );
          // console.error(pelletsCpy);
        }
      }
    }

    /////////////////////////////////////////////////////////////////////////
    //ASSIGN PELLET
    /////////////////////////////////////////////////////////////////////////
    // PAC BLOCKED
    if (
      pacInfo[pac].oldx === pacInfo[pac].xpac &&
      pacInfo[pac].oldy === pacInfo[pac].ypac &&
      flag &&
      pacInfo[pac].stopped === false
    ) {
      pacInfo[pac].count++;
    } else {
      pacInfo[pac].changedir = false;
      pacInfo[pac].count = 0;
    }

    /////////////////////////////////////////////////////////////////////////
    // LIMIT CHANGE PAC DIRECTION
    // console.error(
    //   "Stopped",
    //   pacInfo[pac].count,
    //   pacInfo[pac].stopped,
    //   pacInfo[pac].pacId
    // );
    if (
      pacInfo[pac].count >= 2 &&
      !pacInfo[pac].canMovePellets &&
      comparePacs(allPellets, pacInfo, pacInfo[pac]) === true
    ) {
      // console.error("Stopped");
      pacInfo[pac].changedir = true;
      pacInfo[pac].xdest = pacInfo[pac].xpac;
      pacInfo[pac].ydest = pacInfo[pac].ypac;
    } else pacInfo[pac].stopped = false;
    if (pacInfo[pac].canMovePellets) {
      pelletsCpy = pacInfo[pac].canMovePellets;
      pacInfo[pac].canMovePellets = null;
      // console.error(pacInfo[pac].pacId, pelletsCpy);
    }

    if (!pacInfo[pac].changedir) {
      if (
        (keyPellet = assignPellet(
          allPellets,
          pacInfo[pac],
          allPellets,
          pelletsCpy
        ))
      ) {
        pacInfo[pac].xdest = allPellets[keyPellet]["x"];
        pacInfo[pac].ydest = allPellets[keyPellet]["y"];
      }
    }

    // OLD STATE
    oldCoords[`${pacInfo[pac]["pacId"]}`] = {
      oldx: pacInfo[pac]["xpac"],
      oldy: pacInfo[pac]["ypac"],
      count: pacInfo[pac].count,
      changedir: pacInfo[pac].changedir,
      xdest: pacInfo[pac].xdest,
      ydest: pacInfo[pac].ydest,
      stopped: pacInfo[pac].stopped,
      targetedPellet: keyPellet,
      targetCounter: pacInfo[pac].targetCounter
        ? pacInfo[pac].targetCounter
        : 0,
    };

    /////////////////////////////////////////////////////////////////////////
    // CHOOSE ACTION MOVE/SWITCH/SPEED
    if (!pacInfo[pac].abilityCooldown && !pacInfo[pac].switch) {
      pacInfo[pac].speed = true;
    } else {
      pacInfo[pac].speed = null;
    }
    pacInfo[pac].move =
      pacInfo[pac].switch || pacInfo[pac].speed ? false : true;
  }

  let res = "";
  for (let i = 0; i < pacInfo.length; i++) {
    if (pacInfo[i].move)
      res += `MOVE ${pacInfo[i].pacId} ${pacInfo[i].xdest} ${pacInfo[i].ydest}`;
    else if (pacInfo[i].switch)
      res += `SWITCH ${pacInfo[i].pacId} ${pacInfo[i].switch}`;
    else if (pacInfo[i].speed) res += `SPEED ${pacInfo[i].pacId}`;
    if (i !== pacInfo.length - 1) res += "|";
  }
  flag++;
  console.log(res);
}
