import { solvePhasicDialPuzzle } from './solvers/phasic-dial-solver.js';
import { solveCuboidPuzzle } from './solvers/rolling-cuboid-solver.js';

let dialSolverTimeout = null;

export function solvePhasicDialAuto() {
  if (dialSolverTimeout) {
    clearTimeout(dialSolverTimeout);
  }

  dialSolverTimeout = setTimeout(() => {
    solvePhasicDial();
  }, 500);
}

export function solvePhasicDial() {
  const moduli = document.getElementById('dialModuli').value.trim();
  const operations = document.getElementById('dialOperations').value.trim();
  const initialState = document.getElementById('dialInitialState').value.trim();
  const output = document.getElementById('dialOutput');

  if (!moduli || !operations || !initialState) {
    output.innerHTML = 'Enter dial moduli, operations, and initial state to solve...';
    return;
  }

  if (!/^[0-9]+$/.test(moduli)) {
    output.innerHTML = '<div class="bg-washed-yellow dark-red pa3 br2 mv2">Dial moduli must contain only digits</div>';
    return;
  }

  if (!/^[0-9]+$/.test(operations)) {
    output.innerHTML = '<div class="bg-washed-yellow dark-red pa3 br2 mv2">Operations must contain only digits</div>';
    return;
  }

  if (!/^[0-9]+$/.test(initialState)) {
    output.innerHTML = '<div class="bg-washed-yellow dark-red pa3 br2 mv2">Initial state must contain only digits</div>';
    return;
  }

  if (moduli.length !== initialState.length) {
    output.innerHTML =
      '<div class="bg-washed-yellow dark-red pa3 br2 mv2">Number of moduli must match number of initial state values</div>';
    return;
  }

  if (operations.length % moduli.length !== 0) {
    output.innerHTML = '<div class="bg-washed-yellow dark-red pa3 br2 mv2">Operations length must be a multiple of dial count</div>';
    return;
  }

  try {
    output.innerHTML = '<div class="gray i">Solving puzzle...</div>';

    setTimeout(() => {
      try {
        const result = solvePhasicDialPuzzle(moduli, operations, initialState);

        if (result.success) {
          output.innerHTML = result.solution;
        } else {
          output.innerHTML = `<div class="bg-washed-yellow dark-red pa3 br2 mv2">No solution found.</div>`;
        }
      } catch (error) {
        output.innerHTML = `<div class="bg-washed-yellow dark-red pa3 br2 mv2">Error: ${error.message}</div>`;
      }
    }, 10);
  } catch (error) {
    output.innerHTML = `<div class="bg-washed-yellow dark-red pa3 br2 mv2">Error: ${error.message}</div>`;
  }
}

export function solveCuboidPuzzleUI() {
  const input = document.getElementById('gridInput').value.trim();
  const output = document.getElementById('cuboidOutput');

  if (!input) {
    output.innerHTML = '<div class="bg-washed-yellow dark-red pa3 br2 mv2">Please enter a grid layout</div>';
    return;
  }

  try {
    output.innerHTML = '<div>Solving puzzle...</div>';

    setTimeout(() => {
      try {
        const result = solveCuboidPuzzle(input);

        if (result.success) {
          output.innerHTML = result.solution;
        } else {
          output.innerHTML = `<div class="bg-washed-yellow dark-red pa3 br2 mv2">No solution found.</div>`;
        }
      } catch (error) {
        output.innerHTML = `<div class="bg-washed-yellow dark-red pa3 br2 mv2">Error: ${error.message}</div>`;
      }
    }, 10);
  } catch (error) {
    output.innerHTML = `<div class="bg-washed-yellow dark-red pa3 br2 mv2">Error: ${error.message}</div>`;
  }
}

export function initializeUI() {
  const dialInputs = ['dialModuli', 'dialOperations', 'dialInitialState'];

  dialInputs.forEach((inputId, index) => {
    const input = document.getElementById(inputId);
    if (input) {
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Tab') {
          e.preventDefault();
          const nextIndex = (index + 1) % dialInputs.length;
          const nextInput = document.getElementById(dialInputs[nextIndex]);
          if (nextInput) {
            nextInput.focus();
          }
        }
      });

      input.addEventListener('input', solvePhasicDialAuto);
      input.addEventListener('paste', () => {
        setTimeout(solvePhasicDialAuto, 10);
      });
    }
  });

  window.solvePhasicDial = solvePhasicDial;
  window.solvePhasicDialAuto = solvePhasicDialAuto;
  window.solveCuboidPuzzleUI = solveCuboidPuzzleUI;
}

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeUI);
  } else {
    initializeUI();
  }
}
