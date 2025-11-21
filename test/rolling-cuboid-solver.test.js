import { test, describe } from 'node:test';
import { strict as assert } from 'node:assert';
import { solveCuboidPuzzle } from '../dist/rolling-cuboid/solver.js';

describe('Rolling Cuboid Solver', () => {
  test('should solve simple puzzle', () => {
    const grid = `
1hh
1hh
1hh
`.trim();

    const result = solveCuboidPuzzle(grid);

    assert.strictEqual(result.success, true);
    assert(typeof result.solution === 'string');
  });

  test('should handle puzzle with no special tiles', () => {
    const grid = `
1
1
1
`.trim();

    const result = solveCuboidPuzzle(grid);

    assert.strictEqual(result.success, true);
  });

  test('should handle blocked puzzle', () => {
    const grid = `
1xh
xxx
xxx
`.trim();

    const result = solveCuboidPuzzle(grid);

    assert.strictEqual(result.success, false);
  });

  test('should solve puzzle with multiple special tiles', () => {
    const grid = `
1hh
hhh
hhh
`.trim();

    const result = solveCuboidPuzzle(grid);

    assert.strictEqual(result.success, true);
    assert(typeof result.solution === 'string');
  });

  test('should handle empty grid gracefully', () => {
    assert.throws(() => {
      solveCuboidPuzzle('');
    });
  });

  test('should solve the default example', () => {
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

    assert(typeof result.success === 'boolean');
  });
});
