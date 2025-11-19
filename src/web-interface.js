import { solvePhasicDialPuzzle } from './solvers/phasic-dial-solver.js';
import { solveCuboidPuzzle } from './solvers/rolling-cuboid-solver.js';

export function solvePhasicDial() {
  const moduli = document.getElementById('dialModuli').value.trim();
  const operations = document.getElementById('dialOperations').value.trim();
  const initialState = document.getElementById('dialInitialState').value.trim();
  const output = document.getElementById('dialOutput');

  if (!moduli || !operations || !initialState) {
    output.innerHTML = '<div class="bg-washed-yellow dark-red pa3 br2 mv2">Please fill in all three fields</div>';
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
          let resultText = `<div class="bg-washed-green dark-green pa3 br2 mv2">Solution found!</div>`;
          resultText += `Steps: ${result.steps}\n`;
          resultText += `Solution: ${result.solution}\n`;
          resultText += `Time: ${result.time}ms`;
          output.innerHTML = resultText;
        } else {
          output.innerHTML = `<div class="bg-washed-yellow dark-red pa3 br2 mv2">No solution found. Explored ${result.explored} states in ${result.time}ms.</div>`;
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
          let resultText = `<div class="bg-washed-green dark-green pa3 br2 mv2">Solution found!</div>`;
          resultText += `Steps: ${result.steps}\n`;
          resultText += `Solution: ${result.solution}\n`;
          resultText += `States explored: ${result.statesExplored}\n`;
          resultText += `Time: ${result.time}ms`;
          output.innerHTML = resultText;
        } else {
          output.innerHTML = `<div class="bg-washed-yellow dark-red pa3 br2 mv2">No solution found. Explored ${result.statesExplored} states in ${result.time}ms.</div>`;
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
    }
  });

  window.solvePhasicDial = solvePhasicDial;
  window.solveCuboidPuzzleUI = solveCuboidPuzzleUI;
}

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeUI);
  } else {
    initializeUI();
  }
}
