---
name: leafmap
description: Use the open-source Python library leafmap (MIT) to fetch, analyze and render geospatial map plates and flythrough frames for Opuscar films — world/region maps, routes, coastlines, spread maps, choropleths, satellite/Earth-science imagery — then composite grade-matched into world.mjs (printed prop or full-frame plate). Use when a beat needs a REAL map (geography, journeys, migrations, historical atlases), when the code-drawn spreadMap cast is not enough, or for satellite plates (NASA GIBS). Covers install, headless render paths (HTML→agent-browser screenshot vs matplotlib/geopandas PNG), tile/basemap licensing with mandatory attribution, Natural Earth (public domain), OSM/Esri/NASA sources, offline PMTiles/MBTiles, credits discipline (LAW 1), and house-style compositing (LAW 5/8, grade before composite).
---

# Leafmap for Opuscar Studio Films

open-source Python for interactive & static maps: **leafmap** (MIT) — https://github.com/opengeos/leafmap · https://leafmap.org · PyPI `leafmap`. Backends: folium (default), ipyleaflet, maplibregl, pydeck, plotly, kepler.gl, bokeh; companion **geemap** for Google Earth Engine; 500+ WhiteboxTools built in for raster/vector analysis.

Verified on this machine (Nov 2026): `pip install leafmap` → **leafmap 0.64.3**, headless HTML export OK, matplotlib direct-PNG path OK.

## When to use it (vs the house ink spreadMap)
| Need | Use |
|------|-----|
| Stylized diagram, spread arrows, Mediterranean sketch | engine `spreadMap()` in `characters.mjs` (house identity) |
| REAL geography: coastlines, exact borders, routes, sat/aerial plates, choropleths, real DEM | **leafmap** (this skill) |
| House world stays paper — leafmap output enters as a graded plate/print (LAW 1) | always |

## Install (Windows, verified)
```bash
pip install leafmap                       # core (folium/ipyleaflet) — verified 0.64.3
conda/mamba for GDAL-backed extras:       # raster/vector (localtileserver, rioxarray, geopandas)
mamba create -n geo -c conda-forge python=3.12 leafmap geopandas localtileserver gdal
```

## Three render paths to a 3840×1646 (21:9) plate
All produce a PNG dropped into `assets/clips/maps/` (then `drawPrint`, or full-frame plate via ffmpeg frame extraction — bible §4).

**A. Headless HTML → screenshot** (most styling power; needs a browser)
```python
import leafmap
m = leafmap.Map(center=(41.0, 29.0), zoom=3, height=823)   # 1920×823 design, ×2 for 4K
m.add_basemap('Esri.WorldImagery')
m.add_geojson(route_geojson)                                # routes, coasts, overlays
m.to_html(r'assets/clips/maps/beat14.html')
```
→ open with the **`.agents/skills/agent-browser`** skill at exactly the design viewport and screenshot; verify 3840×1646 or 2× scale factor. Use for flythroughs: loop center/zoom states, screenshot each, pipe PNGs to the canvas as a plate sequence.

**B. Direct static PNG, no browser** (simplest, robust; chart-like plates)
```python
import matplotlib; matplotlib.use('Agg')
import matplotlib.pyplot as plt, geopandas as gpd
world = gpd.read_file('https://naturalearth.s3...' )        # or local Natural Earth 110m shapefile (Public Domain)
fig, ax = plt.subplots(figsize=(19.2, 8.234), dpi=200)
world.plot(ax=ax, color='#f4ead8', edgecolor='#1c1814')
ax.axis('off'); fig.savefig('plate.png', facecolor='#f4ead8', bbox_inches='tight')
```
PAPER background `#f4ead8`, ink strokes — plates arrive pre-matched to the house palette (bible §4.1).

**C. Analysis → plate** — use leafmap/geopandas to *derive* data (buffers, routes from OSM, watersheds via WhiteboxTools), then hand to path B for the final render.

## Basemaps & data (license = verify per use; attribution mandatory)
| Source | Content | License / notes |
|--------|---------|-----------------|
| Natural Earth | coastlines, borders, rivers, lakes | **Public Domain** — ideal for ink-style redraws |
| NASA GIBS (`gibs.earthdata.nasa.gov`) | global satellite/Earth-science imagery | US-gov-derived, effectively PD; attribute NASA |
| USGS / NOAA | topo maps, DEM, bathymetry, imagery | US federal works, PD (check item) |
| OSM standard tiles (`tile.openstreetmap.org`) | street basemap | ODbL — attribution `© OpenStreetMap contributors` **required**; tile usage policy: no bulk scraping/serving; fine for a few plates per film |
| Esri World Imagery / Topo | satellite/topo | Free w/ attribution: `Esri, Maxar, Earthstar Geographics…` |
| CARTO basemaps (positron/dark matter) | clean styled basemap | Free w/ attribution (© CARTO + OSM) |
| OpenTopoMap | topo | CC-BY-SA 3.0 — share-alike on derivatives |
| Overture Maps | POI, buildings, roads | CDLA-Permissive-1.0 |
| Wikimedia Commons maps | historical/thematic atlases | per-file licenses (mostly PD/CC) |
| Wikidata SPARQL | geography for overlays | CC0 for data |
| Natural Earth / DEM | elevation | Public Domain |

## House-law checklist (before the plate enters the timeline)
1. **LAW 1**: every basemap/imagery/dataset gets a row in the project's `assets/assets-credits.csv` (source URL, license, attribution text, modification note) — including PD sources.
2. Attribution-required → **on-screen end-card credit block** in the film (LAW 1), not only the CSV.
3. Never present a basemap/satellite plate as "our drone footage" (LAW 1, get-image §7). Never AI-upscale/hallucinate missing geography (LAW 1 — banned forever).
4. **Grade before composite** (bible §4.1): black/white/gamma/contrast match, split-tone toward the warm-key/cool-shadow palette, Ken Burns ≤5%/beat, contact shadow + light-wrap on printed maps, plate QC stills at entry/mid/exit (LAW 8).
5. **LAW 5**: a plate resting on the paper owns a contact shadow with correct light direction (§1.11 bible).
6. Never scrape OSM tiles in bulk; never embed live map URLs at render time — **snapshot/screenshot only**.
7. Film credit text (end-card example): `Map imagery © Esri, Maxar, Earthstar Geographics · © OpenStreetMap contributors · NASA Worldview (GIBS)`.

## Pipeline (per project)
```
projects/<slug>/tools/make-maps.py     # scratch, reproducible (gitignore *_analysis/scratch)
        ↓  writes
assets/clips/maps/*.png                # plates (manifest row in assets/clips/manifest.json)
        ↓  verify
python -X utf8 -c "import leafmap; print(leafmap.__version__)"
        ↓  composite
world.mjs → drawPrint(loadImage(new URL('./assets/clips/maps/beat14.png', import.meta.url)), ...)
        ↓  QC (LAW 8)
bun render.mjs stills <entry,mid,exit> --scale 4
```

## Banned
Mass-scraping OSM tiles · live-embedded map iframes in renders · unattributed basemaps · satellite imagery without checking third-party rights (NASA is fine; Maxar via Esri requires attribution, check terms) · "satellite-looking" AI hallucinations · plates mismatched to paper palette straight to the timeline · credit left only in the CSV.

## Related skills & laws
`.agents/skills/get-image` (source catalogue) · `.agents/skills/cinematic-motion-graphics` (bible §4 plates) · `.agents/skills/agent-browser` (screenshots) · `.agents/skills/opuscar-video-studio` (workflow) · AGENTS.md LAW 1/1b/5/8.
