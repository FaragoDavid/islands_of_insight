export function solveCuboidPuzzle(gridInput) {
  const startTime = performance.now();

  function parseGrid(input) {
    return input
      .split('\n')
      .filter((l) => l.trim())
      .map((l) => l.split(''));
  }

  const characterGrid = parseGrid(gridInput);
  const gridHeight = characterGrid.length;
  const gridWidth = characterGrid[0].length;

  const originalSpecialTileCoords = new Set();
  for (let row = 0; row < gridHeight; row++) {
    for (let col = 0; col < gridWidth; col++) {
      if (characterGrid[row][col] === 'h') {
        originalSpecialTileCoords.add(`${row},${col}`);
      }
    }
  }

  const visitedCuboidCells = Array.from({ length: gridHeight }, () => Array(gridWidth).fill(false));
  const cuboidList = [];

  function isWithinGridBounds(row, col) {
    return row >= 0 && row < gridHeight && col >= 0 && col < gridWidth;
  }

  for (let row = 0; row < gridHeight; row++) {
    for (let col = 0; col < gridWidth; col++) {
      const cellChar = characterGrid[row][col];
      if (/[1-9]/.test(cellChar) && !visitedCuboidCells[row][col]) {
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
          minRow = Math.min(minRow, currentRow);
          maxRow = Math.max(maxRow, currentRow);
          minCol = Math.min(minCol, currentCol);
          maxCol = Math.max(maxCol, currentCol);

          const neighborDeltas = [
            [1, 0],
            [-1, 0],
            [0, 1],
            [0, -1],
          ];
          for (const [deltaRow, deltaCol] of neighborDeltas) {
            const neighborRow = currentRow + deltaRow;
            const neighborCol = currentCol + deltaCol;
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
        const cuboidHeight3D = Number(cuboidHeight);

        const cuboidFootprintCells = [];
        for (let footprintRow = minRow; footprintRow <= maxRow; footprintRow++) {
          for (let footprintCol = minCol; footprintCol <= maxCol; footprintCol++) {
            cuboidFootprintCells.push([footprintRow, footprintCol]);
          }
        }

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

  const visitedGoalCells = Array.from({ length: gridHeight }, () => Array(gridWidth).fill(false));
  const goalAreas = [];

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
          minRow = Math.min(minRow, currentRow);
          maxRow = Math.max(maxRow, currentRow);
          minCol = Math.min(minCol, currentCol);
          maxCol = Math.max(maxCol, currentCol);

          const neighborDeltas = [
            [1, 0],
            [-1, 0],
            [0, 1],
            [0, -1],
          ];
          for (const [deltaRow, deltaCol] of neighborDeltas) {
            const neighborRow = currentRow + deltaRow;
            const neighborCol = currentCol + deltaCol;
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

  function getCellsForPositionAndDimensions(position, dimensions) {
    const [startRow, startCol] = position;
    const [width, depth] = dimensions;
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

  function isCellPassableInState(row, col, remainingSpecialTiles) {
    if (!isWithinGridBounds(row, col)) return false;
    const cellCharacter = characterGrid[row][col];
    if (cellCharacter === 'x') return false;

    const coordinateKey = `${row},${col}`;
    if (originalSpecialTileCoords.has(coordinateKey) && !remainingSpecialTiles.has(coordinateKey)) {
      return false;
    }
    return true;
  }

  function serializeGameState(gameState) {
    const cuboidDescriptions = gameState.cuboids
      .map((cuboid) => `${cuboid.position[0]},${cuboid.position[1]}|${cuboid.dimensions.join(',')}`)
      .join(';');
    const specialTileKeys = [...gameState.remainingSpecialTiles].sort().join(';');
    return `${cuboidDescriptions}|${specialTileKeys}`;
  }

  let initialGameState = {
    cuboids: cuboidList.map((cuboid) => ({
      id: cuboid.id,
      position: cuboid.position.slice(),
      dimensions: cuboid.dimensions.slice(),
      cells: cuboid.cells.map((cellCoord) => cellCoord.slice()),
    })),
    remainingSpecialTiles: new Set(originalSpecialTileCoords),
  };

  for (const cuboid of initialGameState.cuboids) {
    const coveredCells = convertCellsToCoordinateSet(cuboid.cells);
    for (const specialCoord of [...initialGameState.remainingSpecialTiles]) {
      if (coveredCells.has(specialCoord)) {
        initialGameState.remainingSpecialTiles.delete(specialCoord);
      }
    }
  }

  function generateNeighborStates(currentState) {
    const neighborStates = [];

    for (let cuboidIndex = 0; cuboidIndex < currentState.cuboids.length; cuboidIndex++) {
      const movingCuboid = currentState.cuboids[cuboidIndex];
      const otherCuboids = currentState.cuboids.filter((_, index) => index !== cuboidIndex);

      const [currentRow, currentCol] = movingCuboid.position;
      const [width, depth, height] = movingCuboid.dimensions;

      const rollDirections = [
        { name: 'down', deltaRow: depth, deltaCol: 0, newDimensions: [width, height, depth] },
        { name: 'up', deltaRow: -height, deltaCol: 0, newDimensions: [width, height, depth] },
        { name: 'right', deltaRow: 0, deltaCol: width, newDimensions: [height, depth, width] },
        { name: 'left', deltaRow: 0, deltaCol: -height, newDimensions: [height, depth, width] },
      ];

      for (const direction of rollDirections) {
        const newRow = currentRow + direction.deltaRow;
        const newCol = currentCol + direction.deltaCol;
        const newDimensions = direction.newDimensions.slice();
        const newFootprintCells = getCellsForPositionAndDimensions([newRow, newCol], newDimensions);

        const allCellsPassable = newFootprintCells.every(([row, col]) =>
          isCellPassableInState(row, col, currentState.remainingSpecialTiles),
        );
        if (!allCellsPassable) continue;

        const newFootprintSet = convertCellsToCoordinateSet(newFootprintCells);
        let hasCollision = false;
        for (const otherCuboid of otherCuboids) {
          const otherCuboidSet = convertCellsToCoordinateSet(otherCuboid.cells);
          for (const coord of newFootprintSet) {
            if (otherCuboidSet.has(coord)) {
              hasCollision = true;
              break;
            }
          }
          if (hasCollision) break;
        }
        if (hasCollision) continue;

        const updatedRemainingSpecial = new Set(currentState.remainingSpecialTiles);
        for (const [row, col] of newFootprintCells) {
          const coordinateKey = `${row},${col}`;
          if (updatedRemainingSpecial.has(coordinateKey)) {
            updatedRemainingSpecial.delete(coordinateKey);
          }
        }

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
          action: `C${movingCuboid.id} ${direction.name}`,
        });
      }
    }
    return neighborStates;
  }

  function isGoalState(gameState) {
    if (gameState.remainingSpecialTiles.size > 0) return false;

    if (goalAreas.length === 0) return true;

    const cuboidOccupiedCells = gameState.cuboids.map((cuboid) => convertCellsToCoordinateSet(cuboid.cells));
    const numCuboids = gameState.cuboids.length;

    if (goalAreas.length < numCuboids) return false;

    const bipartiteEdges = Array.from({ length: numCuboids }, () => []);
    for (let cuboidIndex = 0; cuboidIndex < numCuboids; cuboidIndex++) {
      for (let goalIndex = 0; goalIndex < goalAreas.length; goalIndex++) {
        if (cuboidOccupiedCells[cuboidIndex].size !== goalAreas[goalIndex].cellsSet.size) continue;

        let setsAreEqual = true;
        for (const coordinateKey of goalAreas[goalIndex].cellsSet) {
          if (!cuboidOccupiedCells[cuboidIndex].has(coordinateKey)) {
            setsAreEqual = false;
            break;
          }
        }
        if (setsAreEqual) bipartiteEdges[cuboidIndex].push(goalIndex);
      }
    }

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

  function compressActionSequence(actionList, cuboidCount) {
    if (actionList.length === 0) return [];

    const compressedActions = [];
    let currentAction = actionList[0];
    let actionCount = 1;

    const showCuboidId = cuboidCount > 1;

    for (let i = 1; i < actionList.length; i++) {
      if (actionList[i] === currentAction) {
        actionCount++;
      } else {
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
    const searchQueue = [[{ state: startingState, action: null }]];
    const visitedStates = new Set([serializeGameState(startingState)]);

    while (searchQueue.length > 0) {
      const currentPath = searchQueue.shift();
      const currentPathNode = currentPath[currentPath.length - 1];
      const currentState = currentPathNode.state;

      if (isGoalState(currentState)) {
        const solutionActions = currentPath.slice(1).map((pathNode) => pathNode.action);
        return {
          solution: compressActionSequence(solutionActions, cuboidCount),
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

    return { solution: null };
  }

  const result = solvePuzzle();

  if (result.solution) {
    return {
      success: true,
      solution: result.solution.join(' -> '),
    };
  } else {
    return {
      success: false,
    };
  }
}
