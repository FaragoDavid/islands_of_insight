# Islands of Insight Solvers

A Node.js project with puzzle solvers for the Islands of Insight game, featuring:

- **Phasic Dial Solver**: Solve phasic dial puzzles by finding sequences of moves to reset all dials
- **Rolling Cuboid Solver**: Find optimal moves to roll cuboids and visit all special tiles

## Live Demo

Visit the live solver at: https://faragodavid.github.io/islands_of_insight

## Installation

```bash
# Clone the repository
git clone https://github.com/FaragoDavid/islands_of_insight.git
cd islands_of_insight

# Install dependencies (Node.js 18+ required)
npm install
```

## Usage

### Command Line

```bash
# Run the demo solvers
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Serve the web interface locally
npm run serve
```

### Web Interface

Open `index.html` in a modern web browser, or use the local server:

```bash
npm run serve
# Then visit http://localhost:8080
```

### As a Module

```javascript
import { solvePhasicDialPuzzle, solveCuboidPuzzle } from './src/index.js';

// Solve a phasic dial puzzle
const dialResult = solvePhasicDialPuzzle('4656', '000112010310', '0440');
console.log(dialResult);

// Solve a cuboid puzzle
const grid = `1hh\n1hh\n1hh`;
const cuboidResult = solveCuboidPuzzle(grid);
console.log(cuboidResult);
```

## Project Structure

```
├── src/
│   ├── index.js                           # Main entry point
│   ├── web-interface.js                   # Web UI functionality
│   └── solvers/
│       ├── phasic-dial-solver.js         # Phasic dial puzzle solver
│       └── rolling-cuboid-solver.js      # Rolling cuboid puzzle solver
├── test/                                 # Test files
├── public/                              # Static web assets
├── package.json                         # Node.js project configuration
├── index.html                          # Main web interface (root)
└── .github/workflows/                  # GitHub Actions deployment
```

## Puzzle Formats

### Phasic Dial Puzzle

**Input Format:**

- `dialModuli`: String of digits representing each dial's modulus (e.g., "4656")
- `operations`: String of operations grouped by dial count (e.g., "000112010310")
- `initialState`: String representing initial dial positions (e.g., "0440")

**Example:**

```javascript
solvePhasicDialPuzzle('4656', '000112010310', '0440');
```

### Rolling Cuboid Puzzle

**Grid Format:**

- `1-9`: Cuboid height at that position
- `h`: Special tiles that must be visited
- `x`: Blocked/impassable tiles
- `g`: Goal positions where cuboids should end (optional)
- ` ` (space): Empty/passable tiles

**Example:**

```
1xxxhhxxx
1xxxhhxxx
1xxxhhxxx
hhhhhhhhh
```

## Testing

The project uses Node.js built-in test runner:

```bash
# Run all tests
npm test

# Run tests in watch mode during development
npm run test:watch
```

## Development

This project uses ES modules and modern JavaScript features. Requirements:

- Node.js 18+
- Modern web browser with ES module support

## Deployment

The project auto-deploys to GitHub Pages via GitHub Actions when pushing to the main branch.

## License

MIT License - feel free to use and modify as needed.
