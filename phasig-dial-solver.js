'use strict';

// Browser-compatible phasic dial solver
function solvePhasicDialPuzzle(dialModuli, rawOperations, initialState) {
  const startTime = performance.now();
  const dialCount = dialModuli.length;

  const operations = rawOperations.split``.reduce((groupedOperations, currentDigit, _, rawOperations) => {
    if (rawOperations.length % dialCount !== 0) {
      throw new Error('Operations length is not a multiple of dial count');
    }

    const lastGroup = groupedOperations[groupedOperations.length - 1];
    if (!lastGroup || lastGroup.length === dialCount) {
      groupedOperations.push(currentDigit);
    } else {
      groupedOperations[groupedOperations.length - 1] += currentDigit;
    }

    return groupedOperations;
  }, []);

  let visitedStates = {
    [initialState]: '',
  };

  if (initialState.length !== dialCount) {
    throw new Error('First visited state dial count and total dial count does not match');
  }

  let solutionFound = false;
  while (!solutionFound) {
    Object.entries(visitedStates).forEach(([currentState, pathToState]) => {
      if (!solutionFound) {
        let dialPositions = currentState.split``.map(Number);

        operations.forEach((operation, operationIndex) => {
          const dialIncrements = operation.split``.map(Number);

          let newDialPositions = dialModuli
            .split('')
            .map((modulus, dialIndex) => (dialPositions[dialIndex] + dialIncrements[dialIndex]) % Number(modulus));

          if (visitedStates[newDialPositions.join``]) {
            return;
          }

          visitedStates[newDialPositions.join``] = visitedStates[currentState] + String(operationIndex);
        });
      }

      if (visitedStates['0'.repeat(dialCount)]) {
        solutionFound = true;
      }
    });
  }

  let solutionOutput = '';
  let currentMoveType = '';
  let moveCount = 0;
  visitedStates['0'.repeat(dialCount)].split('').forEach((moveIndex, position, allMoves) => {
    if (moveIndex === currentMoveType) {
      moveCount++;
    } else {
      if (moveCount > 0) {
        solutionOutput += `Move ${currentMoveType}, ${moveCount} times\n`;
      }
      currentMoveType = moveIndex;
      moveCount = 1;
    }
  });
  if (moveCount > 0) {
    solutionOutput += `Move ${currentMoveType}, ${moveCount} times\n`;
  }

  const endTime = performance.now();
  const solutionSteps = visitedStates['0'.repeat(dialCount)].length;

  return {
    success: true,
    steps: solutionSteps,
    solution: solutionOutput.trim(),
    explored: Object.keys(visitedStates).length,
    time: Math.round(endTime - startTime),
  };
}

// Node.js compatibility
if (typeof module !== 'undefined' && module.exports) {
  // Default example for Node.js
  const [dialModuli, rawOperations, initialState] = '4656|000112010310|0440'.split('|');
  const result = solvePhasicDialPuzzle(dialModuli, rawOperations, initialState);
  console.log(`Solution:\n${result.solution}`);
}
