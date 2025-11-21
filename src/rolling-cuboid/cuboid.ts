export interface Position {
  row: number;
  col: number;
}

export type Dimensions = [width: number, depth: number, height: number];
export type Cell = [row: number, col: number];

export class Cuboid {
  constructor(
    public readonly id: number,
    public readonly position: Position,
    public readonly dimensions: Dimensions,
    public readonly cells: Cell[],
  ) {}

  clone(): Cuboid {
    return new Cuboid(
      this.id,
      { row: this.position.row, col: this.position.col },
      [...this.dimensions] as Dimensions,
      this.cells.map((cell) => [...cell] as Cell),
    );
  }

  moveTo(position: Position, dimensions: Dimensions, cells: Cell[]): Cuboid {
    return new Cuboid(this.id, position, dimensions, cells);
  }
}
