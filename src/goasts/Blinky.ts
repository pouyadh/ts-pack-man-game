import { Position, Vector } from "../utils";
import { Map } from "../Map";
import { Goast } from "./Goast";
import { PackMan } from "../PackMan";

export class Blinky extends Goast {
  static colors = {
    Scatter: "red",
    Chase: "red",
    Frightened: "blue",
    Eaten: "white",
  };
  constructor(c: { map: Map; position: Position; packman: PackMan }) {
    super(c);
    this.scatterTarget = new Position(this.map.iMax, 0);
  }
  calcTarget() {
    if (this.mode === "Eaten") {
      this.target = this.initialPosition;
    } else if (this.isInsideBase()) {
      this.target = this.map.gateRect.topLeft.translate(Vector.UP);
    } else {
      if (this.mode === "Scatter") {
        this.target = this.scatterTarget;
      } else {
        this.target = this.packman.position;
      }
    }
  }
  protected updateColor(): void {
    this.color = Blinky.colors[this.mode];
  }
}
