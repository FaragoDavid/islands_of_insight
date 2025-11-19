export function solvePhasicDialPuzzle(dialModuli, rawOperations, initialState) {
  const startTime = performance.now();
  const dialCount = dialModuli.length;

  const operations = rawOperations.split('').reduce((groupedOperations, currentDigit) => {
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

  const targetState = '0'.repeat(dialCount);
  let solutionFound = false;

  while (!solutionFound && Object.keys(visitedStates).length < 100000) {
    const statesToProcess = Object.entries(visitedStates);
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

        if (!visitedStates.hasOwnProperty(newState)) {
          visitedStates[newState] = pathToState + String(operationIndex);
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
    const endTime = performance.now();
    return {
      success: false,
      explored: Object.keys(visitedStates).length,
      time: Math.round(endTime - startTime),
    };
  }

  let solutionOutput = '';
  let currentMoveType = '';
  let moveCount = 0;

  const solutionPath = visitedStates[targetState];
  solutionPath.split('').forEach((moveIndex) => {
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
  const solutionSteps = solutionPath.length;

  return {
    success: true,
    steps: solutionSteps,
    solution: solutionOutput.trim(),
    explored: Object.keys(visitedStates).length,
    time: Math.round(endTime - startTime),
  };
}
