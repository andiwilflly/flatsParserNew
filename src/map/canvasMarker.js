import mapModel from '../models/map.model';


export default function($canvas) {
    const ctx = $canvas.getContext('2d');

    const scale = window.devicePixelRatio; // Change to 1 on retina screens to see blurry canvas.

    $canvas.style.width = `${mapModel.dotSize}px`;
    $canvas.style.height = `${mapModel.dotSize}px`;
    // Set actual size in memory (scaled to account for extra pixel density).
    $canvas.width = mapModel.dotSize * scale;
    $canvas.height = mapModel.dotSize * scale;
    ctx.scale(scale, scale);
    ctx.scale(scale, scale);

    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.arc( mapModel.dotSize/(2+scale), mapModel.dotSize/(2+scale), 2, 0, 2 * Math.PI);
    ctx.fillStyle = "white";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(mapModel.dotSize/(2+scale), mapModel.dotSize/(2+scale), 1.5, 0, 2 * Math.PI);
    ctx.fillStyle = "blue";
    ctx.fill();
}