import { test, describe } from 'node:test';
import { strict as assert } from 'node:assert';
import { solvePhasicDialPuzzle } from '../dist/phasic-dial/solver.js';

describe('Phasic Dial Solver', () => {
  test('should solve simple puzzle', () => {
    const moduli = '44';
    const operations = '1011';
    const initialState = '12';

    const result = solvePhasicDialPuzzle(moduli, operations, initialState);

    assert.strictEqual(result.success, true);
    assert(Array.isArray(result.solution));
    assert(result.solution && result.solution.length > 0);
  });

  test('should handle puzzle with no solution', () => {
    const moduli = '22';
    const operations = '1010';
    const initialState = '11';

    const result = solvePhasicDialPuzzle(moduli, operations, initialState);

    assert(typeof result.success === 'boolean');
  });

  test('should validate input lengths', () => {
    const moduli = '444';
    const operations = '111111';
    const initialState = '12';

    assert.throws(() => {
      solvePhasicDialPuzzle(moduli, operations, initialState);
    }, /First visited state dial count and total dial count does not match/);
  });

  test('should validate operations length', () => {
    const moduli = '44';
    const operations = '111';
    const initialState = '12';

    assert.throws(() => {
      solvePhasicDialPuzzle(moduli, operations, initialState);
    }, /Operations length is not a multiple of dial count/);
  });

  test('should solve the default example', () => {
    const [dialModuli, rawOperations, initialState] = '4656|000112010310|0440'.split('|');

    const result = solvePhasicDialPuzzle(dialModuli, rawOperations, initialState);

    assert.strictEqual(result.success, true);
    assert(Array.isArray(result.solution));
    assert(result.solution && result.solution.length > 0);
    assert(result.solution && result.solution[0].includes('Move'));
  });
});
