---
name: get-image
description: Find, verify and fetch EVERY kind of free/openly-licensed media from the public web for Opuscar films — photos, stock video/B-roll, archival footage, maps, music, SFX, fonts, SVG icons, textures, HDRIs, 3D models, datasets — from NASA to Unsplash to Wikimedia to museum open-access collections. Use to pick sources for clips.mjs (studio/engine/clips.mjs), verify licenses, and build the credits manifest. House law: AI-generated media banned (LAW 1); music beds must be real classical recordings, PD/CC0 composition+performance (MUSIC LAW); every asset lands a row in the project's assets-credits.csv; **LAW 9 — at least one real licensed external asset MUST appear in every film** (a film with zero source material fails).
---

Free media resources for an autonomous video-generation agent
For your video-production agent, I'd build a browser-accessible media library that searches free stock websites, public-domain archives, Creative Commons collections, and downloadable asset libraries. The goal is to let the agent find and download images, B-roll, archival footage, music, sound effects, illustrations, textures, and other assets without requiring API keys.


## ★ The complete open-media stack — everything under the sun
The full catalogue this repo's agents should draw from. Pick per beat, verify the actual file's license page every time, and record it in `assets-credits.csv` (studio/ASSETS-AND-CLIPS.md). Sections 1–11 below expand on these; this is the index.

**Photo / image / art / archive**
- General stock: Unsplash (free licence), Pexels, Pixabay, Burst by Shopify, Gratisography (rare), Kaboompics (CC), Negative Space, Life of Pix (PD-ish, check), PicJumbo.
- Wikimedia Commons (MediaWiki API — used by `clips.mjs`), Openverse (pdm/cc0/cc-by filter), Flickr Commons + Flickr CC, Public Domain Review, Internet Archive, DPLA, Europeana, WikiArt (PD paintings), Recipes of the Middle Ages? no — keep: Project Gutenberg (PD texts/illustrations), Wikisource scans.
- Museums (open access): Smithsonian Open Access (CC0), Met Open Access, Cleveland Museum of Art (CC0), Art Institute of Chicago, Rijksmuseum (CC0), Getty Open Content, Walters Art Museum, Yale CC0, Louvre (partially), National Gallery of Art (NGA Images, PD/CC0), British Museum (CC BY-NC-SA? — check per object, generally NOT for commercial), Science Museum Group (CC BY-NC-SA? check), Powerhouse (Sydney, CC0), Te Papa (CC BY? check).
- US government (PD): NASA Image & Video Library (images.nasa.gov), NASA SVS, NASA JPL Photojournal, NASA 3D Resources, NOAA, USGS Multimedia, NPS (nps.gov), CDC/NIOSH, FEMA, Library of Congress (Free to Use; National Screening Room), National Archives (NARA Catalog + Still Pictures), Smithsonian (again), Library of Congress Prints & Photographs Division.
- Space/Earth: ESA Space in Images (CC BY-SA 3.0 IGO), ESA/Hubble (CC BY 4.0), ESO (CC BY 4.0), JAXA, CSA/ASC, DLR (CC BY-SA? check), NASA GIBS (keyless tiles).
- Science: Science Museum Group Collection Online (CC BY-NC-SA? verify), Wellcome Collection (CC0/CC BY/CC BY-ND — some ND not allowed for derivatives, verify), Max Planck / arXiv figures (self-archived, verify), PLoS/eLife figures (CC BY), NIH/NIGMS image gallery (PD), CDC PHIL (PD).
- Maps/atlases: Natural Earth (PD — vectors for ink-style redraws), OpenStreetMap (ODbL), Natural Earth Data, Historical Maps (OldMapsOnline), David Rumsey Map Collection (free viewing; licensing varies — verify), Wikimedia Commons maps.
- Satellite: NASA GIBS/Worldview, NASA Visible Earth (PD), USGS EarthExplorer (PD), Sentinel Hub/Copernicus (CC BY 4.0 for Sentinel data), ESA Sentinel, NOAA GOES (PD).

