import { GameState } from './game-state.js';
import { Cuboid } from './cuboid.js';

export function solveCuboidPuzzle(gridInput) {
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
          position: { row: minRow, col: minCol },
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

  let initialGameState = new GameState(
    cuboidList.map((cuboid) => new Cuboid(cuboid.id, cuboid.position, cuboid.dimensions, cuboid.cells)),
    new Set(originalSpecialTileCoords),
    goalAreas,
    characterGrid,
  );

  for (const cuboid of initialGameState.cuboids) {
    const coveredCells = initialGameState.convertCellsToCoordinateSet(cuboid.cells);
    for (const specialCoord of [...initialGameState.remainingSpecialTiles]) {
      if (coveredCells.has(specialCoord)) {
        initialGameState.remainingSpecialTiles.delete(specialCoord);
      }
    }
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
    const startTime = performance.now();
    const startingState = initialGameState;
    const cuboidCount = startingState.cuboids.length;
    const searchQueue = [[{ state: startingState, action: null }]];
    const visitedStates = new Set([startingState.serialize()]);

    while (searchQueue.length > 0) {
      const currentPath = searchQueue.shift();
      const currentPathNode = currentPath[currentPath.length - 1];
      const currentState = currentPathNode.state;

      if (currentState.isGoal()) {
        const solutionActions = currentPath.slice(1).map((pathNode) => pathNode.action);
        const endTime = performance.now();
        return {
          solution: compressActionSequence(solutionActions, cuboidCount),
          statesExplored: visitedStates.size,
          time: endTime - startTime,
        };
      }

      const neighborStates = currentState.generateNeighborStates();
      for (const neighborState of neighborStates) {
        const stateKey = neighborState.state.serialize();
        if (!visitedStates.has(stateKey)) {
          visitedStates.add(stateKey);
          searchQueue.push([...currentPath, neighborState]);
        }
      }
    }

    const endTime = performance.now();
    return {
      solution: null,
      statesExplored: visitedStates.size,
      time: endTime - startTime,
    };
  }

  const result = solvePuzzle();

  if (result.solution) {
    return {
      success: true,
      solution: result.solution.join(' -> '),
      steps: result.solution.length,
      statesExplored: result.statesExplored,
      time: result.time,
    };
  } else {
    return {
      success: false,
      statesExplored: result.statesExplored,
      time: result.time,
    };
  }
}
