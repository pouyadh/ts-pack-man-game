async function run() {
  const mapFilePath = "./assets/map.bmp";
  const mapColorDictunary: PackMan.MapColorDictunary = {
    wall: 0x00a2e8,
    dot: 0xffffff,
    goast: 0xff7f27,
    packman: 0x22b14c,
    arrestWarrant: 0xffaec9,
  };

  const mapImageData = await loadImageData(mapFilePath);
  const canvas = document.querySelector("canvas");
  if (!canvas) throw new Error("canvas not found");
  const maxCanvasSize = {
    width: innerWidth * 0.9,
    height: innerHeight * 0.9,
  };

  const game = new PackMan.Game({
    canvas,
    mapColorDictunary,
    mapImageData,
    maxCanvasSize,
  });

  game.start();
}

run();
