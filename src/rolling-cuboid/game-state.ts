import { Cuboid, Position, Dimensions, Cell } from './cuboid.js';

interface GoalArea {
  id: number;
  topLeft: Cell;
  width: number;
  height: number;
  cellsSet: Set<string>;
}

interface RollDirection {
  name: string;
  deltaRow: number;
  deltaCol: number;
  newDimensions: Dimensions;
}

interface NeighborState {
  state: GameState;
  action: string;
}

export class GameState {
  public readonly gridHeight: number;
  public readonly gridWidth: number;
  public readonly originalSpecialTileCoords: Set<string>;

  constructor(
    public readonly cuboids: Cuboid[],
    public readonly remainingSpecialTiles: Set<string>,
    public readonly goalAreas: GoalArea[],
    public readonly characterGrid: string[][],
  ) {
    this.gridHeight = characterGrid.length;
    this.gridWidth = characterGrid[0].length;

    this.originalSpecialTileCoords = new Set();
    for (let row = 0; row < this.gridHeight; row++) {
      for (let col = 0; col < this.gridWidth; col++) {
        if (characterGrid[row][col] === 'h') {
          this.originalSpecialTileCoords.add(`${row},${col}`);
        }
      }
    }

    // Remove special tiles that are already covered by cuboids at initialization
    for (const cuboid of this.cuboids) {
      const coveredCells = this.convertCellsToCoordinateSet(cuboid.cells);
      for (const specialCoord of [...this.remainingSpecialTiles]) {
        if (coveredCells.has(specialCoord)) {
          this.remainingSpecialTiles.delete(specialCoord);
        }
      }
    }
  }

  serialize(): string {
    const cuboidDescriptions = this.cuboids
      .map((cuboid) => `${cuboid.position.row},${cuboid.position.col}|${cuboid.dimensions.join(',')}`)
      .join(';');
    const specialTileKeys = [...this.remainingSpecialTiles].sort().join(';');
    return `${cuboidDescriptions}|${specialTileKeys}`;
  }

  isGoal(): boolean {
    if (this.remainingSpecialTiles.size > 0) return false;

    if (this.goalAreas.length === 0) return true;

    // Collect all goal cells into a single set
    const allGoalCells = new Set<string>();
    for (const goalArea of this.goalAreas) {
      for (const cell of goalArea.cellsSet) {
        allGoalCells.add(cell);
      }
    }

    // Collect all cells covered by all cuboids
    const allCuboidCells = new Set<string>();
    for (const cuboid of this.cuboids) {
      for (const cell of cuboid.cells) {
        allCuboidCells.add(`${cell[0]},${cell[1]}`);
      }
    }

    // Check if all goal cells are covered
    for (const goalCell of allGoalCells) {
      if (!allCuboidCells.has(goalCell)) {
        return false;
      }
    }

    // Check if any non-goal cells are covered
    for (const cuboidCell of allCuboidCells) {
      if (!allGoalCells.has(cuboidCell)) {
        return false;
      }
    }

    return true;
  }

  isWithinGridBounds(row: number, col: number): boolean {
    return row >= 0 && row < this.gridHeight && col >= 0 && col < this.gridWidth;
  }

  getCellsForPositionAndDimensions(position: Position, dimensions: Dimensions): Cell[] {
    const { row: startRow, col: startCol } = position;
    const [width, depth] = dimensions;
    const occupiedCells: Cell[] = [];
    for (let deltaRow = 0; deltaRow < depth; deltaRow++) {
      for (let deltaCol = 0; deltaCol < width; deltaCol++) {
        occupiedCells.push([startRow + deltaRow, startCol + deltaCol]);
      }
    }
    return occupiedCells;
  }

  convertCellsToCoordinateSet(cellList: Cell[]): Set<string> {
    return new Set(cellList.map(([row, col]) => `${row},${col}`));
  }

