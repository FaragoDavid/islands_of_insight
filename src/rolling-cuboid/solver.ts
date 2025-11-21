import { GameState } from './game-state.js';
import { compressActionSequence } from './action-compressor.js';
import { GridParser } from './grid-parser.js';
import type { SolverResult } from '../solver-result.js';

interface PathNode {
  state: GameState;
  action: string | null;
}

export function solveCuboidPuzzle(gridInput: string): SolverResult {
  const parser = new GridParser(gridInput);
  const { characterGrid, cuboids, goalAreas, specialTileCoords } = parser.parse();

  const startingState = new GameState(cuboids, new Set(specialTileCoords), goalAreas, characterGrid);
  const searchQueue: PathNode[][] = [[{ state: startingState, action: null }]];
  const visitedStates = new Set([startingState.serialize()]);

  while (searchQueue.length > 0) {
    const currentPath = searchQueue.shift()!;
    const currentPathNode = currentPath[currentPath.length - 1];
    const currentState = currentPathNode.state;

    if (currentState.isGoal()) {
      const solutionActions = currentPath.slice(1).map((pathNode) => pathNode.action!);
      return {
        success: true,
        solution: compressActionSequence(solutionActions, startingState.cuboids.length).join(' -> '),
      };
    }

    for (const neighborState of currentState.generateNeighborStates()) {
      const stateKey = neighborState.state.serialize();
      if (!visitedStates.has(stateKey)) {
        visitedStates.add(stateKey);
        searchQueue.push([...currentPath, neighborState]);
      }
    }
  }

  return {
    success: false,
  };
}
