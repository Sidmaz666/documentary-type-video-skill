'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Download,
  Film,
  Music,
  PenLine,
  Clock,
  Archive,
  AlertTriangle,
  Clapperboard,
} from 'lucide-react'
import { featuredFilm } from '@/lib/films'
import { Button } from '@/components/ui/button'

const GOLD = '#c9a227'

export default function ScreeningRoom() {
  const film = featuredFilm
  const videoRef = useRef<HTMLVideoElement>(null)
  const barRef = useRef<HTMLDivElement>(null)

  const [state, setState] = useState<'loading' | 'ready' | 'missing'>('loading')
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [time, setTime] = useState(0)
  const [dur, setDur] = useState(film.duration)

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const ok = () => setState('ready')
    const bad = () => setState('missing')
    const meta = () => {
      if (Number.isFinite(v.duration) && v.duration > 0) setDur(v.duration)
    }
    const tick = () => setTime(v.currentTime)
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    v.addEventListener('loadedmetadata', ok)
    v.addEventListener('loadedmetadata', meta)
    v.addEventListener('error', bad)
    v.addEventListener('timeupdate', tick)
    v.addEventListener('play', onPlay)
    v.addEventListener('pause', onPause)
    // Hydration race: the browser may fire `loadedmetadata` BEFORE React
    // attaches these listeners (cached video). Re-read the state directly.
    if (v.readyState >= 1) {
      ok()
      meta()
    }
    return () => {
      v.removeEventListener('loadedmetadata', ok)
      v.removeEventListener('loadedmetadata', meta)
      v.removeEventListener('error', bad)
      v.removeEventListener('timeupdate', tick)
      v.removeEventListener('play', onPlay)
      v.removeEventListener('pause', onPause)
    }
  }, [])

  const seek = useCallback(
    (t: number) => {
      const v = videoRef.current
      if (!v) return
      const max = Number.isFinite(v.duration) && v.duration > 0 ? v.duration : film.duration
      v.currentTime = Math.max(0, Math.min(t, max - 0.05))
      setTime(v.currentTime)
    },
    [film.duration],
  )

  const togglePlay = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) v.play().catch(() => {})
    else v.pause()
  }, [])

  const toggleMute = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    v.muted = !v.muted
    setMuted(v.muted)
  }, [])

  const fullscreen = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    if (v.requestFullscreen) v.requestFullscreen().catch(() => {})
  }, [])

  const barSeek = useCallback(
    (clientX: number) => {
      const el = barRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const ratio = Math.min(1, Math.max(0, (clientX - r.left) / r.width))
      seek(ratio * dur)
    },
    [dur, seek],
  )

  const onBarKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); seek(time + 5) }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); seek(time - 5) }
      else if (e.key === 'Home') { e.preventDefault(); seek(0) }
      else if (e.key === 'End') { e.preventDefault(); seek(dur - 0.1) }
    },
    [dur, seek, time],
  )

  const activeIdx = film.scenes.findIndex(
    (s, i) =>
      time >= s.start &&
      time < s.end &&
      (i < film.scenes.length - 1 || time < film.scenes[i].end),
  )
  const activeScene = activeIdx >= 0 ? activeIdx : time >= film.scenes[film.scenes.length - 1].start ? film.scenes.length - 1 : 0
  const pct = dur > 0 ? Math.min(100, Math.max(0, (time / dur) * 100)) : 0

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0a08] text-stone-300 selection:bg-[#c9a227]/30">
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="border-b border-[#c9a227]/15">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Clapperboard className="w-4 h-4" style={{ color: GOLD }} aria-hidden="true" />
            <span className="text-xs tracking-[0.3em] uppercase text-stone-400">
              Opuscar <span className="text-stone-600">·</span>{' '}
              <span style={{ color: GOLD }}>Code-drawn cinema</span>
            </span>
          </div>
          <span className="hidden sm:block text-[11px] tracking-widest uppercase text-stone-600">
            Reel 001
          </span>
        </div>
      </header>

      <main className="flex-1">
        {/* ── Marquee ──────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-8 text-center">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-[11px] sm:text-xs tracking-[0.35em] uppercase mb-4"
            style={{ color: GOLD }}
          >
            Opuscar Studio presents
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl md:text-6xl text-stone-100 leading-tight"
          >
            The Bravest Snack
            <span className="block italic" style={{ color: GOLD }}>
              in History
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-4 text-sm sm:text-base text-stone-400 max-w-2xl mx-auto"
          >
            A code-drawn documentary — one continuous camera move over a 20,000&nbsp;px paper
            world. No AI video. No stock footage. Every frame painted by a program.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-6 flex flex-wrap justify-center gap-2"
          >
            {[
              '3840 × 1646',
              '21:9',
              '30 fps',
              '976 frames',
              'H.264 + AAC',
              '32.5 s',
            ].map((s) => (
              <span
                key={s}
                className="text-[11px] tracking-wider uppercase px-2.5 py-1 rounded-full border border-[#c9a227]/25 bg-[#c9a227]/5 text-stone-400"
              >
                {s}
              </span>
            ))}
          </motion.div>
        </section>

        {/* ── The screen ───────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="rounded-xl border border-[#c9a227]/20 bg-black shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)] overflow-hidden"
          >
            <div className="relative bg-black aspect-[21/9] group">
              <video
                ref={videoRef}
                src={film.videoUrl}
                poster="/film/poster.jpg"
                preload="metadata"
                playsInline
                className="absolute inset-0 w-full h-full object-contain"
                aria-label={`Play ${film.title}`}
                onClick={togglePlay}
              />

              {/* click-to-play veil */}
              {!playing && state === 'ready' && (
                <button
                  onClick={togglePlay}
                  aria-label="Play film"
                  className="absolute inset-0 flex items-center justify-center bg-black/35 transition-colors hover:bg-black/45"
                >
                  <span
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center border-2 shadow-2xl transition-transform group-hover:scale-105"
                    style={{ borderColor: GOLD, backgroundColor: 'rgba(201,162,39,0.15)' }}
                  >
                    <Play className="w-7 h-7 sm:w-9 sm:h-9 translate-x-0.5 text-stone-100" fill={GOLD} />
                  </span>
                </button>
              )}

              {state === 'loading' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black">
                  <div className="flex flex-col items-center gap-3">
                    <Film className="w-6 h-6 animate-pulse" style={{ color: GOLD }} aria-hidden="true" />
                    <span className="text-xs tracking-[0.25em] uppercase text-stone-500">
                      Reeling the film…
                    </span>
                  </div>
                </div>
              )}

              {state === 'missing' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black p-6">
                  <div className="flex items-start gap-3 max-w-md text-left">
                    <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" style={{ color: GOLD }} aria-hidden="true" />
                    <div>
                      <p className="text-sm text-stone-200 font-medium">The projector jammed</p>
                      <p className="text-xs text-stone-500 mt-1">
                        The film file could not be loaded. It should live at{' '}
                        <code className="text-stone-400">{film.videoUrl}</code> — check the
                        published file and refresh.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* controls */}
            <div className="px-3 sm:px-5 py-3 bg-[#100e0b] border-t border-[#c9a227]/15 flex items-center gap-3 sm:gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePlay}
                disabled={state !== 'ready'}
                aria-label={playing ? 'Pause' : 'Play'}
                className="shrink-0 hover:bg-[#c9a227]/10 hover:text-[#c9a227] text-stone-200"
              >
                {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </Button>

              <div
                ref={barRef}
                role="slider"
                tabIndex={0}
                aria-label="Seek"
                aria-valuemin={0}
                aria-valuemax={Math.round(dur * 10) / 10}
                aria-valuenow={Math.round(time * 10) / 10}
                aria-valuetext={`${time.toFixed(1)} seconds of ${dur.toFixed(1)}`}
                onPointerDown={(e) => {
                  e.currentTarget.setPointerCapture(e.pointerId)
                  barSeek(e.clientX)
                }}
                onPointerMove={(e) => {
                  if (e.buttons & 1) barSeek(e.clientX)
                }}
                onKeyDown={onBarKeyDown}
                className="relative flex-1 h-6 flex items-center cursor-pointer group/bar select-none touch-none focus:outline-none"
              >
                <div className="absolute inset-x-0 h-1.5 rounded-full bg-stone-800 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, backgroundColor: GOLD }}
                  />
                </div>
                <div
                  className="absolute w-3 h-3 rounded-full border-2 border-[#0b0a08] shadow transition-transform group-hover/bar:scale-125"
                  style={{ left: `calc(${pct}% - 6px)`, backgroundColor: GOLD }}
                />
              </div>

              <span className="shrink-0 text-[11px] sm:text-xs tabular-nums text-stone-400 font-medium">
                {time.toFixed(1).replace('.', ',')}s{' '}
                <span className="text-stone-600">/ {dur.toFixed(1).replace('.', ',')}s</span>
              </span>

              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                aria-label={muted ? 'Unmute' : 'Mute'}
                className="shrink-0 hidden sm:inline-flex hover:bg-[#c9a227]/10 hover:text-[#c9a227] text-stone-200"
              >
                {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={fullscreen}
                aria-label="Fullscreen"
                className="shrink-0 hidden sm:inline-flex hover:bg-[#c9a227]/10 hover:text-[#c9a227] text-stone-200"
              >
                <Maximize className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        </section>

        {/* ── Scenes + facts ───────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-12 grid gap-6 lg:grid-cols-5">
          {/* scene index */}
          <motion.aside
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2 rounded-xl border border-[#c9a227]/15 bg-stone-900/40 p-5"
            aria-label="Scene index"
          >
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4" style={{ color: GOLD }} aria-hidden="true" />
              <h2 className="text-xs tracking-[0.25em] uppercase text-stone-400">Scene index</h2>
            </div>
            <ol className="space-y-2 max-h-96 overflow-y-auto pr-1 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#c9a227]/25">
              {film.scenes.map((s, i) => {
                const active = i === activeScene
                return (
                  <li key={s.id}>
                    <button
                      onClick={() => seek(s.start + 0.02)}
                      aria-current={active ? 'true' : undefined}
                      className={`w-full text-left rounded-lg border px-3.5 py-3 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a227]/60 ${
                        active
                          ? 'border-[#c9a227]/50 bg-[#c9a227]/10'
                          : 'border-transparent hover:border-[#c9a227]/25 hover:bg-[#c9a227]/5'
                      }`}
                    >
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="flex items-baseline gap-2.5 min-w-0">
                          <span
                            className="text-[10px] tabular-nums tracking-widest"
                            style={{ color: GOLD }}
                          >
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          <span
                            className={`text-sm font-medium truncate ${
                              active ? 'text-stone-100' : 'text-stone-300'
                            }`}
                          >
                            {s.title}
                          </span>
                        </span>
                        <span className="text-[10px] tabular-nums text-stone-500 shrink-0">
                          {s.start.toFixed(1).replace('.', ',')}s
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-stone-500 leading-snug line-clamp-2">
                        {s.line}
                      </p>
                    </button>
                  </li>
                )
              })}
            </ol>
          </motion.aside>

          {/* facts */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-3 flex flex-col gap-6"
          >
            <div className="rounded-xl border border-[#c9a227]/15 bg-stone-900/40 p-5">
              <div className="flex items-center gap-2 mb-3">
                <PenLine className="w-4 h-4" style={{ color: GOLD }} aria-hidden="true" />
                <h2 className="text-xs tracking-[0.25em] uppercase text-stone-400">
                  How it&apos;s made
                </h2>
              </div>
              <p className="text-sm text-stone-400 leading-relaxed">{film.description}</p>
              <ul className="mt-4 space-y-2">
                {film.credits.map((c) => (
                  <li key={c} className="flex items-start gap-2.5 text-xs text-stone-500 leading-relaxed">
                    <span
                      className="mt-1.5 w-1 h-1 rounded-full shrink-0"
                      style={{ backgroundColor: GOLD }}
                      aria-hidden="true"
                    />
                    {c}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-[#c9a227]/15 bg-stone-900/40 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Music className="w-4 h-4" style={{ color: GOLD }} aria-hidden="true" />
                <h2 className="text-xs tracking-[0.25em] uppercase text-stone-400">The sound</h2>
              </div>
              <dl className="space-y-3 text-xs leading-relaxed">
                <div className="grid grid-cols-[80px_1fr] gap-2">
                  <dt className="text-stone-500 uppercase tracking-wider text-[10px] pt-0.5">Voice</dt>
                  <dd className="text-stone-400">{film.audio.vo}</dd>
                </div>
                <div className="grid grid-cols-[80px_1fr] gap-2">
                  <dt className="text-stone-500 uppercase tracking-wider text-[10px] pt-0.5">Score</dt>
                  <dd className="text-stone-400">{film.audio.music}</dd>
                </div>
                <div className="grid grid-cols-[80px_1fr] gap-2">
                  <dt className="text-stone-500 uppercase tracking-wider text-[10px] pt-0.5">SFX</dt>
                  <dd className="text-stone-400">{film.audio.sfx}</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-xl border border-[#c9a227]/15 bg-gradient-to-br from-[#c9a227]/10 to-transparent p-5">
              <div className="flex items-center gap-2 mb-3">
                <Archive className="w-4 h-4" style={{ color: GOLD }} aria-hidden="true" />
                <h2 className="text-xs tracking-[0.25em] uppercase text-stone-400">
                  Take the whole studio home
                </h2>
              </div>
              <p className="text-sm text-stone-400 leading-relaxed">
                The full project archive: the published film, the studio engine &amp; render
                source, project docs (AGENTS.md, beat tables, decision logs), voiceover &amp;
                timing assets, and the Next.js showcase — everything needed to make film #002.
              </p>
              <Button
                asChild
                className="mt-4 w-full sm:w-auto font-medium text-[#0b0a08] hover:opacity-90"
                style={{ backgroundColor: GOLD }}
              >
                <a href={film.zipUrl} download aria-label="Download the project archive (zip)">
                  <Download className="w-4 h-4 mr-2" />
                  Download project .zip
                </a>
              </Button>
            </div>
          </motion.div>
        </section>
      </main>

      {/* ── Footer (sticky bottom, safe-area aware) ─────────────── */}
      <footer className="mt-auto border-t border-[#c9a227]/15 bg-[#0d0c0a]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-stone-600">
          <p>
            Opuscar Studio — every frame drawn by code. Scored to{' '}
            <span className="text-stone-500">
              Erik Satie, Gymnopédie No. 1
            </span>{' '}
            <span className="text-stone-700">(CC0 · Teknopazzo)</span>.
          </p>
          <p className="tracking-wider uppercase">Reel 001 · {film.frames} frames · verified</p>
        </div>
      </footer>
    </div>
  )
}
