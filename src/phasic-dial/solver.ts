import type { SolverResult } from '../solver-result.js';

const TARGET_DIAL_STATE = '0';

export function solvePhasicDialPuzzle(dialModuli: string, rawOperations: string, initialState: string): SolverResult {
  const dialCount = dialModuli.length;

  if (rawOperations.length % dialCount !== 0) {
    throw new Error('Operations length is not a multiple of dial count');
  }

  if (initialState.length !== dialCount) {
    throw new Error('First visited state dial count and total dial count does not match');
  }

  const operations = parseOperations(rawOperations, dialCount);
  const targetState = TARGET_DIAL_STATE.repeat(dialCount);

  const visitedStates = new Map<string, string>();
  visitedStates.set(initialState, '');

  let solutionFound = false;

  while (!solutionFound && visitedStates.size < 100000) {
    const statesToProcess = Array.from(visitedStates.entries());
    let newStatesFound = false;

    for (const [currentState, pathToState] of statesToProcess) {
      if (solutionFound) break;

      const dialPositions = currentState.split('').map(Number);

      for (let operationIndex = 0; operationIndex < operations.length; operationIndex++) {
        const operation = operations[operationIndex];
        const dialIncrements = operation.split('').map(Number);

        const newDialPositions = dialModuli
          .split('')
          .map((modulus, dialIndex) => (dialPositions[dialIndex] + dialIncrements[dialIndex]) % Number(modulus));

        const newState = newDialPositions.join('');

        if (!visitedStates.has(newState)) {
          visitedStates.set(newState, pathToState + String(operationIndex));
          newStatesFound = true;

          if (newState === targetState) {
            solutionFound = true;
            break;
          }
        }
      }
    }

    if (!newStatesFound && !solutionFound) {
      break;
    }
  }

  if (!solutionFound) {
    return {
      success: false,
    };
  }

  const solutionPath = visitedStates.get(targetState)!;
  const solution = compressMoves(solutionPath);

  return {
    success: true,
    solution,
  };
}

function parseOperations(rawOperations: string, dialCount: number): string[] {
  const operations: string[] = [];

  for (let i = 0; i < rawOperations.length; i += dialCount) {
    operations.push(rawOperations.slice(i, i + dialCount));
  }

  return operations;
}

function compressMoves(solutionPath: string): string[] {
  if (solutionPath.length === 0) return [];

  const moves: string[] = [];
  let currentMoveType = solutionPath[0];
  let moveCount = 1;

  for (let i = 1; i < solutionPath.length; i++) {
    if (solutionPath[i] === currentMoveType) {
      moveCount++;
    } else {
      moves.push(`Move ${currentMoveType}, ${moveCount} times`);
      currentMoveType = solutionPath[i];
      moveCount = 1;
    }
  }

  moves.push(`Move ${currentMoveType}, ${moveCount} times`);
  return moves;
}
