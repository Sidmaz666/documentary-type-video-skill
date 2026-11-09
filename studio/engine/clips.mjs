// clips.mjs — internet media sourcing for Opuscar Studio (LAW 1 compliant).
//
// Fetches PHOTOS / IMAGES / SHORT CLIPS from public sources into a project's
// assets folder and records provenance for assets-credits.csv. Media enters the
// film ONLY as grade-matched full-frame plates / B-roll (ffmpeg frame
// extraction -> drawImage), printed props, or documented assets — never raw,
// ungraded stock, never AI-generated media (LAW 1). Every download gets
// license + source metadata.
//
// Sources:
//   - Wikimedia Commons (MediaWiki Action API, no key) — images, audio, video
//   - Pexels (optional, needs PEXELS_API_KEY env) — photos/videos
//   - Direct URL download — for any explicitly licensed public file
//   - .agents/skills/get-image: source guidance/licensing checklist; agent-browser for
//     pages without APIs (manual/assisted) — this CLI handles API/URL cases.
//
// CLI:
//   bun studio/engine/clips.mjs search commons "aurochs lithograph" [--limit 5]
//   bun studio/engine/clips.mjs search pexels "cow pasture" [--limit 5] [--kind photos|videos]
//   bun studio/engine/clips.mjs fetch commons <File:Name|pageid|url> --project <slug|path> [--id 20] [--as aurochs.jpg]
//   bun studio/engine/clips.mjs fetch url <https://...> --project <slug|path> --license "Public Domain" --source "URL" [--id 20]
//   bun studio/engine/clips.mjs manifest --project <slug|path>
//
// Output: assets/clips/<file>, assets/clips/manifest.json, and a CSV row for
// assets-credits.csv (never auto-appends; review license/attribution first).
import { mkdirSync, existsSync, readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname, basename, extname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const UA = 'OpuscarStudio/1.0 (code-drawn film assets; credits required)';
const COMMONS_API = 'https://commons.wikimedia.org/w/api.php';
const PEXELS_API = 'https://api.pexels.com/v1/search';
const PEXELS_VIDEO_API = 'https://api.pexels.com/videos/search';

function findRoot() {
  let d = process.cwd();
  for (let i = 0; i < 8; i++) {
    if (existsSync(join(d, 'studio', 'engine'))) return d;
    const p = dirname(d);
    if (p === d) break;
    d = p;
  }
  return process.cwd();
}
const ROOT = findRoot();

export function resolveProject(project) {
  if (!project) throw new Error('missing --project <slug|path>');
  const direct = resolve(project);
  if (existsSync(join(direct, 'build.mjs')) || existsSync(join(direct, 'world.mjs')) || existsSync(join(direct, 'assets'))) return direct;
  const bySlug = join(ROOT, 'studio', 'projects', project);
  if (existsSync(bySlug)) return bySlug;
  const base = join(ROOT, 'studio', 'projects');
  if (existsSync(base)) {
    const m = readdirSync(base).filter((d) => d.endsWith(`-${project}`) || d === project);
    if (m.length === 1) return join(base, m[0]);
  }
  throw new Error(`project not found: ${project}`);
}

async function fetchJson(url, headers = {}) {
  const res = await fetch(url, { headers: { 'user-agent': UA, accept: 'application/json', ...headers } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return res.json();
}
function sanitizeName(name) {
  return String(name).replace(/^File:/, '').replace(/[<>:"/\\|?*\x00-\x1f]/g, '_').replace(/\s+/g, '_').slice(0, 140);
}
function csvSafe(v) {
  return String(v ?? '').replace(/"/g, "'").replace(/\r?\n/g, ' ');
}
function isPdOrCc0(lic) {
  return /public domain|\bcc0\b/i.test(String(lic || ''));
}

// -- Wikimedia Commons ------------------------------------------------------
function normalizePage(p) {
  if (!p) return null;
  const ii = p.imageinfo?.[0] || {};
  const m = ii.extmetadata || {};
  const pick = (k) => (m[k]?.value || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const lic = pick('LicenseShortName') || pick('License') || 'VERIFY';
  const title = p.title || '';
  return {
    source: 'commons',
    title,
    pageid: p.pageid,
    pageUrl: `https://commons.wikimedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`,
    url: ii.url,
    mime: ii.mime,
    width: ii.width,
    height: ii.height,
    sha1: ii.sha1,
    license: lic,
    licenseUrl: pick('LicenseUrl'),
    artist: pick('Artist'),
    credit: pick('Credit'),
    attributionRequired: !isPdOrCc0(lic),
  };
}

export async function searchCommons(query, { limit = 5 } = {}) {
  const s = new URL(COMMONS_API);
  s.search = new URLSearchParams({
    action: 'query',
    format: 'json',
    origin: '*',
    generator: 'search',
    gsrsearch: query,
    gsrlimit: String(limit),
    gsrnamespace: '6',
    prop: 'imageinfo',
    iiprop: 'url|extmetadata|size|mime|sha1|user',
  }).toString();
  const j = await fetchJson(s.toString());
  return Object.values(j.query?.pages || {}).map(normalizePage).filter((r) => r && r.url);
}

export async function resolveCommons(ref) {
  if (/^\d+$/.test(String(ref))) {
    const u = new URL(COMMONS_API);
    u.search = new URLSearchParams({
      action: 'query', format: 'json', origin: '*', pageids: String(ref),
      prop: 'imageinfo', iiprop: 'url|extmetadata|size|mime|sha1|user',
    }).toString();
    const j = await fetchJson(u.toString());
    return normalizePage(Object.values(j.query?.pages || {})[0]);
  }
  if (/^https?:/.test(ref) && /commons\.wikimedia\.org\/wiki\//.test(ref)) {
    const title = decodeURIComponent(ref.split('/wiki/')[1]).replace(/_/g, ' ');
    const hits = await searchCommons(`intitle:"${title.replace(/^File:/, '')}"`, { limit: 6 });
    return hits.find((h) => h.title.toLowerCase() === title.toLowerCase()) || hits[0] || null;
  }
  if (/^https?:/.test(ref) && /upload\.wikimedia\.org/.test(ref)) {
    return {
      source: 'commons', title: basename(ref), url: ref, license: 'VERIFY',
      attributionRequired: true, pageUrl: ref,
      note: 'direct upload URL - verify license on file page before use',
    };
  }
  const title = String(ref).startsWith('File:') ? String(ref) : `File:${ref}`;
  const hits = await searchCommons(`intitle:"${title.replace(/^File:/, '')}"`, { limit: 6 });
  return hits.find((h) => h.title.toLowerCase() === title.toLowerCase()) || hits[0] || null;
}

// -- Pexels (optional) ------------------------------------------------------
export async function searchPexels(query, { limit = 5, kind = 'photos' } = {}) {
  const key = process.env.PEXELS_API_KEY;
  if (!key) throw new Error('PEXELS_API_KEY env var required for Pexels search');
  const api = kind === 'videos' ? PEXELS_VIDEO_API : PEXELS_API;
  const u = new URL(api);
  u.search = new URLSearchParams({ query, per_page: String(limit) }).toString();
  const j = await fetchJson(u.toString(), { Authorization: key });
  const items = j.photos || j.videos || [];
  return items.map((it) => ({
    source: 'pexels',
    kind,
    id: it.id,
    url: it.src?.original || (it.video_files || []).slice().sort((a, b) => (b.width || 0) - (a.width || 0))[0]?.link || it.url,
    pageUrl: it.url,
    thumb: it.src?.small || it.image,
    width: it.width,
    height: it.height,
    artist: it.photographer || it.user?.name,
    artistUrl: it.photographer_url || it.user?.url,
    license: 'Pexels License',
    licenseUrl: 'https://www.pexels.com/license/',
    attributionRequired: false,
    note: 'Pexels License allows use; attribution appreciated. Record source URL in credits.',
  }));
}

// -- Download + manifest ----------------------------------------------------
export async function downloadToProject(project, meta, { id, as } = {}) {
  const dir = resolveProject(project);
  const clipsDir = join(dir, 'assets', 'clips');
  mkdirSync(clipsDir, { recursive: true });
  if (!meta?.url) throw new Error('no download URL in metadata');
  const ext = extname(new URL(meta.url).pathname) || extname(meta.title || '') || '.bin';
  const baseName = sanitizeName(as || meta.title || `clip_${id || Date.now()}`);
  const outName = extname(baseName) ? baseName : baseName + ext;
  const outPath = join(clipsDir, outName);
  if (existsSync(outPath)) {
    console.error(`exists, reusing: ${outPath}`);
  } else {
    const res = await fetch(meta.url, { headers: { 'user-agent': UA } });
    if (!res.ok) throw new Error(`download failed ${res.status} ${meta.url}`);
    const buf = Buffer.from(await res.arrayBuffer());
    writeFileSync(outPath, buf);
    console.error(`downloaded ${buf.length} bytes -> ${outPath}`);
  }
  const manifestPath = join(clipsDir, 'manifest.json');
  const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : { items: [] };
  const rec = { ...meta, localFile: `assets/clips/${outName}`, downloadedAt: new Date().toISOString(), project: basename(dir) };
  manifest.items = manifest.items.filter((i) => i.localFile !== rec.localFile).concat(rec);
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  const csvId = id || (manifest.items.length + 20);
  const lic = meta.license || 'VERIFY';
  const notes = `Downloaded ${rec.downloadedAt} to ${rec.localFile}; ${meta.artist ? `Author: ${csvSafe(meta.artist)}; ` : ''}${meta.attributionRequired ? 'ATTRIBUTION REQUIRED - verify before publish; ' : ''}LAW 1: printed prop / grade-matched plate / documented asset only — never raw ungraded stock`;
  const csv = `${csvId},${csvSafe(meta.title || outName)},${csvSafe(meta.pageUrl || meta.url)},${csvSafe(lic)},"${notes}"`;
  return { outPath, manifestPath, record: rec, csvRow: csv };
}

// -- CLI --------------------------------------------------------------------
function arg(flag) {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : null;
}

async function main() {
  const [cmd, sub, ...rest] = process.argv.slice(2);
  if (cmd === 'search' && sub === 'commons') {
    const q = rest.filter((a) => !a.startsWith('-')).join(' ');
    console.log(JSON.stringify(await searchCommons(q, { limit: Number(arg('--limit') || 5) }), null, 2));
  } else if (cmd === 'search' && sub === 'pexels') {
    const q = rest.filter((a) => !a.startsWith('-')).join(' ');
    console.log(JSON.stringify(await searchPexels(q, { limit: Number(arg('--limit') || 5), kind: arg('--kind') || 'photos' }), null, 2));
  } else if (cmd === 'fetch' && sub === 'commons') {
    const ref = rest.find((a) => !a.startsWith('-'));
    const meta = await resolveCommons(ref);
    if (!meta) throw new Error(`not found: ${ref}`);
    if (meta.license === 'VERIFY' || (!/public domain|\bcc0\b|cc[- ]by|pexels/i.test(meta.license || ''))) {
      console.error(`WARNING: license "${meta.license}" - verify allowed use and attribution before publish.`);
    }
    const r = await downloadToProject(arg('--project'), meta, { id: arg('--id'), as: arg('--as') });
    console.log(JSON.stringify({ file: r.outPath, license: meta.license, attributionRequired: meta.attributionRequired, csvRow: r.csvRow }, null, 2));
  } else if (cmd === 'fetch' && (sub === 'url' || sub === 'direct')) {
    const url = rest.find((a) => !a.startsWith('-'));
    if (!url) throw new Error('missing url');
    const meta = {
      source: 'direct',
      title: basename(new URL(url).pathname),
      url,
      license: arg('--license') || 'VERIFY',
      licenseUrl: arg('--license-url'),
      artist: arg('--artist'),
      attributionRequired: !isPdOrCc0(arg('--license')),
      pageUrl: arg('--source') || url,
    };
    const r = await downloadToProject(arg('--project'), meta, { id: arg('--id'), as: arg('--as') });
    console.log(JSON.stringify({ file: r.outPath, csvRow: r.csvRow }, null, 2));
  } else if (cmd === 'manifest') {
    const dir = resolveProject(arg('--project'));
    const p = join(dir, 'assets', 'clips', 'manifest.json');
    console.log(existsSync(p) ? readFileSync(p, 'utf8') : '{"items":[]}\n');
  } else {
    console.error(`usage: bun studio/engine/clips.mjs search commons|pexels <query> [--limit N]
       bun studio/engine/clips.mjs fetch commons <File|pageid|url> --project <slug> [--id N] [--as name]
       bun studio/engine/clips.mjs fetch url <url> --project <slug> --license LICENSE --source URL
       bun studio/engine/clips.mjs manifest --project <slug>`);
    process.exit(2);
  }
}
if (import.meta.main || (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)) {
  main().catch((e) => { console.error(e.message || e); process.exit(1); });
}
