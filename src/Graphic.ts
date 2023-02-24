import { PackMan } from "./PackMan";
import { Position, RectSize, Vector } from "./utils";
import { Cell, Map } from "./Map";
import { Goast } from "./goasts/Goast";

export class Graphic {
  private rootElement: HTMLElement;
  private canvas: HTMLCanvasElement;
  private messageElement: HTMLDivElement;
  private containerElement: HTMLDivElement;
  private context: CanvasRenderingContext2D;
  private sprites: HTMLImageElement;
  private refreshInterval: number = 1000;
  private refreshIntervalRef: number | null = null;
  private map: Map;
  private _maxCanvasSize: RectSize = { width: 100, height: 100 };
  private _scale: number = 1;
  private wallsPath2D: Path2D = new Path2D();

  private powerPillVisible: boolean = true;
  private moveOffset: number = 0;

  constructor(c: {
    rootElement: HTMLElement;
    spritesPath: string;
    map: Map;
    maxCanvasSize: RectSize;
  }) {
    this.rootElement = c.rootElement;
    this.rootElement.innerHTML = "";
    this.containerElement = document.createElement("div");
    this.canvas = document.createElement("canvas");
    this.messageElement = document.createElement("div");
    this.messageElement.id = "message";
    this.containerElement.id = "packman-container";
    this.containerElement.append(this.canvas, this.messageElement);
    this.rootElement.appendChild(this.containerElement);
    this.context = this.canvas.getContext("2d")!;
    this.map = c.map;
    this.sprites = new Image();
    this.sprites.src = c.spritesPath;
    this.fps = 10;
    this.maxCanvasSize = c.maxCanvasSize;
    setInterval(() => {
      this.powerPillVisible = !this.powerPillVisible;
      this.moveOffset = this.moveOffset ? 0 : 1;
    }, 200);
    console.log(this);
  }

  set maxCanvasSize(size: RectSize) {
    this._maxCanvasSize = size;
    this.resize();
  }
  private resize() {
    const maxCanvasDimention = Math.min(
      this._maxCanvasSize.width,
      this._maxCanvasSize.height
    );
    const maxMapDimention = Math.max(this.map.width, this.map.height);
    this._scale = Math.floor(maxCanvasDimention / maxMapDimention);
    this.canvas.width = this.map.width * this._scale;
    this.canvas.height = this.map.height * this._scale;
    this.updateMapPath2D();
  }

  private updateMapPath2D() {
    const newPath = new Path2D();

    this.map.forEachCell((cell, i, j) => {
      if (cell === Cell.wall) {
        newPath.rect(i * this._scale - 1, j * this._scale - 1, 2, 2);
      }
    });
    this.wallsPath2D = newPath;
  }

  set fps(fps: number) {
    if (this.refreshIntervalRef) {
      clearInterval(this.refreshIntervalRef);
    }
    this.refreshInterval = 1000 / fps;
    this.refreshIntervalRef = setInterval(
      () => this.refresh(),
      this.refreshInterval
    );
  }
  get isSpriteReady() {
    return this.sprites.complete;
  }

