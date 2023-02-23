import { Position, Vector } from "../utils";
import { Map } from "../Map";
import { Goast } from "./Goast";
import { PackMan } from "../PackMan";

export class Clyde extends Goast {
  static colors = {
    Scatter: "brown",
    Chase: "brown",
    Frightened: "blue",
    Eaten: "white",
  };
  constructor(c: { map: Map; position: Position; packman: PackMan }) {
    super(c);
    this.scatterTarget = new Position(0, this.map.jMax);
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
        if (this.position.calcDistance(this.packman.position) > 8) {
          this.target = this.packman.position;
        } else {
          this.target = this.scatterTarget;
        }
      }
    }
  }
  protected updateColor(): void {
    this.color = Clyde.colors[this.mode];
  }
}
