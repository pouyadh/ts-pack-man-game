import { Position, Vector } from "../utils";
import { Map } from "../Map";
import { Goast } from "./Goast";
import { PackMan } from "../PackMan";
import { Blinky } from "./Blinky";

export class Inky extends Goast {
  static colors = {
    Scatter: "cyan",
    Chase: "cyan",
    Frightened: "blue",
    Eaten: "white",
  };
  blinky: Blinky;
  constructor(c: {
    map: Map;
    position: Position;
    packman: PackMan;
    blinky: Blinky;
  }) {
    super(c);
    this.scatterTarget = new Position(this.map.iMax, this.map.jMax);
    this.blinky = c.blinky;
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
        const packman = this.packman;
        const blinky = this.blinky;
        const a = packman.position.translate(
          this.packman.direction.multiply(2)
        );
        const b = Vector.fromPositionA2B(a, this.blinky.position).reverse();
        const c = a.translate(b);
        this.target = c;
      }
    }
  }
  protected updateColor(): void {
    this.color = Inky.colors[this.mode];
  }
}
