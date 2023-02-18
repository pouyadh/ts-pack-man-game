namespace PackMan {
  type Vector = [i: number, j: number];
  type Position = [i: number, j: number];
  type CellMember = Goast | PackMan | Wall | Dot | ArrestWarrant;
  class MapCell {
    containes: any[];
    constructor(members: CellMember[]) {
      this.containes = members;
    }
  }

  const DIRECTION = {
    up: [0, 1] as Vector,
    down: [0, -1] as Vector,
    left: [1, 0] as Vector,
    right: [-1, 0] as Vector,
    still: [0, 0] as Vector,
  };

  class Motile {
    position: Position = [0, 0];
    direction: Vector = DIRECTION.still;
    speed: number = 1;
  }

  class Goast extends Motile {
    map: Map;
    constructor(map: Map, initialPosition: Position) {
      super();
      this.map = map;
      this.position = initialPosition;
      this.direction = DIRECTION.left;
      this.speed = 1;
    }
  }
  class PackMan extends Motile {
    arrestWarrant: boolean;
    map: Map;
    constructor(map: Map, initialPosition: Position) {
      super();
      this.arrestWarrant = false;
      this.map = map;
      this.position = initialPosition;
      this.direction = DIRECTION.left;
      this.speed = 1;
    }
  }
  class Wall {
    position: Position;
    map: Map;
    constructor(map: Map, postion: Position) {
      this.map = map;
      this.position = postion;
    }
  }
  class Dot {
    position: Position;
    map: Map;
    constructor(map: Map, postion: Position) {
      this.map = map;
      this.position = postion;
    }
  }

  class ArrestWarrant {
    position: Position;
    constructor(position: Position) {
      this.position = position;
    }
  }

  export type MapColorDictunary = {
    wall: number;
    dot: number;
    packman: number;
    goast: number;
    arrestWarrant: number;
  };
  enum CellType {
    "empty" = 0,
    "wall",
    "dot",
    "packman",
    "goast",
    "arrestWarrant",
  }
  class Map {
    width: number;
    height: number;
    iMax: number;
    jMax: number;
    cells: MapCell[][];
    dots: Dot[];
    goasts: Goast[];
    packman: PackMan;
    walls: Wall[];
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
        [reverseEndian32(colors.wall)]: CellType.wall,
        [reverseEndian32(colors.dot)]: CellType.dot,
        [reverseEndian32(colors.goast)]: CellType.goast,
        [reverseEndian32(colors.packman)]: CellType.packman,
        [reverseEndian32(colors.arrestWarrant)]: CellType.arrestWarrant,
      };
      // Get the array of pixels in rgba
      const pixels32 = new Uint32Array(imageData.data.buffer);
      // Convert it to a regular array so that it's elements can be converted into other types
      const pixels = Array.from(pixels32);
      // Convet one-dimention types array to two-dimention
      const pixels2D = convert1dTo2d(pixels, this.width);
      this.dots = [];
      this.goasts = [];
      this.walls = [];
      this.packman = new PackMan(this, [-1, -1]);
      // Convert pixels into MapCell
      this.cells = pixels2D.map((row, j) =>
        row.map((cell, i) => {
          // Convet pixel values to cell type using the colorMap
          const cellType = colorMap[cell];
          const postion = [i, j] as Position;
          switch (cellType) {
            case CellType.dot:
              const dot = new Dot(this, postion);
              this.dots.push(dot);
              return new MapCell([dot]);
            case CellType.goast:
              const goast = new Goast(this, postion);
              this.goasts.push(goast);
              return new MapCell([goast]);
            case CellType.packman:
              const packman = new PackMan(this, postion);
              this.packman = packman;
              return new MapCell([packman]);
            case CellType.wall:
              const wall = new Wall(this, postion);
              this.walls.push(wall);
              return new MapCell([wall]);
            case CellType.arrestWarrant:
              const aw = new ArrestWarrant(postion);
              return new MapCell([aw]);
            default:
              return new MapCell([]);
          }
        })
      );
    }

    forEachCell(fn: (cell: MapCell, i: number, j: number) => any) {
      this.cells.forEach((row, j) => {
        row.forEach((cell, i) => {
          fn(cell, i, j);
        });
      });
    }
  }

  type RectSize = { width: number; height: number };
  export type GameConstructor = {
    mapImageData: ImageData;
    mapColorDictunary: MapColorDictunary;
    canvas: HTMLCanvasElement;
    maxCanvasSize: RectSize;
  };
  export class Game {
    private canvas: HTMLCanvasElement;
    private map: Map;
    private proccessIntervalRef: number | null;
    private context: CanvasRenderingContext2D;
    private _maxCanvasSize: RectSize;
    private _scale: number;
    private mapPath2D: Path2D;
    private _debug: boolean = true;
    constructor(c: GameConstructor) {
      if (!c.canvas.getContext("2d")) throw new Error("canvas context is null");
      this.canvas = c.canvas;
      this.context = this.canvas.getContext("2d")!;
      this._maxCanvasSize = c.maxCanvasSize;
      this.map = new Map(c.mapImageData, c.mapColorDictunary);
      this.proccessIntervalRef = null;
      this._scale = 1;
      this.mapPath2D = new Path2D();
      this.resize();
      console.log(this);
    }
    get scale() {
      return this._scale;
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
    start() {
      if (this.proccessIntervalRef) return;
      this.proccessIntervalRef = setInterval(() => this.refresh(), 200);
    }
    pause() {
      if (this.proccessIntervalRef) {
        clearInterval(this.proccessIntervalRef);
      }
    }
    private refresh() {
      this.proccess();
      this.render();
    }
    private proccess() {}
    private render() {
      const tStart = Date.now();
      this.context.fillStyle = "black";
      this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.context.strokeStyle = "blue";
      this.context.stroke(this.mapPath2D);

      this.map.forEachCell((cell, i, j) => {
        cell.containes.forEach((c) => {
          const si = i * this.scale;
          const sj = j * this.scale;
          if (c instanceof Dot) {
            this.context.fillStyle = "white";
            this.context.fillRect(si - 1, sj - 1, 2, 2);
          } else if (c instanceof PackMan) {
            this.context.fillStyle = "yellow";
            this.context.fillRect(si - 7, sj - 7, 14, 14);
          } else if (c instanceof Goast) {
            this.context.fillStyle = "red";
            this.context.fillRect(si - 7, sj - 7, 14, 14);
          } else if (c instanceof ArrestWarrant) {
            this.context.fillStyle = "green";
            this.context.fillRect(si - 3, sj - 3, 6, 6);
          }
        });
      });

      if (this._debug) {
        const tDur = Date.now() - tStart;
        this.context.fillStyle = "white";
        this.context.textBaseline = "top";
        this.context.fillText(` T_render: ${tDur} ms`, 10, 10);
      }
    }
    private updateMapPath2D() {
      const newPath = new Path2D();
      this.map.forEachCell((cell, i, j) => {
        cell.containes.forEach((c) => {
          if (c instanceof Wall) {
            newPath.rect(i * this._scale, j * this._scale, 2, 2);
          }
        });
      });
      this.mapPath2D = newPath;
    }
  }
}
