export const loadImageData = (path: string): Promise<ImageData> =>
  new Promise((res, rej) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = path;
    image.addEventListener("load", () => {
      const width = image.width;
      const height = image.height;
      const mapCanvas = document.createElement("canvas") as HTMLCanvasElement;
      mapCanvas.width = width;
      mapCanvas.height = height;
      const ctx = mapCanvas.getContext("2d")!;
      ctx.drawImage(image, 0, 0, width, height);
      const imageData = ctx.getImageData(0, 0, width, height);
      res(imageData);
    });
  });

export const reverseEndian32 = (num: number) => {
  const arr8 = new Uint8ClampedArray(4);
  arr8[0] = (num >> 16) & 0xff;
  arr8[1] = (num >> 8) & 0xff;
  arr8[2] = num & 0xff;
  arr8[3] = 0xff;
  const arr32 = new Uint32Array(arr8.buffer);
  return arr32[0];
};

export const convert1dTo2d = <T>(arr: T[], iLength: number): T[][] => {
  const arr2d: T[][] = [];
  let i = 0;
  while (i < arr.length) {
    arr2d.push(arr.slice(i, i + iLength));
    i += iLength;
  }
  return arr2d;
};

export class Rect {
  i: number;
  j: number;
  width: number;
  height: number;
  topLeft: Position;
  buttomRight: Position;
  constructor(positions: Position[]) {
    if (positions.length === 0) throw new Error("position array is empty");
    const Is = positions.map((p) => p.i);
    const Js = positions.map((p) => p.j);
    this.topLeft = new Position(Math.min(...Is), Math.min(...Js));
    this.buttomRight = new Position(Math.max(...Is), Math.max(...Js));
    this.i = this.topLeft.i;
    this.j = this.topLeft.j;
    this.width = this.buttomRight.i - this.topLeft.i + 1;
    this.height = this.buttomRight.j - this.topLeft.j + 1;
  }
  containes(position: Position) {
    return (
      position.i >= this.topLeft.i &&
      position.i <= this.buttomRight.i &&
      position.j >= this.topLeft.j &&
      position.j <= this.buttomRight.j
    );
  }
}
export class Vector {
  static UP = new Vector(0, -1);
  static DOWN = new Vector(0, 1);
  static LEFT = new Vector(-1, 0);
  static RIGHT = new Vector(1, 0);
  static STILL = new Vector(0, 0);
  static fromPositionA2B(a: Position, b: Position) {
    return new Vector(b.i - a.i, b.j - a.j);
  }
  i: number;
  j: number;
  constructor(i: number, j: number) {
    this.i = i;
    this.j = j;
  }
  reverse() {
    return new Vector(-this.i, -this.j);
  }
  multiply(by: number) {
    return new Vector(this.i * by, this.j * by);
  }
  isEqualTo(vetor: Vector) {
    return this.i === vetor.i && this.j === vetor.j;
  }
  toString() {
    return `${this.i},${this.j}`;
  }
  get vi() {
    if (this.isEqualTo(Vector.RIGHT)) return 0;
    if (this.isEqualTo(Vector.LEFT)) return 1;
    if (this.isEqualTo(Vector.UP)) return 2;
    if (this.isEqualTo(Vector.DOWN)) return 3;
    return -1;
  }
}
export class Position {
  static random(maxI: number, maxJ: number) {
    return new Position(
      Math.round(maxI * Math.random()),
      Math.round(maxJ * Math.random())
    );
  }
  i: number;
  j: number;
  constructor(i: number, j: number) {
    this.i = i;
    this.j = j;
  }
  translate(vector: Vector) {
    return new Position(this.i + vector.i, this.j + vector.j);
  }
  calcDistance(to: Position) {
    return Math.sqrt((this.i - to.i) ** 2 + (this.j - to.j) ** 2);
  }
  isEqualTo(vetor: Position) {
    return this.i === vetor.i && this.j === vetor.j;
  }
  toString() {
    return `${this.i},${this.j}`;
  }
  clone() {
    return new Position(this.i, this.j);
  }
  top() {
    return new Position(this.i, this.j - 1);
  }
  bottom() {
    return new Position(this.i, this.j + 1);
  }
  left() {
    return new Position(this.i - 1, this.j);
  }
  right() {
    return new Position(this.i + 1, this.j);
  }
}

export class Motile {
  position: Position = new Position(0, 0);
  direction: Vector = Vector.STILL;
  speed: number = 1;
  size: number = 1;
  color: string = "White";
}

export function delay(duration: number) {
  return new Promise((res, rej) => setTimeout(res, duration));
}

export type RectSize = { width: number; height: number };
