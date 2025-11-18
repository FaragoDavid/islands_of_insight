# Islands of Insight Solvers

A collection of puzzle solvers for the Islands of Insight game, featuring:

- **Phasic Dial Solver**: Solve phasic dial puzzles by finding sequences of moves to reset all dials
- **Rolling Cuboid Solver**: Find optimal moves to roll cuboids and visit all special tiles

## Live Demo

Visit the live solver at: `https://FaragoDavid.github.io/islands_of_insight`

## Local Development

To run the solvers locally:

1. Clone this repository
2. Open `index.html` in your web browser
3. Or use a local server:
   ```bash
   python -m http.server 8000
   # Then visit http://localhost:8000
   ```

## Command Line Usage

### Phasic Dial Solver

```bash
node phasig-dial-solver.js
```

### Rolling Cuboid Solver

```bash
node rolling-cuboid-solver.js
```

## GitHub Pages Setup

To deploy this to GitHub Pages:

1. **Fork or clone this repository** to your GitHub account

2. **Enable GitHub Pages**:

   - Go to your repository settings
   - Scroll down to "Pages" section
   - Under "Source", select "GitHub Actions"

3. **Push to main branch**:

   - The GitHub Actions workflow will automatically deploy
   - Your site will be available at `https://yourusername.github.io/repository-name`

4. **Custom domain** (optional):
   - In repository settings > Pages, add your custom domain
   - Create a `CNAME` file in the root directory with your domain

## File Structure

```
├── index.html                 # Main web interface
├── phasig-dial-solver.js     # Phasic dial puzzle solver
├── rolling-cuboid-solver.js  # Rolling cuboid puzzle solver
├── web-interface.js          # Web UI functionality
├── .github/workflows/        # GitHub Actions deployment
└── README.md                 # This file
```

## Puzzle Formats

### Phasic Dial Puzzle

Format: `moduli|operations|initial_state`

Example: `4656|000112010310|0440`

- 4 dials with moduli [4,6,5,6]
- Operations string defines move sequences
- Initial state: 0440

### Rolling Cuboid Puzzle

Grid format using characters:

- `1-9`: Cuboid height
- `h`: Special tiles that must be visited
- `x`: Blocked tiles
- `g`: Goal positions (optional)
- ` ` (space): Empty tiles

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test the solvers
5. Submit a pull request

## License

This project is open source. Feel free to use and modify as needed.
