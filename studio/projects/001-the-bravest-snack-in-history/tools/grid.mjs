// grid.mjs <frame> — save a downscale with 200px grid overlay (design coords)
import { createCanvas, loadImage } from '@napi-rs/canvas';
import fs from 'node:fs';
const [file, out] = process.argv.slice(2);
const im = await loadImage(fs.readFileSync(file));
const W = im.width, H = im.height;
const c = createCanvas(W, H); const g = c.getContext('2d');
g.drawImage(im, 0, 0);
g.lineWidth = 2;
for (let x = 0; x <= W; x += 200) {
  g.strokeStyle = x % 1000 === 0 ? 'rgba(255,0,0,0.8)' : 'rgba(0,120,255,0.35)';
  g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke();
  if (x % 1000 === 0) { g.fillStyle = 'red'; g.font = '40px sans-serif'; g.fillText(String(x), x + 8, 60); }
}
for (let y = 0; y <= H; y += 200) {
  g.strokeStyle = y % 1000 === 0 ? 'rgba(255,0,0,0.8)' : 'rgba(0,120,255,0.35)';
  g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke();
  if (y % 1000 === 0) { g.fillStyle = 'red'; g.font = '40px sans-serif'; g.fillText(String(y), 8, y + 50); }
}
fs.writeFileSync(out, await c.encode('png'));
console.log('wrote', out);
