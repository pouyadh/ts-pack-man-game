import { PackMan } from "./PackMan";
import { Position, RectSize, Vector } from "./utils";
import { Cell, Map } from "./Map";
import { Goast } from "./goasts/Goast";
import { Game } from "./Game";

export class Graphic {
  private rootElement: HTMLElement;
  private canvas: HTMLCanvasElement;
  private messageElement: HTMLDivElement;
  private containerElement: HTMLDivElement;
  private headerElement: HTMLDivElement;
  private footerElement: HTMLDivElement;
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

  private packmanSpritePostion: Position | null = null;
  private game: Game;

  constructor(c: {
    rootElement: HTMLElement;
    spritesPath: string;
    map: Map;
    maxCanvasSize: RectSize;
    game: Game;
  }) {
    this.game = c.game;
    this.rootElement = c.rootElement;
    this.rootElement.innerHTML = "";
    this.containerElement = document.createElement("div");
    this.canvas = document.createElement("canvas");
    this.messageElement = document.createElement("div");
    this.headerElement = document.createElement("div");
    this.footerElement = document.createElement("div");
    this.messageElement.id = "message";
    this.containerElement.id = "packman-container";
    this.containerElement.append(
      this.headerElement,
      this.canvas,
      this.messageElement,
      this.footerElement
    );
    this.headerElement.classList.add("flex");
    this.footerElement.classList.add("flex");
    this.rootElement.append(this.containerElement);
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
  private drawStatics() {
    this.context.strokeStyle = "#0000ff";
    this.context.stroke(this.wallsPath2D);
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
    if (!this.isSpriteReady) return;
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

  private drawGoast(goast: Goast, spriteRow: number) {
    switch (goast.mode) {
      case "Eaten":
        this.drawSprite(goast.direction.vi + 8, 5, goast.position);
        break;
      case "Frightened":
        this.drawSprite(goast.direction.vi + 8, 4, goast.position);
        break;
      default:
        this.drawSprite(
          this.moveOffset + goast.direction.vi * 2,
          spriteRow,
          goast.position
        );
    }
  }

  private drawGoasts() {
    const { blinky, pinky, inky, clyde } = this.map;
    this.drawGoast(blinky, 4);
    this.drawGoast(pinky, 5);
    this.drawGoast(inky, 6);
    this.drawGoast(clyde, 7);
  }

  private drawPackman() {
    const packman = this.map.packman;
    if (!this.packmanSpritePostion) {
      this.drawSprite(this.moveOffset, packman.direction.vi, packman.position);
    } else {
      const { i, j } = this.packmanSpritePostion;
      this.drawSprite(i, j, packman.position);
    }
  }

  public refresh() {
    const { score, topScore, packmanLive, level, mode } = this.game;
    this.headerElement.innerHTML = `<span>SCORE</br>${score}</span><span>TOP-SCORE</br>${topScore}</span> </span><span>MODE</br>${mode}</span>`;
    this.footerElement.innerHTML = `<span>LIVES</br>${
      packmanLive === -1 ? "-" : packmanLive
    }</span><span>LEVEL</br>${level}</span>`;
    this.clear();
    this.drawStatics();
    this.drawGoasts();
    this.drawPackman();

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

  public showMessage(message: string) {
    this.messageElement.textContent = message;
    this.messageElement.className = "";
    void this.messageElement.offsetWidth;
    this.messageElement.classList.add("static");
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

  public animatePackmanDeath() {
    return new Promise<void>((res, rej) => {
      this.packmanSpritePostion = new Position(2, 0);
      const i = setInterval(() => {
        this.packmanSpritePostion!.i++;
        if (this.packmanSpritePostion!.i === 14) {
          clearInterval(i);
          this.packmanSpritePostion = null;
          res();
        }
      }, 350);
    });
  }

  public clickOnContainer() {
    return new Promise((res, rej) => {
      const handleClick = (e: Event) => {
        this.containerElement.removeEventListener("click", handleClick);
        res(e);
      };
      this.containerElement.addEventListener("click", handleClick);
    });
  }
}
