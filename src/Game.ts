import { Map, MapColorDictunary, Cell } from "./Map";
import { delay, Motile, Vector } from "./utils";
import { Goast, GoastMode } from "./goasts/Goast";
import { PackMan } from "./PackMan";
import { Graphic } from "./Graphic";

type GameAIMode = "Scatter" | "Chase" | "Frightened";

type GameState = {
  level: number;
  score: number;
  mode: GameAIMode;
  nextModeChangeTime: number;
};

type RectSize = { width: number; height: number };
type GameConstructor = {
  mapImageData: ImageData;
  mapColorDictunary: MapColorDictunary;
  maxCanvasSize: RectSize;
  speed: number;
  modes: [mode: GameAIMode, duration: number][];
  frightenedDuration: number;
  dotScore: number;
  arrestScore: number;
  packmanLive: number;
  rootElement: HTMLElement;
  spritePath: string;
};

export class Game {
  private map: Map;

  private modes: [mode: GameAIMode, duration: number][];
  private modeIndex: number = 0;
  private modeChangeTime: number = 0;
  private mode: GameAIMode = "Scatter";

  private frightenedDuration: number = 0;

  private dotScore: number;
  private arrestScore: number;

  private score: number;

  private remainingDots: number;
  private remainingArrestWarrant: number;

  private packmanLive: number;

  private graphic: Graphic;

  private processIntervalRef: number | null = null;

  constructor(c: GameConstructor) {
    this.map = new Map(c.mapImageData, c.mapColorDictunary);
    this.graphic = new Graphic({
      rootElement: c.rootElement,
      map: this.map,
      maxCanvasSize: c.maxCanvasSize,
      spritesPath: c.spritePath,
    });
    this.modes = c.modes.map((m) => [m[0], m[1] * 1000]);
    this.frightenedDuration = c.frightenedDuration * 1000;
    this.resetMode();

    this.dotScore = c.dotScore;
    this.arrestScore = c.arrestScore;
    this.score = 0;

    this.remainingDots = 0;
    this.remainingArrestWarrant = 0;
    this.map.forEachCell((cell, i, j) => {
      if (cell === Cell.dot) {
        this.remainingDots++;
      } else if (cell === Cell.arrestWarrant) {
        this.remainingArrestWarrant++;
      }
    });

    this.packmanLive = c.packmanLive;

    this.handleKeyboard = this.handleKeyboard.bind(this);
  }

  private startProcess() {
    this.processIntervalRef = setInterval(() => this.proccess(), 100);
    window.addEventListener("keydown", this.handleKeyboard);
  }
  private stopProcess() {
    if (this.processIntervalRef) {
      clearInterval(this.processIntervalRef);
      this.processIntervalRef = null;
    }
    window.removeEventListener("keydown", this.handleKeyboard);
  }
  async start() {
    await this.graphic.showMessageInOut("Get Ready!");
    await this.graphic.showMessageInOut("Go!");
    this.startProcess();
  }
  pause() {
    this.stopProcess();
  }

  gotoFrieghtenedMode() {
    console.log(this.modeIndex);
    this.setMode("Frightened", this.frightenedDuration);

    //this.modeIndex--;
    console.log(this.modeIndex);
  }
  setMode(mode: GameAIMode, duration: number) {
    this.mode = mode;
    this.modeChangeTime = Date.now() + duration;
    this.map.goasts.forEach((g) => g.setMode(this.mode));
  }
  updateMode() {
    if (this.modeChangeTime < Date.now()) {
      if (this.modeIndex < this.modes.length) {
        this.setMode(
          this.modes[this.modeIndex][0],
          this.modes[this.modeIndex][1]
        );
        this.modeIndex++;
      }
    }
  }

  resetMode() {
    this.setMode(this.modes[0][0], this.modes[0][1]);
  }

  handleKeyboard(e: KeyboardEvent) {
    if (!this.map || !this.map.packman) return;
    const vector = {
      ArrowUp: Vector.UP,
      ArrowDown: Vector.DOWN,
      ArrowLeft: Vector.LEFT,
      ArrowRight: Vector.RIGHT,
    }[e.key];
    if (vector) {
      this.map.packman.setDirection(vector);
    }
  }

  private handlePackmanDie() {
    this.pause();
    this.packmanLive--;
    if (this.packmanLive < 0) {
      this.graphic.showBlinkingMessage("GameOver!");
    }

    setTimeout(() => {
      if (this.packmanLive >= 0) {
        this.map.packman.position = this.map.initialPositions.packman!;
        this.map.blinky.position = this.map.initialPositions.blinky!;
        this.map.pinky.position = this.map.initialPositions.pinky!;
        this.map.inky.position = this.map.initialPositions.inky!;
        this.map.clyde.position = this.map.initialPositions.clyde!;
        this.resetMode();
        this.start();
      }
    }, 3000);
  }

  private handleWin() {
    this.pause();
    this.graphic.showBlinkingMessage("Winner Winner \n Chicken Dinner!");
  }

  private eat() {
    const packmanCell = this.map.getCell(this.map.packman.position);
    if (packmanCell === Cell.dot) {
      this.map.setCell(this.map.packman.position, Cell.empty);
      this.score += this.dotScore;
      this.remainingDots--;
    }
    if (packmanCell === Cell.arrestWarrant) {
      this.map.setCell(this.map.packman.position, Cell.empty);
      this.gotoFrieghtenedMode();
      this.remainingArrestWarrant--;
    }

    if (!this.remainingDots && !this.remainingArrestWarrant) {
      this.handleWin();
    }
  }

  private arbitrate() {
    const colGoasts = this.map.goasts.filter((g) =>
      g.position.isEqualTo(this.map.packman.position)
    );

    for (let g of colGoasts) {
      if (g.mode === "Frightened") {
        this.score += this.arrestScore;
        g.setMode("Eaten");
      } else if (g.mode !== "Eaten") {
        this.handlePackmanDie();
        break;
      }
    }
  }

  private proccess() {
    this.updateMode();
    const map = this.map;
    map.packman.process();
    this.arbitrate();
    map.goasts.forEach((g) => g.process());
    this.eat();
    this.arbitrate();
  }
}
