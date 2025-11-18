// Browser-compatible rolling cuboid solver
function solveCuboidPuzzle(gridInput) {
  const startTime = performance.now();

  // ------------- PARSING -------------
  function parseGrid(input) {
    return input
      .split('\n')
      .filter((l) => l.trim())
      .map((l) => l.split(''));
  }

  const characterGrid = parseGrid(gridInput);
  const gridHeight = characterGrid.length;
  const gridWidth = characterGrid[0].length;

  // collect original special tile coordinates
  const originalSpecialTileCoords = new Set();
  for (let row = 0; row < gridHeight; row++) {
    for (let col = 0; col < gridWidth; col++) {
      if (characterGrid[row][col] === 'h') originalSpecialTileCoords.add(`${row},${col}`);
    }
  }

  // find digit clusters (connected components) -> cuboids
  const visitedCuboidCells = Array.from({ length: gridHeight }, () => Array(gridWidth).fill(false));
  const cuboidList = []; // each: { id, height, width, depth, position:[r,c] (min), dimensions:[w,d,h], cells:[ [r,c]... ] }

  function isWithinGridBounds(row, col) {
    return row >= 0 && row < gridHeight && col >= 0 && col < gridWidth;
  }

  for (let row = 0; row < gridHeight; row++) {
    for (let col = 0; col < gridWidth; col++) {
      const cellChar = characterGrid[row][col];
      if (/[1-9]/.test(cellChar) && !visitedCuboidCells[row][col]) {
        // BFS/DFS to collect connected component of same digit
        const cuboidHeight = cellChar;
        const searchStack = [[row, col]];
        visitedCuboidCells[row][col] = true;
        const cuboidCells = [];
        let minRow = row,
          maxRow = row,
          minCol = col,
          maxCol = col;
        while (searchStack.length) {
          const [currentRow, currentCol] = searchStack.pop();
          cuboidCells.push([currentRow, currentCol]);
          if (currentRow < minRow) minRow = currentRow;
          if (currentRow > maxRow) maxRow = currentRow;
          if (currentCol < minCol) minCol = currentCol;
          if (currentCol > maxCol) maxCol = currentCol;
          // 4-neighbors
          const neighborDeltas = [
            [1, 0],
            [-1, 0],
            [0, 1],
            [0, -1],
          ];
          for (const [deltaRow, deltaCol] of neighborDeltas) {
            const neighborRow = currentRow + deltaRow,
              neighborCol = currentCol + deltaCol;
            if (
              isWithinGridBounds(neighborRow, neighborCol) &&
              !visitedCuboidCells[neighborRow][neighborCol] &&
              characterGrid[neighborRow][neighborCol] === cuboidHeight
            ) {
              visitedCuboidCells[neighborRow][neighborCol] = true;
              searchStack.push([neighborRow, neighborCol]);
            }
          }
        }
        const cuboidWidth = maxCol - minCol + 1;
        const cuboidDepth = maxRow - minRow + 1;
        const cuboidHeight3D = Number(cuboidHeight); // digit -> height
        // assume footprint is full rectangle filled by digit
        const cuboidFootprintCells = [];
        for (let footprintRow = minRow; footprintRow <= maxRow; footprintRow++)
          for (let footprintCol = minCol; footprintCol <= maxCol; footprintCol++) cuboidFootprintCells.push([footprintRow, footprintCol]);
        const cuboidId = cuboidList.length + 1;
        cuboidList.push({
          id: cuboidId,
          position: [minRow, minCol],
          dimensions: [cuboidWidth, cuboidDepth, cuboidHeight3D],
          cells: cuboidFootprintCells,
        });
      }
    }
  }

  // parse goals: find connected components of 'g' and compute rectangle topLeft,width,height
  const visitedGoalCells = Array.from({ length: gridHeight }, () => Array(gridWidth).fill(false));
  const goalAreas = []; // each: { id, topLeft: [r,c], width, height, cells:Set<string> }
  for (let row = 0; row < gridHeight; row++) {
    for (let col = 0; col < gridWidth; col++) {
      if (characterGrid[row][col] === 'g' && !visitedGoalCells[row][col]) {
        const goalSearchStack = [[row, col]];
        visitedGoalCells[row][col] = true;
        const goalCellComponents = [];
        let minRow = row,
          maxRow = row,
          minCol = col,
          maxCol = col;
        while (goalSearchStack.length) {
          const [currentRow, currentCol] = goalSearchStack.pop();
          goalCellComponents.push([currentRow, currentCol]);
          if (currentRow < minRow) minRow = currentRow;
          if (currentRow > maxRow) maxRow = currentRow;
          if (currentCol < minCol) minCol = currentCol;
          if (currentCol > maxCol) maxCol = currentCol;
          const neighborDeltas = [
            [1, 0],
            [-1, 0],
            [0, 1],
            [0, -1],
          ];
          for (const [deltaRow, deltaCol] of neighborDeltas) {
            const neighborRow = currentRow + deltaRow,
              neighborCol = currentCol + deltaCol;
            if (
              isWithinGridBounds(neighborRow, neighborCol) &&
              !visitedGoalCells[neighborRow][neighborCol] &&
              characterGrid[neighborRow][neighborCol] === 'g'
            ) {
              visitedGoalCells[neighborRow][neighborCol] = true;
              goalSearchStack.push([neighborRow, neighborCol]);
            }
          }
        }
        // assume rectangular goal
        const goalWidth = maxCol - minCol + 1;
        const goalHeight = maxRow - minRow + 1;
        const goalCellsSet = new Set(goalCellComponents.map(([a, b]) => `${a},${b}`));
        goalAreas.push({
          id: goalAreas.length + 1,
          topLeft: [minRow, minCol],
          width: goalWidth,
          height: goalHeight,
          cellsSet: goalCellsSet,
        });
      }
    }
  }

  // build set of all special coords (strings)
  const allSpecialTileCoords = [...originalSpecialTileCoords];

  // -------------- UTILITIES --------------
  function getCellsForPositionAndDimensions(position, dimensions) {
    const [startRow, startCol] = position;
    const [width, depth] = dimensions; // width=#cols, depth=#rows (height not needed for footprint)
    const occupiedCells = [];
    for (let deltaRow = 0; deltaRow < depth; deltaRow++) {
      for (let deltaCol = 0; deltaCol < width; deltaCol++) {
        occupiedCells.push([startRow + deltaRow, startCol + deltaCol]);
      }
    }
    return occupiedCells;
  }
  function convertCellsToCoordinateSet(cellList) {
    return new Set(cellList.map(([row, col]) => `${row},${col}`));
  }

  // ------------- PASSABILITY RULES -------------
  // originalSpecialTileCoords (Set<string>) lists all h tile coords originally.
  // For a given state's remainingSpecialTiles (Set<string>), a cell is passable if:
  //  - inside grid
  //  - grid tile is not blocked 'x' (1)
  //  - if cell was originally special and has already been visited (i.e., NOT present in remainingSpecialTiles) -> it is blocked
  function isCellPassableInState(row, col, remainingSpecialTiles) {
    if (!isWithinGridBounds(row, col)) return false;
    const cellCharacter = characterGrid[row][col];
    if (cellCharacter === 'x') return false; // blocked
    const coordinateKey = `${row},${col}`;
    if (originalSpecialTileCoords.has(coordinateKey) && !remainingSpecialTiles.has(coordinateKey)) {
      // originally special but already visited earlier in this path -> now blocked
      return false;
    }
    return true;
  }

  // ------------- STATE REPRESENTATION -------------
  // state: { cuboids: [ { position:[r,c], dimensions:[w,d,h], cells:[[r,c]...] }, ... ], remainingSpecialTiles:Set<string> }
  // serialize includes cuboids positions/dimensions and sorted remainingSpecialTiles keys
  function serializeGameState(gameState) {
    const cuboidDescriptions = gameState.cuboids
      .map((cuboid) => {
        return `${cuboid.position[0]},${cuboid.position[1]}|${cuboid.dimensions.join(',')}`;
      })
      .join(';');
    const specialTileKeys = [...gameState.remainingSpecialTiles].sort().join(';');
    return `${cuboidDescriptions}|${specialTileKeys}`;
  }

  // initial state
  let initialGameState = {
    cuboids: cuboidList.map((cuboid) => ({
      id: cuboid.id,
      position: cuboid.position.slice(),
      dimensions: cuboid.dimensions.slice(),
      cells: cuboid.cells.map((cellCoord) => cellCoord.slice()),
    })),
    remainingSpecialTiles: new Set(allSpecialTileCoords),
  };
  // remove any specials already covered by starting footprints
  for (const cuboid of initialGameState.cuboids) {
    const coveredCells = convertCellsToCoordinateSet(cuboid.cells);
    for (const specialCoord of [...initialGameState.remainingSpecialTiles]) {
      if (coveredCells.has(specialCoord)) initialGameState.remainingSpecialTiles.delete(specialCoord);
    }
  }

  // ------------- ROLLING LOGIC (generate neighbors) -------------
  function generateNeighborStates(currentState) {
    const neighborStates = [];
    // for each cuboid, try the four roll directions (move only one cuboid at a time)
    for (let cuboidIndex = 0; cuboidIndex < currentState.cuboids.length; cuboidIndex++) {
      const movingCuboid = currentState.cuboids[cuboidIndex];
      const otherCuboids = currentState.cuboids.filter((_, index) => index !== cuboidIndex);

      const [currentRow, currentCol] = movingCuboid.position;
      const [width, depth, height] = movingCuboid.dimensions;

      const rollDirections = [
        {
          name: 'down',
          deltaRow: depth,
          deltaCol: 0,
          newDimensions: [width, height, depth],
        },
        {
          name: 'up',
          deltaRow: -height,
          deltaCol: 0,
          newDimensions: [width, height, depth],
        },
        {
          name: 'right',
          deltaRow: 0,
          deltaCol: width,
          newDimensions: [height, depth, width],
        },
        {
          name: 'left',
          deltaRow: 0,
          deltaCol: -height,
          newDimensions: [height, depth, width],
        },
      ];

      for (const direction of rollDirections) {
        const newRow = currentRow + direction.deltaRow;
        const newCol = currentCol + direction.deltaCol;
        const newDimensions = direction.newDimensions.slice();
        const newFootprintCells = getCellsForPositionAndDimensions([newRow, newCol], newDimensions);
        // 1) footprint entirely in bounds and passable wrt this state's remainingSpecialTiles
        const allCellsPassable = newFootprintCells.every(([row, col]) =>
          isCellPassableInState(row, col, currentState.remainingSpecialTiles),
        );
        if (!allCellsPassable) continue;
        // 2) must not collide with other cuboids' current footprints
        const newFootprintSet = convertCellsToCoordinateSet(newFootprintCells);
        let hasCollision = false;
        for (const otherCuboid of otherCuboids) {
          const otherCuboidSet = convertCellsToCoordinateSet(otherCuboid.cells);
          if (newFootprintSet.intersection(otherCuboidSet).size > 0) {
            hasCollision = true;
            break;
          }
        }
        if (hasCollision) continue;
        // 3) compute new remainingSpecialTiles by removing any newly-covered special tiles
        const updatedRemainingSpecial = new Set(currentState.remainingSpecialTiles);
        for (const [row, col] of newFootprintCells) {
          const coordinateKey = `${row},${col}`;
          if (updatedRemainingSpecial.has(coordinateKey)) updatedRemainingSpecial.delete(coordinateKey);
        }
        // 4) assemble new cuboids array: update moving cuboid's position/dims/cells; others same
        const updatedCuboids = currentState.cuboids.map((cuboid, index) => {
          if (index === cuboidIndex) {
            return {
              id: cuboid.id,
              position: [newRow, newCol],
              dimensions: newDimensions.slice(),
              cells: newFootprintCells.map((cellCoord) => cellCoord.slice()),
            };
          } else {
            return {
              id: cuboid.id,
              position: cuboid.position.slice(),
              dimensions: cuboid.dimensions.slice(),
              cells: cuboid.cells.map((cellCoord) => cellCoord.slice()),
            };
          }
        });
        neighborStates.push({
          cuboids: updatedCuboids,
          remainingSpecialTiles: updatedRemainingSpecial,
          action: `C${movingCuboid.id} ${direction.name}`, // label for move
        });
      }
    }
    return neighborStates;
  }

  // ------------- GOAL CHECK (matching) -------------
  // A state is goal if remainingSpecialTiles empty AND there is a perfect matching between cuboids and goal rectangles
  // such that each cuboid covers exactly the cells of a distinct goal rectangle.
  function isGoalState(gameState) {
    if (gameState.remainingSpecialTiles.size > 0) return false;

    // If there are no goals defined, just check if all special tiles are visited
    if (goalAreas.length === 0) {
      return true; // All special tiles visited, no specific end positions required
    }

    // compute cuboid->set of occupied cell keys
    const cuboidOccupiedCells = gameState.cuboids.map((cuboid) => convertCellsToCoordinateSet(cuboid.cells));
    // build bipartite graph: left = cuboids indices, right = goals indices; edge if cuboidOccupiedCells equals a goal.cellsSet
    const numCuboids = gameState.cuboids.length;
    if (goalAreas.length < numCuboids) return false; // not enough goals
    const bipartiteEdges = Array.from({ length: numCuboids }, () => []);
    for (let cuboidIndex = 0; cuboidIndex < numCuboids; cuboidIndex++) {
      for (let goalIndex = 0; goalIndex < goalAreas.length; goalIndex++) {
        if (cuboidOccupiedCells[cuboidIndex].size !== goalAreas[goalIndex].cellsSet.size) continue;
        let setsAreEqual = true;
        for (const coordinateKey of goalAreas[goalIndex].cellsSet)
          if (!cuboidOccupiedCells[cuboidIndex].has(coordinateKey)) {
            setsAreEqual = false;
            break;
          }
        if (setsAreEqual) bipartiteEdges[cuboidIndex].push(goalIndex);
      }
    }
    // Now test for perfect matching using DFS augment (small numCuboids typical)
    const goalMatches = Array(goalAreas.length).fill(-1);
    function findAugmentingPath(cuboidIndex, visitedGoals) {
      for (const goalIndex of bipartiteEdges[cuboidIndex]) {
        if (visitedGoals[goalIndex]) continue;
        visitedGoals[goalIndex] = true;
        if (goalMatches[goalIndex] === -1 || findAugmentingPath(goalMatches[goalIndex], visitedGoals)) {
          goalMatches[goalIndex] = cuboidIndex;
          return true;
        }
      }
      return false;
    }
    let matchingSize = 0;
    for (let cuboidIndex = 0; cuboidIndex < numCuboids; cuboidIndex++) {
      const visitedGoals = Array(goalAreas.length).fill(false);
      if (findAugmentingPath(cuboidIndex, visitedGoals)) matchingSize++;
    }
    return matchingSize === numCuboids;
  }

  // ------------- BFS (shortest moves) -------------
  function compressActionSequence(actionList, cuboidCount) {
    if (actionList.length === 0) return [];
    const compressedActions = [];
    let currentAction = actionList[0],
      actionCount = 1;

    // Only show cuboid ID if there are multiple cuboids
    const showCuboidId = cuboidCount > 1;

    for (let i = 1; i < actionList.length; i++) {
      if (actionList[i] === currentAction) actionCount++;
      else {
        const displayAction = showCuboidId ? currentAction : currentAction.replace(/^C\d+ /, '');
        compressedActions.push(actionCount === 1 ? displayAction : `${displayAction} ${actionCount} times`);
        currentAction = actionList[i];
        actionCount = 1;
      }
    }
    const displayAction = showCuboidId ? currentAction : currentAction.replace(/^C\d+ /, '');
    compressedActions.push(actionCount === 1 ? displayAction : `${displayAction} ${actionCount} times`);
    return compressedActions;
  }

  function solvePuzzle() {
    const startingState = initialGameState;
    const cuboidCount = startingState.cuboids.length;
    const searchQueue = [[{ state: startingState, action: null }]]; // path nodes store objects { state, action }
    const visitedStates = new Set([serializeGameState(startingState)]);

    while (searchQueue.length) {
      const currentPath = searchQueue.shift();
      const currentPathNode = currentPath[currentPath.length - 1];
      const currentState = currentPathNode.state;

      if (isGoalState(currentState)) {
        // reconstruct actions (skip first null)
        const solutionActions = currentPath.slice(1).map((pathNode) => pathNode.action);
        return compressActionSequence(solutionActions, cuboidCount);
      }

      const neighborStates = generateNeighborStates(currentState);
      for (const neighborState of neighborStates) {
        const stateKey = serializeGameState(neighborState);
        if (!visitedStates.has(stateKey)) {
          visitedStates.add(stateKey);
          searchQueue.push([...currentPath, { state: neighborState, action: neighborState.action }]);
        }
      }
    }
    return null;
  }

  // ------------- RUN SOLVER -------------
  function solvePuzzle() {
    const startingState = initialGameState;
    const cuboidCount = startingState.cuboids.length;
    const searchQueue = [[{ state: startingState, action: null }]]; // path nodes store objects { state, action }
    const visitedStates = new Set([serializeGameState(startingState)]);

    while (searchQueue.length) {
      const currentPath = searchQueue.shift();
      const currentPathNode = currentPath[currentPath.length - 1];
      const currentState = currentPathNode.state;

      if (isGoalState(currentState)) {
        // reconstruct actions (skip first null)
        const solutionActions = currentPath.slice(1).map((pathNode) => pathNode.action);
        return {
          solution: compressActionSequence(solutionActions, cuboidCount),
          statesExplored: visitedStates.size,
        };
      }

      const neighborStates = generateNeighborStates(currentState);
      for (const neighborState of neighborStates) {
        const stateKey = serializeGameState(neighborState);
        if (!visitedStates.has(stateKey)) {
          visitedStates.add(stateKey);
          searchQueue.push([...currentPath, { state: neighborState, action: neighborState.action }]);
        }
      }
    }
    return { solution: null, statesExplored: visitedStates.size };
  }

  const result = solvePuzzle();
  const endTime = performance.now();
  const solutionSteps = result.solution ? result.solution.length : 0;

  if (result.solution) {
    return {
      success: true,
      steps: solutionSteps,
      solution: result.solution.join(' -> '),
      statesExplored: result.statesExplored,
      time: Math.round(endTime - startTime),
    };
  } else {
    return {
      success: false,
      steps: 0,
      solution: '',
      statesExplored: result.statesExplored,
      time: Math.round(endTime - startTime),
    };
  }
}

// Node.js compatibility - only run if called directly
if (typeof module !== 'undefined' && module.exports) {
  // Default example for Node.js
  const defaultGrid = `
1xxxhhxxx
1xxxhhxxx
1xxxhhxxx
hhhhhhhhh
hhhhhhhhh
hxxxhhhhh
hxxxhhhhh
hhhhhhhhh
`.trim();

  const result = solveCuboidPuzzle(defaultGrid);
  if (result.success) {
    console.log('Solution path:', result.solution);
  } else {
    console.log('No solution found');
  }
}
