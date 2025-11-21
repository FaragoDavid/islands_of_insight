import { Cell, Cuboid } from './cuboid.js';

interface GoalArea {
  id: number;
  topLeft: Cell;
  width: number;
  height: number;
  cellsSet: Set<string>;
}

export class GridParser {
  private readonly characterGrid: string[][];
  private readonly gridHeight: number;
  private readonly gridWidth: number;

  constructor(gridInput: string) {
    this.characterGrid = gridInput
      .split('\n')
      .filter((l) => l.trim())
      .map((l) => l.split(''));
    this.gridHeight = this.characterGrid.length;
    this.gridWidth = this.characterGrid[0].length;
  }

  parse() {
    const specialTileCoords = this.extractSpecialTiles();
    const cuboids = this.extractCuboids();
    const goalAreas = this.extractGoalAreas();

    return {
      characterGrid: this.characterGrid,
      cuboids,
      goalAreas,
      specialTileCoords,
    };
  }

  private extractSpecialTiles(): Set<string> {
    const coords = new Set<string>();
    for (let row = 0; row < this.gridHeight; row++) {
      for (let col = 0; col < this.gridWidth; col++) {
        if (this.characterGrid[row][col] === 'h') {
          coords.add(`${row},${col}`);
        }
      }
    }
    return coords;
  }

  private extractCuboids(): Cuboid[] {
    const visitedCells = Array.from({ length: this.gridHeight }, () => Array(this.gridWidth).fill(false));
    const cuboidList: Cuboid[] = [];

    for (let row = 0; row < this.gridHeight; row++) {
      for (let col = 0; col < this.gridWidth; col++) {
        const cellChar = this.characterGrid[row][col];
        if (/[1-9]/.test(cellChar) && !visitedCells[row][col]) {
          const cuboid = this.floodFillCuboid(row, col, cellChar, visitedCells, cuboidList.length + 1);
          cuboidList.push(cuboid);
        }
      }
    }

    return cuboidList;
  }

  private floodFillCuboid(startRow: number, startCol: number, targetChar: string, visitedCells: boolean[][], id: number): Cuboid {
    const searchStack: Cell[] = [[startRow, startCol]];
    visitedCells[startRow][startCol] = true;
    let minRow = startRow,
      maxRow = startRow,
      minCol = startCol,
      maxCol = startCol;

    while (searchStack.length) {
      const [currentRow, currentCol] = searchStack.pop()!;
      minRow = Math.min(minRow, currentRow);
      maxRow = Math.max(maxRow, currentRow);
      minCol = Math.min(minCol, currentCol);
      maxCol = Math.max(maxCol, currentCol);

      const neighborDeltas: Cell[] = [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ];
      for (const [deltaRow, deltaCol] of neighborDeltas) {
        const neighborRow = currentRow + deltaRow;
        const neighborCol = currentCol + deltaCol;
        if (
          this.isWithinBounds(neighborRow, neighborCol) &&
          !visitedCells[neighborRow][neighborCol] &&
          this.characterGrid[neighborRow][neighborCol] === targetChar
        ) {
          visitedCells[neighborRow][neighborCol] = true;
          searchStack.push([neighborRow, neighborCol]);
        }
      }
    }

    const cuboidWidth = maxCol - minCol + 1;
    const cuboidDepth = maxRow - minRow + 1;
    const cuboidHeight = Number(targetChar);

    const cells: Cell[] = [];
    for (let row = minRow; row <= maxRow; row++) {
      for (let col = minCol; col <= maxCol; col++) {
        cells.push([row, col]);
      }
    }

    return new Cuboid(id, { row: minRow, col: minCol }, [cuboidWidth, cuboidDepth, cuboidHeight], cells);
  }

  private extractGoalAreas(): GoalArea[] {
    const visitedCells = Array.from({ length: this.gridHeight }, () => Array(this.gridWidth).fill(false));
    const goalAreas: GoalArea[] = [];

    for (let row = 0; row < this.gridHeight; row++) {
      for (let col = 0; col < this.gridWidth; col++) {
        if (this.characterGrid[row][col] === 'g' && !visitedCells[row][col]) {
          const goalArea = this.floodFillGoalArea(row, col, visitedCells);
          goalAreas.push({
            id: goalAreas.length + 1,
            ...goalArea,
          });
        }
      }
    }

    return goalAreas;
  }

  private floodFillGoalArea(startRow: number, startCol: number, visitedCells: boolean[][]): Omit<GoalArea, 'id'> {
    const searchStack: Cell[] = [[startRow, startCol]];
    visitedCells[startRow][startCol] = true;
    const cellComponents: Cell[] = [];
    let minRow = startRow,
      maxRow = startRow,
      minCol = startCol,
      maxCol = startCol;

    while (searchStack.length) {
      const [currentRow, currentCol] = searchStack.pop()!;
      cellComponents.push([currentRow, currentCol]);
      minRow = Math.min(minRow, currentRow);
      maxRow = Math.max(maxRow, currentRow);
      minCol = Math.min(minCol, currentCol);
      maxCol = Math.max(maxCol, currentCol);

      const neighborDeltas: Cell[] = [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ];
      for (const [deltaRow, deltaCol] of neighborDeltas) {
        const neighborRow = currentRow + deltaRow;
        const neighborCol = currentCol + deltaCol;
        if (
          this.isWithinBounds(neighborRow, neighborCol) &&
          !visitedCells[neighborRow][neighborCol] &&
          this.characterGrid[neighborRow][neighborCol] === 'g'
        ) {
          visitedCells[neighborRow][neighborCol] = true;
          searchStack.push([neighborRow, neighborCol]);
        }
      }
    }

    const width = maxCol - minCol + 1;
    const height = maxRow - minRow + 1;
    const cellsSet = new Set(cellComponents.map(([a, b]) => `${a},${b}`));

    return {
      topLeft: [minRow, minCol],
      width,
      height,
      cellsSet,
    };
  }

  private isWithinBounds(row: number, col: number): boolean {
    return row >= 0 && row < this.gridHeight && col >= 0 && col < this.gridWidth;
  }
}
