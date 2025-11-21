import { solvePhasicDialPuzzle } from './phasic-dial/solver.js';
import { solveCuboidPuzzle } from './rolling-cuboid/solver.js';

const PHASIC_DIAL_DEBOUNCE_MS = 500;
const CUBOID_DEBOUNCE_MS = 1000;

let dialSolverTimeout: ReturnType<typeof setTimeout> | null = null;
let cuboidSolverTimeout: ReturnType<typeof setTimeout> | null = null;

export function solvePhasicDialAuto(): void {
  if (dialSolverTimeout) {
    clearTimeout(dialSolverTimeout);
  }

  dialSolverTimeout = setTimeout(() => {
    solvePhasicDial();
  }, PHASIC_DIAL_DEBOUNCE_MS);
}

export function solveCuboidPuzzleAuto(): void {
  if (cuboidSolverTimeout) {
    clearTimeout(cuboidSolverTimeout);
  }

  cuboidSolverTimeout = setTimeout(() => {
    solveCuboidPuzzleUI();
  }, CUBOID_DEBOUNCE_MS);
}

export function solvePhasicDial(): void {
  const moduliInput = document.getElementById('dialModuli') as HTMLInputElement | null;
  const operationsInput = document.getElementById('dialOperations') as HTMLInputElement | null;
  const initialStateInput = document.getElementById('dialInitialState') as HTMLInputElement | null;
  const output = document.getElementById('dialOutput');

  if (!moduliInput || !operationsInput || !initialStateInput || !output) return;

  const moduli = moduliInput.value.trim();
  const operations = operationsInput.value.trim();
  const initialState = initialStateInput.value.trim();

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

        if (result.success && Array.isArray(result.solution)) {
          output.innerHTML = result.solution.join('<br>');
        } else {
          output.innerHTML = `<div class="bg-washed-yellow dark-red pa3 br2 mv2">No solution found.</div>`;
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        output.innerHTML = `<div class="bg-washed-yellow dark-red pa3 br2 mv2">Error: ${message}</div>`;
      }
    }, 10);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    output.innerHTML = `<div class="bg-washed-yellow dark-red pa3 br2 mv2">Error: ${message}</div>`;
  }
}

export function solveCuboidPuzzleUI(): void {
  const inputElement = document.getElementById('gridInput') as HTMLTextAreaElement | null;
  const output = document.getElementById('cuboidOutput');

  if (!inputElement || !output) return;

  const input = inputElement.value.trim();

  if (!input) {
    output.innerHTML = 'Enter grid layout to solve...';
    return;
  }

  if (!/^[1-9hxg\-\n]+$/.test(input)) {
    output.innerHTML =
      '<div class="bg-washed-yellow dark-red pa3 br2 mv2">Grid must only contain digits 1-9, h, x, g, dashes (-), and newlines</div>';
    return;
  }

  if (!/[1-9]/.test(input)) {
    output.innerHTML = 'Add at least one cuboid (digits 1-9) to start solving...';
    return;
  }

  try {
    output.innerHTML = '<div class="gray i">Solving puzzle...</div>';

    setTimeout(() => {
      try {
        const result = solveCuboidPuzzle(input);

        if (result.success && typeof result.solution === 'string') {
          output.innerHTML = result.solution;
        } else {
          output.innerHTML = `<div class="bg-washed-yellow dark-red pa3 br2 mv2">No solution found.</div>`;
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        output.innerHTML = `<div class="bg-washed-yellow dark-red pa3 br2 mv2">Error: ${message}</div>`;
      }
    }, 10);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    output.innerHTML = `<div class="bg-washed-yellow dark-red pa3 br2 mv2">Error: ${message}</div>`;
  }
}

export function initializeUI(): void {
  const dialInputs = ['dialModuli', 'dialOperations', 'dialInitialState'];

  dialInputs.forEach((inputId, index) => {
    const input = document.getElementById(inputId) as HTMLInputElement | null;
    if (input) {
      input.addEventListener('keydown', function (e: KeyboardEvent) {
        if (e.key === 'Tab') {
          e.preventDefault();
          const nextIndex = e.shiftKey ? (index - 1 + dialInputs.length) % dialInputs.length : (index + 1) % dialInputs.length;
          const nextInput = document.getElementById(dialInputs[nextIndex]) as HTMLInputElement | null;
          if (nextInput) {
            nextInput.focus();
            nextInput.select();
          }
        }
      });

      input.addEventListener('input', solvePhasicDialAuto);
      input.addEventListener('paste', () => {
        setTimeout(solvePhasicDialAuto, 10);
      });
    }
  });

  const gridInput = document.getElementById('gridInput') as HTMLTextAreaElement | null;
  if (gridInput) {
    gridInput.addEventListener('input', solveCuboidPuzzleAuto);
    gridInput.addEventListener('paste', () => {
      setTimeout(solveCuboidPuzzleAuto, 10);
    });
  }

  (window as any).solvePhasicDial = solvePhasicDial;
  (window as any).solvePhasicDialAuto = solvePhasicDialAuto;
  (window as any).solveCuboidPuzzleUI = solveCuboidPuzzleUI;
  (window as any).solveCuboidPuzzleAuto = solveCuboidPuzzleAuto;
}

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeUI);
  } else {
    initializeUI();
  }
}
