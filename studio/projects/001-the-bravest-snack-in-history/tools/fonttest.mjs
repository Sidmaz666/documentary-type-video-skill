// fonttest.mjs — font identification: canon crop on top, candidates below.
import { createCanvas, GlobalFonts, loadImage } from '@napi-rs/canvas';
import fs from 'node:fs';

const canonFile = process.argv[2];
const text = process.argv[3];
const list = process.argv[4] || 'display'; // 'display' | 'mono'

for (const [file, alias] of [
  ['Anton.ttf', 'Anton'], ['ArchivoBlack.ttf', 'Archivo Black'],
  ['PassionOne-Black.ttf', 'Passion One Black'], ['PassionOne-Bold.ttf', 'Passion One Bold'],
  ['Oswald.ttf', 'Oswald'], ['FjallaOne.ttf', 'Fjalla One'], ['BebasNeue.ttf', 'Bebas'],
  ['Archivo.ttf', 'ArchivoVar'], ['Inter.ttf', 'InterVar'],
  ['JBMono.ttf', 'JetBrains Mono'], ['PlexMono.ttf', 'IBM Plex Mono'],
  ['SpaceMono.ttf', 'Space Mono'], ['DMMono.ttf', 'DM Mono'],
  ['CourierPrime.ttf', 'Courier Prime'],
]) {
  GlobalFonts.registerFromPath(process.cwd() + '/frames/fonts_test/' + file, alias);
}

const fonts = list === 'mono'
  ? [['JetBrains Mono', true], ['IBM Plex Mono', true], ['Space Mono', true], ['DM Mono', true], ['Courier Prime', true]]
  : [['Anton', false], ['Archivo Black', false], ['Passion One Black', false], ['Passion One Bold', false],
     ['Oswald', true], ['Fjalla One', false], ['Bebas', false], ['ArchivoVar', true], ['InterVar', true]];

const canon = await loadImage(fs.readFileSync(canonFile));
const W = 1400;
const rowH = 240;
const c = createCanvas(W, rowH * (fonts.length + 1));
const g = c.getContext('2d');
{
  const s = Math.min((W - 20) / canon.width, rowH / canon.height);
  g.save(); g.fillStyle = '#fff'; g.fillRect(0, 0, W, rowH);
  g.drawImage(canon, 10, 10, canon.width * s, canon.height * s);
  g.restore();
}
fonts.forEach(([alias, bold], i) => {
  const y = rowH * (i + 1);
  g.fillStyle = '#eee'; g.fillRect(0, y, W, rowH);
  g.fillStyle = '#333'; g.font = '20px sans-serif'; g.fillText(alias, 8, y + 26);
  g.fillStyle = '#2a2622';
  g.font = `${bold ? 'bold ' : ''}150px "${alias}"`;
  g.fillText(text, 10, y + rowH - 28);
});
fs.writeFileSync('frames/fonttest.png', await c.encode('png'));
console.log('wrote frames/fonttest.png');
