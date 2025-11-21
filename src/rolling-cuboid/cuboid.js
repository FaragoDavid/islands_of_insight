export class Cuboid {
  constructor(id, position, dimensions, cells) {
    this.id = id;
    this.position = position;
    this.dimensions = dimensions;
    this.cells = cells;
  }

  clone() {
    return new Cuboid(
      this.id,
      { row: this.position.row, col: this.position.col },
      this.dimensions.slice(),
      this.cells.map((cell) => cell.slice()),
    );
  }

  moveTo(position, dimensions, cells) {
    return new Cuboid(this.id, position, dimensions, cells);
  }
}