**Video footage / B-roll / archival**
- Modern stock: Pexels, Pixabay, Unsplash? (photos only) — Pexels & Pixabay video; Mixkit (check per-clip), Coverr (no attribution; no AI-training use), Videvo (check tier), Mazwai, Life of Vids, Dareful (4K), Vidsplay, Videezy (check), Splitshire (CC0-ish, check), Distill (free w/ attribution?), Mazwai.
- Historical/archival: Internet Archive (Prelinger Archives — verify per film), LoC National Screening Room, NARA, NASA SVS, Critical past? no.
- Timelapse/nature: Pixabay, Dareful, Coverr, Mixkit, Pexels.
- NASA/NOAA/USGS video libraries (PD).

**Music (bed rule: REAL classical recordings, composition+performance PD/CC0 — MUSIC LAW)**
- Musopen, Wikimedia Commons audio (PD/CC0), Openverse (pdm/cc0/cc-by), Internet Archive PD collections, IMSLP recordings (per-file license), FreePD (verify), LoC/NASA audio (PD), Musopen, Naxos? no (paid).
- NOT for beds: Incompetech, YouTube Audio Library, FMA, Pixabay Music (license not guaranteed classical-PD — fine for temp/reference, not for publish).
- Classical composers in PD (composition): Bach, Mozart, Beethoven, Chopin, Debussy (d.1918, PD in EU/US post-1998), Satie (d.1925), Ravel (d.1937, PD in US; EU life+70 → PD 2008), Puccini (d.1924). RECORDING must also be PD/CC0.

**SFX / ambience**
- Mixkit SFX, Pixabay SFX, Freesound (CC0 & CC-BY; attribution for CC-BY), Sonniss GDC bundles (free commercial), Kenney SFX (CC0), BBC Sound Effects Library (research use only — licence restricts commercial: verify, generally avoid for publish), YouTube Audio Library SFX.

**Icons / SVG / graphics**
- Tabler (MIT), Lucide (ISC/MIT), Heroicons (MIT), Bootstrap Icons (MIT), Phosphor (MIT), Font Awesome Free (CC-BY + MIT; attribution), OpenMoji (CC BY-SA 4.0), unDraw (free; no AI training/rescraping), Storyset, illlustrations?; Wikimedia Commons SVG maps; Twemoji (CC-BY 4.0); Streamline (free tier).

**Textures / HDRI / 3D**
- Poly Haven (CC0 — HDRIs, textures, models), ambientCG (CC0 — PBR), Kenney (CC0 — sprites/props/audio/UI), Quaternius (CC0-ish), Sketchfab (per-model license), NASA 3D Resources, Smithsonian 3D, Google Poly (archived — avoid), Blender Studio open assets (CC-BY, e.g., spring/elephants dongle? — check per project), 3D Warehouse (varies — avoid unclear).

**Fonts** (open source only)
- Google Fonts (OFL/Apache), Fontshare, Bunny Fonts, Font Squirrel list, Velvetyne (OFL). Repo house fonts: Archivo Black, Caveat, Noto Serif (OFL, already vendored in `studio/assets/fonts/`).

**Datasets (for charts/maps/viz beats)**
- Natural Earth, USGS, Census (PD), World Bank (CC BY 4.0), Our World in Data (CC BY), Gapminder (CC BY), UN (varies — check), NASA/NOAA climate (PD), Copernicus (CC BY), OpenStreetMap (ODbL), Wikidata (CC0), Eurostat (free w/ attribution), OECD (varies).

**Tools / libs (open source, agent can install)**
- ffmpeg (LGPL/GPL), Blender (open), GIMP/Krita/Inkscape/Audacity (GPL), leafmap/geemap (MIT — see `.agents/skills/leafmap`), osmium/osmconvert, osmnx (OSM analysis), QGIS (GPL), Natural Earth QGIS styles.

