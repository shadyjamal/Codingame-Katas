let bfs = (graph, root) => {
    let nodesLen = {};
  
    for (let i = 0; i < graph.length; i++) {
      nodesLen[i] = Infinity;
    }
    nodesLen[root] = 0;
  
    let queue = [root];
    let current;
  
    while (queue.length != 0) {
      current = queue.shift();
  
      let curConnected = graph[current];
      let neighborIdx = [];
      let idx = curConnected.indexOf(1);
  
      while (idx != -1) {
        neighborIdx.push(idx);
        idx = curConnected.indexOf(1, idx + 1);
      }
  
      for (let j = 0; j < neighborIdx.length; j++) {
        if (nodesLen[neighborIdx[j]] == Infinity) {
          nodesLen[neighborIdx[j]] = nodesLen[current] + 1;
          queue.push(neighborIdx[j]);
        }
      }
    }
  
    return nodesLen;
  };
  
  let getClosestNode = (nodeslen, gtys) => {
    let closestNode;
    let minDistance;
    for (let i = 0; i < gtys.length; i++) {
      if (!i || nodeslen[`${gtys[i]}`] < minDistance) {
        closestNode = gtys[i];
        minDistance = nodeslen[`${gtys[i]}`];
      }
    }
    return { num: closestNode, minDistance };
  };
  
  var inputs = readline().split(" ");
  const N = parseInt(inputs[0]); // the total number of nodes in the level, including the gateways
  const L = parseInt(inputs[1]); // the number of links
  const E = parseInt(inputs[2]); // the number of exit gateways
  let matrix = new Array(N);
  for (var i = 0; i < N; i++) {
    matrix[i] = new Array(N).fill(0);
  }
  
  for (let i = 0; i < L; i++) {
    var inputs = readline().split(" ");
    const N1 = parseInt(inputs[0]); // N1 and N2 defines a link between these nodes
    const N2 = parseInt(inputs[1]);
    matrix[N1][N2] = 1;
    matrix[N2][N1] = 1;
  }
  
  let gtyTab = [];
  for (let i = 0; i < E; i++) {
    const EI = parseInt(readline()); // the index of a gateway node
    gtyTab.push(EI);
  }
  
  // game loop
  while (true) {
    const SI = parseInt(readline()); // The index of the node on which the Skynet agent is positioned this turn
    const nodesLen = bfs(matrix, SI); // get the distance between the Agent and all nodes
    let closestGateway;
    closestGateway = getClosestNode(nodesLen, gtyTab); // get closest Gateways to Agent (distance and index)
    if (closestGateway.minDistance === 1) {
      matrix[SI][closestGateway.num] = 0;
      matrix[closestGateway.num][SI] = 0;
      console.log(`${SI} ${closestGateway.num}`);
    } else {
      const idxPair = matrix[closestGateway.num].indexOf(1);
      if (idxPair != -1) {
        matrix[closestGateway.num][idxPair] = 0;
        matrix[idxPair][closestGateway.num] = 0;
        console.log(`${idxPair} ${closestGateway.num}`);
      }
    }
  }
  