  private clear() {
    this.context.fillStyle = "black";
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
  private drawWalls() {
    this.context.strokeStyle = "#0000ff";
    this.context.stroke(this.wallsPath2D);
  }

  private drawSquare(s: { i: number; j: number; size: number; color: string }) {
    const s2 = Math.floor(s.size / 2);
    this.context.fillStyle = s.color;
    this.context.fillRect(
      s.i * this._scale - s2,
      s.j * this._scale - s2,
      s.size,
      s.size
    );
  }
  private drawMotile(motile: PackMan | Goast) {
    const { i, j } = motile.position;
    const { size, color } = motile;
    this.drawSquare({ i, j, size, color });
  }

  private drawCircle(c: { i: number; j: number; size: number; color: string }) {
    const radius = c.size / 2;
    this.context.fillStyle = c.color;
    this.context.beginPath();
    this.context.ellipse(
      c.i * this._scale,
      c.j * this._scale,
      radius,
      radius,
      0,
      0,
      2 * Math.PI
    );
    this.context.fill();
  }

  private drawSprite(si: number, sj: number, pos: Position) {
    this.context.drawImage(
      this.sprites,
      si * 32,
      sj * 32,
      31,
      31,
      pos.i * this._scale - this._scale * 0.9,
      pos.j * this._scale - this._scale * 0.9,
      this._scale * 1.8,
      this._scale * 1.8
    );
  }

  public refresh() {
    this.clear();
    this.drawWalls();
    this.map.forEachCell((cell, i, j) => {
      switch (cell) {
        case Cell.dot:
          this.drawCircle({ i, j, size: 3, color: "white" });
          break;
        case Cell.arrestWarrant:
          if (this.powerPillVisible) {
            this.drawCircle({ i, j, size: 10, color: "orange" });
          }
          break;
        case Cell.gate:
          this.drawSquare({ i, j, size: 4, color: "pink" });
          break;
      }
    });

    if (!this.isSpriteReady) return;
    const { packman, blinky, pinky, inky, clyde } = this.map;

    switch (blinky.mode) {
      case "Eaten":
        this.drawSprite(blinky.direction.vi + 8, 5, blinky.position);
        break;
      case "Frightened":
        this.drawSprite(blinky.direction.vi + 8, 4, blinky.position);
        break;
      default:
        this.drawSprite(
          this.moveOffset + blinky.direction.vi * 2,
          4,
          blinky.position
        );
    }

    switch (pinky.mode) {
      case "Eaten":
        this.drawSprite(pinky.direction.vi + 8, 5, pinky.position);
        break;
      case "Frightened":
        this.drawSprite(pinky.direction.vi + 8, 4, pinky.position);
        break;
      default:
        this.drawSprite(
          this.moveOffset + pinky.direction.vi * 2,
          5,
          pinky.position
        );
    }

    switch (inky.mode) {
      case "Eaten":
        this.drawSprite(inky.direction.vi + 8, 5, inky.position);
        break;
      case "Frightened":
        this.drawSprite(inky.direction.vi + 8, 4, inky.position);
        break;
      default:
        this.drawSprite(
          this.moveOffset + inky.direction.vi * 2,
          6,
          inky.position
        );
    }

    console.log(clyde.mode);

    switch (clyde.mode) {
      case "Eaten":
        this.drawSprite(clyde.direction.vi + 8, 5, clyde.position);
        break;
      case "Frightened":
        this.drawSprite(clyde.direction.vi + 8, 4, clyde.position);
        break;
      default:
        this.drawSprite(
          this.moveOffset + clyde.direction.vi * 2,
          7,
          clyde.position
        );
    }

    this.drawSprite(this.moveOffset, packman.direction.vi, packman.position);

    // if (this.showGoastTarget) {
    //   this.map.goasts.forEach(({ target, color }) => {
    //     this.drawSquare({ i: target.i, j: target.j, color, size: 8 });
    //     this.drawSquare({ i: target.i, j: target.j, color: "black", size: 2 });
    //   });
    // }

    // if (this._debug) {
    //   const tDur = Date.now() - tStart;
    //   this.context.fillStyle = "white";
    //   this.context.textBaseline = "top";
    //   this.context.font = "normal 12px serif";
    //   this.context.fillText(` T_render: ${tDur} ms \n`, 10, 10);
    //   this.context.fillText(` Score: ${this.score}`, 100, 10);
    //   this.context.fillText(` Mode: ${this.mode}`, 200, 10);
    // }
  }

  get isReady() {
    return this.sprites.complete;
  }

  public showBlinkingMessage(message: string) {
    this.messageElement.textContent = message;
    this.messageElement.className = "";
    void this.messageElement.offsetWidth;
    this.messageElement.classList.add("blink");
  }
  public showMessageInOut(message: string) {
    return new Promise<void>((res, rej) => {
      this.messageElement.textContent = message;
      this.messageElement.className = "";
      void this.messageElement.offsetWidth;
      this.messageElement.classList.add("come-in-out");
      const fn = () => {
        this.messageElement.className = "";
        this.messageElement.removeEventListener("animationend", fn);
        res();
      };
      this.messageElement.addEventListener("animationend", fn);
    });
  }
  public hideMessage() {
    this.messageElement.textContent = "";
    this.messageElement.className = "";
  }
}