### House rules while sourcing (binding)
1. **AI-generated media is banned forever (LAW 1)** — even if tagged "free"/CC0. No exceptions.
1a. **A film MUST include ≥1 real licensed external asset (LAW 9)** — this catalog is how you find it; the film is not shippable without it.
2. **Music beds**: real classical recordings only, PD/CC0 composition AND performance, from open public-data sources (§5). All other music is for reference only — never publish it.
3. **Every asset → `assets/assets-credits.csv`** (id, source URL, license, attribution, modification). Attribution-required → delivered off-frame (credits CSV + video description credit block). On-frame credit/license text is banned (LAW 16, user directive Nov 2026).
4. **Grade before composite** (bible §4): black/white/gamma/contrast, split-tone, light-wrap, contact shadow; QC still at entry/mid/exit (LAW 8). Never raw stock straight to the timeline.
5. **Never misrepresent** stock/archival as original footage; never strip watermarks; never bypass paywalls/CAPTCHAs; respect rate limits & terms; prefer Commons API / `clips.mjs`.
6. If close to majority-stock composition, redesign the beat (bible §8.4).

One important distinction: a website can be free to browse and download from without permitting unrestricted automated scraping. The agent should use ordinary webpages and their permitted download options, respect site terms, and check each asset's licence.
1. Start with these core sources









Unsplash
No API key for website downloads
High-quality photography: landscapes, architecture, portraits, nature, abstract backgrounds, technology and cinematic imagery. Free commercial use is allowed under its licence; attribution is appreciated but not required. Not for compiling a competing stock-image service. 

Unsplash













Pexels
No API key for website downloads
One of the best all-round sources for both photos and video footage: people, everyday life, cities, landscapes, work, slow motion and vertical-video B-roll. Free commercial use, with no attribution requirement, subject to the licence restrictions. 

Pexels+1













Pixabay
No API key for website downloads
Photos, illustrations, vectors, video clips, music, sound effects and backgrounds. Especially useful when the agent needs several different media types from one place. Follow the Pixabay Content Licence, including its restrictions on standalone redistribution and certain uses of identifiable brands. 

Pixabay













Wikimedia Commons
No API key needed to browse
Excellent for your etymology, comparative mythology and history videos: historical photographs, paintings, manuscript scans, maps, diagrams, audio and video. Licensing varies by file; many Creative Commons files need attribution, while others are public domain. 

Wikimedia Foundation













Mixkit

Free stock footage, music, sound effects, and video templates. Many assets can be used in commercial video projects without attribution, but Mixkit has different licences for different asset types. The agent must check the licence shown for each download. 

No Watermark+1













Coverr

Free video B-roll and music for commercial and non-commercial projects, generally without required attribution. Check releases and restrictions for identifiable brands, people, and property. Its licence also prohibits using its media to train AI models or build datasets. 

Coverr




These should be the agent's first stops for ordinary stock imagery and footage. For more unusual, historical, scientific or mythological topics, the archives below can be substantially more useful.
2. Open-access archives and historical media
These are particularly valuable for your channel's etymology, comparative mythology, symbolism, ancient history, philosophy, and cultural references.
Resource	What the agent can find	Licence / access notes
Openverse	Search across openly licensed images and audio	Free search; verify each asset's licence and attribution independently. It does not directly index all video types.  Openverse
Internet Archive	Old films, documentaries, recordings, photographs, books, and historical material	Check each item's individual rights and usage terms.
Prelinger Archives	Vintage educational films, advertising, industrial films, and archival footage	Reuse depends on the licence attached to the specific film.  Internet Archive Help Center
Library of Congress — Free to Use and Reuse	Historical photographs, illustrations, posters, and collections	Curated starting point; rights can still vary.  Library of Congress
Library of Congress — National Screening Room	Historical films and moving images	The Library says most films in these collections have no known US copyright restrictions, but inspect individual records.  Library of Congress
Flickr Creative Commons	Community photography under various CC licences	Check the individual image's licence, creator, and attribution requirements.
Flickr Commons	Photographs from cultural institutions and historical archives	“No known copyright restrictions” is not a guarantee that every possible use is cleared.  Flickr
Europeana	European art, museum collections, manuscripts, and cultural heritage	Filter by reuse rights and check the record for each asset.
Digital Public Library of America	US cultural heritage collections, photographs, documents, and media	Follow the rights information from the contributing institution.
Public Domain Review	Unusual historical images, artwork, films, and curiosities	Excellent discovery source; follow through to the original collection and verify rights.

