import { Position, Vector } from "../utils";
import { Map, Cell } from "../Map";
import { PackMan } from "../PackMan";

export type GoastMode = "Scatter" | "Chase" | "Frightened" | "Eaten";
export class Goast {
  static size = 10;
  protected initialPosition: Position = new Position(0, 0);
  public position: Position = new Position(0, 0);
  public target: Position = new Position(0, 0);
  public direction: Vector = new Vector(0, 0);
  protected speed: number = 1;
  public color: string = "green";
  public mode: GoastMode = "Scatter";
  private nextMode: GoastMode = "Scatter";
  protected turnAround: boolean = false;
  protected map: Map;
  protected packman: PackMan;
  protected scatterTarget: Position = new Position(0, 0);
  constructor(c: { map: Map; position: Position; packman: PackMan }) {
    this.map = c.map;
    this.position = c.position;
    this.packman = c.packman;
    this.initialPosition = c.position;
  }
  setMode(mode: GoastMode) {
    if (this.mode === "Eaten") {
      this.nextMode = mode;
    } else {
      this.mode = mode;
    }
  }
  protected isInsideBase() {
    return this.map.baseRect.containes(this.position);
  }
  protected calcTarget() {}
  protected calcDirection() {
    const upClosed = this.map.getCell(this.position) === Cell.upClosed;
    const isEaten = this.mode === "Eaten";
    const rev = this.direction.reverse();
    let opt = [Vector.UP, Vector.DOWN, Vector.LEFT, Vector.RIGHT].filter(
      (vector) => {
        if (upClosed && vector === Vector.UP) return false;
        const pos = this.position.translate(vector);
        const cell = this.map.getCell(pos);
        if (cell === Cell.wall) return false;
        if (!isEaten && !this.isInsideBase() && cell === Cell.gate)
          return false;
        if (vector.isEqualTo(rev)) return false;
        return true;
      }
    );

    const optLength = opt.length;
    if (optLength === 0) {
      this.direction = rev;
    } else if (this.mode === "Frightened") {
      const index = Math.floor(Math.random() * (optLength - 1));
      this.direction = opt[index];
    } else {
      this.direction = opt.sort((a, b) => {
        const aa = this.position.translate(a).calcDistance(this.target);
        const bb = this.position.translate(b).calcDistance(this.target);
        return aa - bb;
      })[0];
    }
  }
  protected move() {
    this.position = this.position.translate(this.direction);
  }
  protected updateState() {
    if (this.mode === "Eaten") {
      if (this.position.isEqualTo(this.initialPosition)) {
        this.mode = this.nextMode || "Chase";
      }
    }
  }
  protected updateColor() {}
  public process() {
    this.calcTarget();
    this.calcDirection();
    this.move();
    this.updateState();
    this.updateColor();
  }
  get size() {
    return Goast.size;
  }
}
