import { solvePhasicDialPuzzle } from './solvers/phasic-dial-solver.js';
import { solveCuboidPuzzle } from './solvers/rolling-cuboid-solver.js';

export { solvePhasicDialPuzzle, solveCuboidPuzzle };

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('Islands of Insight Solvers\n');

  console.log('=== Phasic Dial Solver Demo ===');
  const [dialModuli, rawOperations, initialState] = '4656|000112010310|0440'.split('|');
  try {
    const dialResult = solvePhasicDialPuzzle(dialModuli, rawOperations, initialState);
    if (dialResult.success) {
      console.log(`Solution found in ${dialResult.steps} steps:`);
      console.log(dialResult.solution);
      console.log(`Explored ${dialResult.explored} states in ${dialResult.time}ms\n`);
    } else {
      console.log(`No solution found. Explored ${dialResult.explored} states in ${dialResult.time}ms\n`);
    }
  } catch (error) {
    console.error('Error solving phasic dial:', error.message);
  }

  console.log('=== Rolling Cuboid Solver Demo ===');
  const defaultGrid = `1xxxhhxxx
1xxxhhxxx
1xxxhhxxx
hhhhhhhhh
hhhhhhhhh
hxxxhhhhh
hxxxhhhhh
hhhhhhhhh`.trim();

  try {
    const cuboidResult = solveCuboidPuzzle(defaultGrid);
    if (cuboidResult.success) {
      console.log(`Solution found in ${cuboidResult.steps} steps:`);
      console.log(cuboidResult.solution);
      console.log(`Explored ${cuboidResult.statesExplored} states in ${cuboidResult.time}ms`);
    } else {
      console.log(`No solution found. Explored ${cuboidResult.statesExplored} states in ${cuboidResult.time}ms`);
    }
  } catch (error) {
    console.error('Error solving cuboid puzzle:', error.message);
  }
}