Why Openverse is useful: the agent can search for the same subject across many contributing collections rather than searching each archive individually. For example, it can search for ancient Greek sculpture, medieval alchemy manuscript, or mythological underworld painting and then filter for commercial reuse.
3. Museums and institutional image libraries
Museum archives are excellent when you need historically grounded, visually distinctive images instead of generic stock footage.









Smithsonian Open Access

High-resolution museum images, scientific objects, historical artifacts, natural history and downloadable 3D models. Select records marked CC0 for unrestricted reuse under the CC0 dedication. 

Smithsonian Institution












The Metropolitan Museum of Art — Open Access

Public-domain artworks, ancient sculpture, Egyptian artifacts, paintings, decorative arts, and some 3D objects. Look for the Open Access / OA designation. 

The Metropolitan Museum of Art












Cleveland Museum of Art — Open Access

Public-domain artwork images and collection metadata available under CC0, including for commercial digital media projects. 

Cleveland Museum of Art












Art Institute of Chicago — Open Access

Paintings, prints, drawings, and historical artwork. Use the records marked as eligible for open-access image reuse.



Additional sources worth adding:
- National Archives Catalog — government photographs, historical footage, documents and records; check the rights statement for each item.
- NASA Image and Video Library — space, planets, spacecraft, astronauts and Earth imagery.
- NASA Scientific Visualization Studio — scientific visualizations and animations covering space, climate, Earth science and astrophysics.
- NASA JPL Photojournal — planetary science, missions, spacecraft and processed imagery.
- USGS Multimedia Gallery — geology, Earth science, wildlife, landscapes, video and audio; generally public domain unless otherwise marked. 
  
  U.S. Geological Survey
NASA note: much NASA-produced imagery is usable without a copyright licence in the United States, but certain third-party imagery and trademarks have separate restrictions. The agent should inspect NASA's media usage guidelines before reuse. 

NASA

4. More free video and stock-footage sources
These extend the original Pexels, Pixabay, Mixkit and Coverr collection.
Resource	Best use	Notes
Life of Vids	Short stock footage and landscapes	Review current reuse conditions.
Dareful	High-quality 4K landscape and nature footage	Check the applicable attribution and licence terms.
Videvo	Stock footage, motion graphics and effects	Free downloads can have different licence and attribution requirements.
Vidsplay	General B-roll and background footage	Check the required credit wording.
Mazwai	Cinematic, atmospheric footage	Verify the licence attached to the selected clip.
Wikimedia Commons — Videos	Historical, scientific, cultural and documentary footage	Per-file licences apply.
Internet Archive — Movies	Archival films, documentaries and vintage video	Rights vary substantially by item.

For a monetized YouTube workflow, have the agent prioritize the main stock libraries and clearly licensed archival sources. The smaller sites are useful secondary sources, but not every clip is automatically free for commercial use.
5. Music, ambience and sound effects
A good video agent should search for music and effects separately. That makes it easier to build a consistent sound palette across a channel.
Resource	What to source	Important caveat
YouTube Audio Library	Background music, transitions and sound effects	Available through YouTube Studio; sign-in required, but no API key is needed. Some tracks require attribution.  YouTube Help
Pixabay Music	Cinematic beds, ambient music, electronic music and instrumentals	Follow the Pixabay Content Licence.
Mixkit Music	Background tracks and music for videos	Check the particular item's licence.
Mixkit Sound Effects	Whooshes, impacts, notification sounds, nature ambience and transitions	Free effects are available without signup, with a licence permitting use in larger creative projects.  Mixkit+1
Freesound	Field recordings, room tones, ambience, unusual textures and individual sound effects	Licence varies by upload; downloading may require an account.
Sonniss GDC Audio Bundles	Large sound-effects packs, designed for games and audiovisual production	The 2026 bundle advertises free commercial use without attribution. Preserve its licence with the downloaded pack.  SONNISS
Incompetech	Composed music, including cinematic and suspenseful tracks	Its free Creative Commons option requires credit; other licensing options may cost money.  incompetech.com
Free Music Archive	Independent music and niche musical styles	Inspect each track's terms before commercial use.
ccMixter	Remixes, instrumentals and music under Creative Commons licences	Attribution and commercial-use permissions vary.
Musopen	Classical music and performances	Verify the recording's own rights, not just the underlying composition.
FreePD	Music presented as public-domain material	Confirm the stated terms for the particular download.
ZapSplat	Large sound-effects library	Free access can involve account and attribution conditions.

