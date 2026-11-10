// ddg.mjs — DuckDuckGo HTML-SERP research scraper. No API key, no JS engine,
// no cookie wall: fetches the static lite SERP and prints decoded results.
// Use from agent research loops (research-sourcing skill); agent-browser is the
// fallback for pages that need JS. Verified 2026-11 on this machine.
//
//   bun studio/tools/ddg.mjs "<query>" [--limit N] [--json]
import { setTimeout as sleep } from 'node:timers/promises';

const args = process.argv.slice(2);
const limitFlag = args.indexOf('--limit');
const limit = limitFlag >= 0 ? parseInt(args[limitFlag + 1], 10) || 10 : 10;
const jsonOut = args.includes('--json');
const query = args.filter((a, i) => a !== '--limit' && (limitFlag < 0 || i !== limitFlag + 1) && a !== '--json').join(' ');
if (!query) {
  console.error('usage: bun studio/tools/ddg.mjs "<query>" [--limit N] [--json]');
  process.exit(2);
}

const html = await (async () => {
  const url = 'https://lite.duckduckgo.com/lite/?q=' + encodeURIComponent(query);
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) OpuscarStudio/1.0' },
      redirect: 'follow',
    });
    if (res.ok) return res.text();
    await sleep(800 * (attempt + 1));
  }
  throw new Error('DDG SERP fetch failed after 3 tries');
})();

const LINK_RE = /<a\b[^>]*href="([^"]+)"[^>]*class='result-link'[^>]*>([\s\S]*?)<\/a>/g;
const clean = (s) => s.replace(/<[^>]+>/g, '')
  .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/\s+/g, ' ').trim();

const results = [];
let m;
while ((m = LINK_RE.exec(html)) && results.length < limit) {
  let href = m[1];
  const title = clean(m[2]);
  if (!title) continue;
  const dec = /uddg=([^&]+)/.exec(href);
  const url = dec ? decodeURIComponent(dec[1]) : href.startsWith('//') ? 'https:' + href : href;
  results.push({ title, url });
}

if (jsonOut) console.log(JSON.stringify(results, null, 2));
else for (const r of results) console.log(`${r.title}\n  ${r.url}`);
console.error(`\n[ddg] ${results.length} results for: ${query}`);
