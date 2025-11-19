import { solvePhasicDialPuzzle } from './solvers/phasic-dial-solver.js';
import { solveCuboidPuzzle } from './solvers/rolling-cuboid-solver.js';

export function solvePhasicDial() {
  const moduli = document.getElementById('dialModuli').value.trim();
  const operations = document.getElementById('dialOperations').value.trim();
  const initialState = document.getElementById('dialInitialState').value.trim();
  const output = document.getElementById('dialOutput');

  if (!moduli || !operations || !initialState) {
    output.innerHTML = '<div class="error">Please fill in all three fields</div>';
    return;
  }

  try {
    if (moduli.length !== initialState.length) {
      throw new Error('Number of moduli must match number of initial state values');
    }

    output.innerHTML = '<div>Solving puzzle...</div>';

    setTimeout(() => {
      try {
        const result = solvePhasicDialPuzzle(moduli, operations, initialState);

        if (result.success) {
          let resultText = `<div class="success">Solution found!</div>`;
          resultText += `Steps: ${result.steps}\n`;
          resultText += `Solution: ${result.solution}\n`;
          resultText += `Time: ${result.time}ms`;
          output.innerHTML = resultText;
        } else {
          output.innerHTML = `<div class="error">No solution found. Explored ${result.explored} states in ${result.time}ms.</div>`;
        }
      } catch (error) {
        output.innerHTML = `<div class="error">Error: ${error.message}</div>`;
      }
    }, 10);
  } catch (error) {
    output.innerHTML = `<div class="error">Error: ${error.message}</div>`;
  }
}

export function clearDialOutput() {
  document.getElementById('dialOutput').innerHTML = 'Ready to solve phasic dial puzzles...';
}

export function clearDialInputs() {
  document.getElementById('dialModuli').value = '';
  document.getElementById('dialOperations').value = '';
  document.getElementById('dialInitialState').value = '';
  clearDialOutput();
}

export function solveCuboidPuzzleUI() {
  const input = document.getElementById('gridInput').value.trim();
  const output = document.getElementById('cuboidOutput');

  if (!input) {
    output.innerHTML = '<div class="error">Please enter a grid layout</div>';
    return;
  }

  try {
    output.innerHTML = '<div>Solving puzzle...</div>';

    setTimeout(() => {
      try {
        const result = solveCuboidPuzzle(input);

        if (result.success) {
          let resultText = `<div class="success">Solution found!</div>`;
          resultText += `Steps: ${result.steps}\n`;
          resultText += `Solution: ${result.solution}\n`;
          resultText += `States explored: ${result.statesExplored}\n`;
          resultText += `Time: ${result.time}ms`;
          output.innerHTML = resultText;
        } else {
          output.innerHTML = `<div class="error">No solution found. Explored ${result.statesExplored} states in ${result.time}ms.</div>`;
        }
      } catch (error) {
        output.innerHTML = `<div class="error">Error: ${error.message}</div>`;
      }
    }, 10);
  } catch (error) {
    output.innerHTML = `<div class="error">Error: ${error.message}</div>`;
  }
}

export function clearCuboidOutput() {
  document.getElementById('cuboidOutput').innerHTML = 'Ready to solve cuboid puzzles...';
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
    }
  });

  window.solvePhasicDial = solvePhasicDial;
  window.clearDialOutput = clearDialOutput;
  window.clearDialInputs = clearDialInputs;
  window.solveCuboidPuzzleUI = solveCuboidPuzzleUI;
  window.clearCuboidOutput = clearCuboidOutput;
}

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeUI);
  } else {
    initializeUI();
  }
}