For your style of videos, search using terms such as:

dark ambient, mystical drone, ethereal textures, cinematic pulse, ancient ritual, tension riser, sub-bass impact, tape hiss, analog glitch, distant thunder, wind ambience and soft mechanical hum.

Important: “Royalty-free” does not necessarily mean public domain or unrestricted. The agent should record the exact licence for every music track and sound effect.
6. Illustrations, icons, SVGs and visual overlays
These are useful for diagrams, character labels, cards, symbols, HUD elements, line illustrations and transparent overlays.
Resource	Best use	Licence/access notes
SVG Repo	Individual SVG icons, symbols, illustrations	Licences vary; check the individual asset.
Tabler Icons	Consistent line icons and diagrams	MIT-licensed open-source icons.  GitHub
Lucide	Clean outline icons and interface symbols	Open-source icon library.
Heroicons	Simple, polished interface icons	MIT-licensed library.
Bootstrap Icons	Common symbols and UI graphics	Open-source icon set.
OpenMoji	Colourful emoji and expressive symbols	CC BY-SA 4.0; follow attribution and share-alike terms.
unDraw	Minimal vector-style illustrations	Free commercial use, but its terms restrict AI training and certain automated scraping or redistribution activities. Do not use it as an unrestricted scraping target.  unDraw
Openclipart	Clip art, simple visual elements and vector graphics	Check the site's current terms for your intended use.
Pixabay Illustrations	General illustrations and backgrounds	Follow the Pixabay Content Licence.
Freepik	Templates, vectors, illustrations and stock graphics	Free downloads may require attribution; check each asset's terms.
LottieFiles	Animated icons, loops and small motion graphics	Community animation licences and download conditions vary.

For fully automated production, open-source SVG libraries such as Tabler, Lucide and Heroicons are particularly practical because the agent can download or bundle the SVG files and composite them locally without depending on a stock-site API.
7. Textures, backgrounds, HDRIs and 3D models
Useful for custom video backgrounds, virtual environments, generated motion graphics, 3D scenes and original B-roll.









Poly Haven
CC0 · No account required
HDRI environments, photogrammetry-based textures and 3D models. Its assets are CC0 and can be used for commercial work without attribution. 

Poly Haven+1












ambientCG

PBR textures, surfaces, materials and HDRI environments. A useful source for concrete, stone, paper, metal, old walls and textured backdrops; verify the current licence information.











Kenney Assets

2D sprites, 3D props, objects, UI elements, audio and game-ready assets. The individual asset pages use CC0, allowing commercial use without mandatory attribution. 

Kenney












Quaternius

Downloadable 3D environment assets, characters, animals, props and animations. Its released packs are generally CC0; confirm the licence accompanying each download. 

Patreon




Also useful:
- Sketchfab — downloadable 3D models; licence and download permission vary by model.
- NASA 3D Resources — spacecraft, planets and scientific models; check each resource's usage terms.
- Smithsonian 3D collections — digitized objects and museum models; reuse depends on whether the item is marked CC0. 
  
  Smithsonian Institution+1
8. Fonts and typography
Resource	Use
Google Fonts	Downloadable font families for titles, captions and body text
Fontshare	Distinctive display, editorial and branding fonts
Bunny Fonts	Web-hostable font collection
Font Squirrel	Font discovery and commercially usable fonts, subject to individual licence terms
Velvetyne	Experimental and unusual open-source typography

