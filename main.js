"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        const mapFilePath = "./assets/map.bmp";
        const mapColorDictunary = {
            wall: 0x00a2e8,
            dot: 0xffffff,
            goast: 0xff7f27,
            packman: 0x22b14c,
            arrestWarrant: 0xffaec9,
        };
        const mapImageData = yield loadImageData(mapFilePath);
        const canvas = document.querySelector("canvas");
        if (!canvas)
            throw new Error("canvas not found");
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
    });
}
run();
