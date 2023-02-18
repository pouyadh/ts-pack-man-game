"use strict";
const loadImageData = (path) => new Promise((res, rej) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = path;
    image.addEventListener("load", () => {
        const width = image.width;
        const height = image.height;
        const mapCanvas = document.createElement("canvas");
        mapCanvas.width = width;
        mapCanvas.height = height;
        const ctx = mapCanvas.getContext("2d");
        ctx.drawImage(image, 0, 0, width, height);
        const imageData = ctx.getImageData(0, 0, width, height);
        res(imageData);
    });
});
const reverseEndian32 = (num) => {
    const arr8 = new Uint8ClampedArray(4);
    arr8[0] = (num >> 16) & 0xff;
    arr8[1] = (num >> 8) & 0xff;
    arr8[2] = num & 0xff;
    arr8[3] = 0xff;
    const arr32 = new Uint32Array(arr8.buffer);
    return arr32[0];
};
const convert1dTo2d = (arr, iLength) => {
    const arr2d = [];
    let i = 0;
    while (i < arr.length) {
        arr2d.push(arr.slice(i, i + iLength));
        i += iLength;
    }
    return arr2d;
};
