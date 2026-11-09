#!/usr/bin/env bun
// Extract camera rail estimates from canonical video by tracking paper rule grid
// Usage: bun extract_camera_rail.mjs --input D:/YOUTUBE/ExTest/the-bravest-snack-in-history.mp4 --out camera_rail.json

console.log('Camera rail extraction stub');
console.log('Will sample frames, detect 118px rule grid via FFT, estimate similarity transform per frame');
console.log('Output: camera_rail.json with t, tx, ty, scale, rotation per frame');
