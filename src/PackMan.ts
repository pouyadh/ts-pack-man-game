import { Position, Vector } from "./utils";
import { Map, Cell } from "./Map";

export class PackMan {
  static size = 14;
  static color = "yellow";
  position: Position = new Position(0, 0);
  direction: Vector = Vector.STILL;
  speed: number = 1;
  map: Map;
  arrestWarrantDeadline: number = Date.now();
  nextDirection: Vector | null = null;
  constructor(c: { map: Map; position: Position }) {
    this.map = c.map;
    this.position = c.position;
    this.direction = Vector.LEFT;
    this.speed = 1;
  }
  updateDirection() {
    if (!this.nextDirection) return;
    const newPos = this.position.translate(this.nextDirection);
    const cell = this.map.getCell(newPos);
    if (cell !== Cell.wall && cell !== Cell.gate) {
      this.direction = this.nextDirection;
      this.nextDirection = null;
    }
  }
  setDirection(vector: Vector) {
    this.nextDirection = vector;
  }
  move() {
    this.updateDirection();
    const newPos = this.position.translate(this.direction);
    if (this.map.isWall(newPos)) return;
    this.position = newPos;
  }
  process() {
    this.move();
  }
  get size() {
    return PackMan.size;
  }
  get color() {
    return PackMan.color;
  }
}
