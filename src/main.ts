import { Game } from "./Game";
import { loadImageData } from "./utils";
import { MapColorDictunary } from "./Map";
import mapPath from "./assets/map.bmp";
import spritesPath from "./assets/sprites.png";

async function run() {
  const mapColorDictunary: MapColorDictunary = {
    wall: 0x00a2e8,
    dot: 0xc3c3c3,
    packman: 0xfff200,
    arrestWarrant: 0xa349a4,
    blinky: 0xed1c24,
    pinky: 0xffaec9,
    inky: 0x99d9ea,
    clyde: 0xffc90e,
    gate: 0x7f7f7f,
    base: 0xb97a57,
    upClosed: 0x7092be,
  };

  const mapImageData = await loadImageData(mapPath);
  const rootElement = document.querySelector("div#packman") as HTMLDivElement;
  if (!rootElement) throw new Error("div#packman not found");
  const maxCanvasSize = {
    width: innerWidth * 0.7,
    height: innerHeight * 0.7,
  };

  const game = new Game({
    rootElement: rootElement,
    spritePath: spritesPath,
    mapColorDictunary,
    mapImageData,
    maxCanvasSize,
    speed: 1,
    modes: [
      ["Scatter", 7],
      ["Chase", 20],
      ["Scatter", 7],
      ["Chase", 20],
      ["Scatter", 5],
      ["Chase", 20],
      ["Scatter", 5],
      ["Chase", 20],
    ],
    frightenedDuration: 20,
    dotScore: 1,
    arrestScore: 200,
    packmanLive: 3,
  });

  game.start();
}

run();
