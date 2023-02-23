import { Blinky } from "./goasts/Blinky";
import { Pinky } from "./goasts/Pinky";
import { Inky } from "./goasts/Inky";
import { Clyde } from "./goasts/Clyde";
import { PackMan } from "./PackMan";
import { reverseEndian32, Rect, Position, convert1dTo2d } from "./utils";

export type MapColorDictunary = {
  wall: number;
  dot: number;
  packman: number;
  blinky: number;
  pinky: number;
  inky: number;
  clyde: number;
  arrestWarrant: number;
  gate: number;
  base: number;
  upClosed: number;
};
export enum Cell {
  "empty" = 0,
  "wall",
  "dot",
  "packman",
  "blinky",
  "pinky",
  "inky",
  "clyde",
  "arrestWarrant",
  "gate",
  "base",
  "upClosed",
}

export class Map {
  width: number;
  height: number;
  iMax: number;
  jMax: number;
  cells: Cell[][];
  blinky!: Blinky;
  pinky!: Pinky;
  inky!: Inky;
  clyde!: Clyde;
  packman!: PackMan;
  baseRect: Rect;
  gateRect: Rect;
  initialPositions: {
    packman?: Position;
    blinky?: Position;
    pinky?: Position;
    inky?: Position;
    clyde?: Position;
  };
  constructor(imageData: ImageData, colors: MapColorDictunary) {
    // Initialize some properties
    this.width = imageData.width;
    this.height = imageData.height;
    this.iMax = this.width - 1;
    this.jMax = this.height - 1;
    // Make a map to convert colors to type
    // The color value stored in uint32array is in little-endian format
    // And regular numbers are in big-endian format so
    // Convert the colors to little-endian format
    const colorMap = {
      [reverseEndian32(colors.wall)]: Cell.wall,
      [reverseEndian32(colors.dot)]: Cell.dot,
      [reverseEndian32(colors.packman)]: Cell.packman,
      [reverseEndian32(colors.arrestWarrant)]: Cell.arrestWarrant,
      [reverseEndian32(colors.blinky)]: Cell.blinky,
      [reverseEndian32(colors.pinky)]: Cell.pinky,
      [reverseEndian32(colors.inky)]: Cell.inky,
      [reverseEndian32(colors.clyde)]: Cell.clyde,
      [reverseEndian32(colors.gate)]: Cell.gate,
      [reverseEndian32(colors.base)]: Cell.base,
      [reverseEndian32(colors.upClosed)]: Cell.upClosed,
    };
    // Get the array of pixels in rgba
    const pixels32 = new Uint32Array(imageData.data.buffer);
    // Convert it to a regular array so that it's elements can be converted into other types
    const pixels = Array.from(pixels32);
    // Convet one-dimention types array to two-dimention
    const pixels2D = convert1dTo2d(pixels, this.width);
    const basePositions: Position[] = [];
    const gatePositions: Position[] = [];
    this.initialPositions = {};
    // Convert pixels into MapCell
    this.cells = pixels2D.map((row, j) =>
      row.map((pixel, i) => {
        // Convet pixel values to cell using the colorMap
        const cell = colorMap[pixel];
        const position = new Position(i, j);
        switch (cell) {
          case Cell.wall:
          case Cell.upClosed:
          case Cell.dot:
          case Cell.arrestWarrant:
            return cell;
          case Cell.gate:
            gatePositions.push(position);
            return Cell.gate;
          case Cell.base:
            basePositions.push(position);
            return Cell.wall;
          case Cell.packman:
            this.initialPositions.packman = position;
            return Cell.empty;
          case Cell.blinky:
            this.initialPositions.blinky = position;
            return Cell.empty;
          case Cell.pinky:
            this.initialPositions.pinky = position;
            return Cell.empty;
          case Cell.inky:
            this.initialPositions.inky = position;
            return Cell.empty;
          case Cell.clyde:
            this.initialPositions.clyde = position;
            return Cell.empty;
          default:
            return Cell.empty;
        }
      })
    );

    if (
      !["packman", "blinky", "pinky", "inky", "clyde"].every(
        (n) => n in this.initialPositions
      )
    ) {
      throw new Error("map color error");
    }

    this.gateRect = new Rect(gatePositions);
    this.baseRect = new Rect(basePositions);

    this.packman = new PackMan({
      map: this,
      position: this.initialPositions.packman!,
    });
    this.blinky = new Blinky({
      map: this,
      position: this.initialPositions.blinky!,
      packman: this.packman,
    });
    this.pinky = new Pinky({
      map: this,
      position: this.initialPositions.pinky!,
      packman: this.packman,
    });
    this.inky = new Inky({
      map: this,
      position: this.initialPositions.inky!,
      packman: this.packman,
      blinky: this.blinky,
    });
    this.clyde = new Clyde({
      map: this,
      position: this.initialPositions.clyde!,
      packman: this.packman,
    });

    console.log(gatePositions);
    console.log(this.gateRect);
  }

  get goasts() {
    return [this.blinky, this.pinky, this.inky, this.clyde];
  }
  get motiles() {
    return [...this.goasts, this.packman];
  }

  forEachCell(fn: (cell: Cell, i: number, j: number) => any) {
    this.cells.forEach((row, j) => {
      row.forEach((cell, i) => {
        fn(cell, i, j);
      });
    });
  }

  getCell(pos: Position) {
    return this.cells[pos.j][pos.i];
  }
  setCell(pos: Position, cell: Cell) {
    this.cells[pos.j][pos.i] = cell;
  }
  isWall(pos: Position) {
    return this.getCell(pos) === Cell.wall;
  }
}