  isCellPassableInState(row: number, col: number, remainingSpecialTiles: Set<string>): boolean {
    if (!this.isWithinGridBounds(row, col)) return false;
    const cellCharacter = this.characterGrid[row][col];
    if (cellCharacter === 'x') return false;
    if (cellCharacter === ' ') return false;

    const coordinateKey = `${row},${col}`;
    if (this.originalSpecialTileCoords.has(coordinateKey) && !remainingSpecialTiles.has(coordinateKey)) {
      return false;
    }
    return true;
  }

  rollingCuboidRollCollides(rollingCuboid: Cuboid, direction: RollDirection, otherCuboids: Cuboid[]): boolean {
    const { row: currentRow, col: currentCol } = rollingCuboid.position;

    const newFootprintCells = this.getCellsForPositionAndDimensions(
      { row: currentRow + direction.deltaRow, col: currentCol + direction.deltaCol },
      [...direction.newDimensions] as Dimensions,
    );

    const allCellsPassable = newFootprintCells.every(([row, col]) => this.isCellPassableInState(row, col, this.remainingSpecialTiles));
    if (!allCellsPassable) return true;

    const newFootprintSet = this.convertCellsToCoordinateSet(newFootprintCells);
    for (const otherCuboid of otherCuboids) {
      const otherCuboidSet = this.convertCellsToCoordinateSet(otherCuboid.cells);
      for (const coord of newFootprintSet) {
        if (otherCuboidSet.has(coord)) {
          return true;
        }
      }
    }

    return false;
  }

  rollCuboid(cuboidIndex: number, direction: RollDirection): NeighborState {
    const movingCuboid = this.cuboids[cuboidIndex];
    const { row: currentRow, col: currentCol } = movingCuboid.position;

    const newRow = currentRow + direction.deltaRow;
    const newCol = currentCol + direction.deltaCol;
    const newDimensions = [...direction.newDimensions] as Dimensions;
    const newFootprintCells = this.getCellsForPositionAndDimensions({ row: newRow, col: newCol }, newDimensions);

    const updatedRemainingSpecial = new Set(this.remainingSpecialTiles);
    for (const [row, col] of newFootprintCells) {
      const coordinateKey = `${row},${col}`;
      if (updatedRemainingSpecial.has(coordinateKey)) {
        updatedRemainingSpecial.delete(coordinateKey);
      }
    }

    const updatedCuboids = this.cuboids.map((cuboid, index) =>
      index === cuboidIndex ? cuboid.moveTo({ row: newRow, col: newCol }, newDimensions, newFootprintCells) : cuboid.clone(),
    );

    return {
      state: new GameState(updatedCuboids, updatedRemainingSpecial, this.goalAreas, this.characterGrid),
      action: `C${movingCuboid.id} ${direction.name}`,
    };
  }

  generateNeighborStates(): NeighborState[] {
    const neighborStates: NeighborState[] = [];

    for (let cuboidIndex = 0; cuboidIndex < this.cuboids.length; cuboidIndex++) {
      const rollingCuboid = this.cuboids[cuboidIndex];
      const [width, depth, height] = rollingCuboid.dimensions;
      const otherCuboids = this.cuboids.filter((_, index) => index !== cuboidIndex);

      const rollDirections: RollDirection[] = [
        { name: 'down', deltaRow: depth, deltaCol: 0, newDimensions: [width, height, depth] },
        { name: 'up', deltaRow: -height, deltaCol: 0, newDimensions: [width, height, depth] },
        { name: 'right', deltaRow: 0, deltaCol: width, newDimensions: [height, depth, width] },
        { name: 'left', deltaRow: 0, deltaCol: -height, newDimensions: [height, depth, width] },
      ];

      for (const direction of rollDirections) {
        if (!this.rollingCuboidRollCollides(rollingCuboid, direction, otherCuboids)) {
          neighborStates.push(this.rollCuboid(cuboidIndex, direction));
        }
      }
    }
    return neighborStates;
  }
}