For the channel's recurring visual language, the agent should maintain a fixed typography set rather than selecting a different font for each video. Keep font files, licence files and font-family names in the project assets folder.
9. Useful free production tools without hosted API keys
These are not media libraries; they let an agent process the assets locally.
Tool	What it does
FFmpeg	Trim footage, extract frames, convert formats, compose clips, mix audio and encode the final video
Blender	Create 3D scenes, camera moves, animation, lighting and rendered backgrounds
Kdenlive	Nonlinear video editing
Shotcut	Video editing and effects
Krita	Painting, character cutouts, backgrounds and image composition
GIMP	Image editing, masks and asset preparation
Inkscape	SVG illustration, diagrams and vector composition
Audacity	Audio editing, noise cleanup and sound design
OBS Studio	Recording and capture

For a locally operated pipeline, combining browser-based asset discovery with FFmpeg, Blender and your existing local media models means the agent does not need a hosted video-production API just to assemble a video.

10. Rules to give your agent
The source list is only half the solution. You also need the agent to maintain an auditable record of the media it downloads.
Free Media Acquisition Policy for Video Generation
Objective
Find, verify and download freely usable visual and audio assets for video production using ordinary webpages and permitted download links. Do not require paid subscriptions, API keys or hosted API access for asset discovery and downloading.
Preferred source order
1. No-attribution stock libraries: Pexels, Pixabay, Unsplash, Mixkit and Coverr.
2. Public-domain and open-access archives: Wikimedia Commons, Openverse, Internet Archive, Library of Congress, NASA, USGS and eligible museum collections.
3. Creative Commons and specialist repositories: Freesound, Flickr, Free Music Archive, SVG libraries and specialist footage providers.
4. Other sources only when the individual asset has a clear, compatible licence.
Download and verification
For every asset:
- Search using descriptive keywords, synonyms, subject terms and visual-style terms.
- Open the original asset page rather than relying on a search-engine thumbnail.
- Confirm the actual download option and licence.
- Check commercial-use permissions, attribution requirements, derivatives, share-alike requirements and restrictions on identifiable people, brands or artwork.
- Prefer the original downloadable file or the highest appropriate resolution.
- Skip assets with ambiguous rights, broken source attribution or incompatible licences.
- Never bypass authentication, paywalls, CAPTCHAs, access controls or site restrictions. Respect applicable site terms and rate limits.
Required asset manifest
Save an assets.csv file with these fields:

asset_id, filename, asset_type, title, creator, source_site, source_page_url, original_file_url, licence_name, licence_url, attribution_text, commercial_use, modification_allowed, restrictions, download_date, resolution, duration_seconds, notes

Store the accompanying licence evidence or an appropriate record of the source page wherever practical.
Video assembly
- Keep all downloaded assets inside a project-specific directory.
- Match images and footage to the narration, shot duration and intended aspect ratio.
- Use music and effects only when their licence permits the intended project.
- Add required attribution to the appropriate video credits or description.
- Avoid repeatedly using the same shot when suitable alternatives exist.
- Never describe a stock or archival clip as original footage filmed by the channel.
- Never treat "free download" or "royalty-free" as proof of public-domain status.
Final audit
Before rendering or publishing, inspect the asset manifest, confirm all required credits, remove unverified assets, and produce a separate attribution file containing all credits needed for the final video description or end credits.




11. Recommended setup
For a first implementation, I'd use Pexels + Pixabay + Unsplash + Wikimedia Commons + Openverse + Internet Archive + Mixkit + NASA + Smithsonian + Poly Haven as the primary source catalog. This gives the agent modern B-roll, still photography, historical imagery, scientific footage, music, sound effects, illustrations and 3D environments.

The important technical distinction is that no API key is not the same as unrestricted automated access. Most of these resources can be used through their normal websites without API keys, but downloads, account requirements and automation permissions differ. The agent should fall back to another permitted source whenever one site blocks automated access.