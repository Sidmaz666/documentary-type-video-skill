#!/usr/bin/env python3
"""Word-level ASR/STT timestamps for Opuscar VO (verification/fallback).

Prefers faster-whisper (CTranslate2, fast on CPU) and falls back to
openai-whisper. Default is the *tiny* model for speed; use --model for quality.

Examples:
  python studio/tools/asr/transcribe_whisper.py assets/vo.m4a --out assets/vo-timings.json
  python studio/tools/asr/transcribe_whisper.py assets/vo.m4a --fast --model tiny --language en
  python studio/tools/asr/transcribe_whisper.py assets/vo.m4a --backend openai --model tiny

Output JSON:
  { "backend","model","audio","duration","language","text",
    "segments":[{"start","end","text","words":[{"start","end","word","prob"}]}] }
"""
from __future__ import annotations
import argparse, json, os, sys
from pathlib import Path


def _seg(s, e, t, words=None):
    return {"start": round(float(s), 3), "end": round(float(e), 3), "text": (t or "").strip(), "words": words or []}


def _word(s, e, w, p=None):
    o = {"start": round(float(s), 3), "end": round(float(e), 3), "word": w}
    if p is not None:
        try: o["prob"] = round(float(p), 4)
        except Exception: pass
    return o


def run_faster_whisper(audio, model, language, device, compute_type, beam_size):
    try:
        from faster_whisper import WhisperModel
    except Exception as e:
        raise RuntimeError(f"faster-whisper not installed: {e}")
    kwargs = {"device": device, "compute_type": compute_type}
    m = WhisperModel(model, **kwargs)
    segments, info = m.transcribe(
        audio,
        language=language or None,
        beam_size=beam_size,
        word_timestamps=True,
        vad_filter=True,
    )
    out_segments = []
    full = []
    for seg in segments:
        words = [_word(w.start, w.end, w.word, getattr(w, 'probability', None)) for w in (seg.words or [])]
        out_segments.append(_seg(seg.start, seg.end, seg.text, words))
        full.append((seg.text or "").strip())
    return {
        "backend": "faster-whisper",
        "model": model,
        "audio": os.path.abspath(audio),
        "duration": round(float(getattr(info, 'duration', 0) or 0), 3),
        "language": getattr(info, 'language', language),
        "text": " ".join(t for t in full if t),
        "segments": out_segments,
    }


def run_openai_whisper(audio, model, language):
    try:
        import whisper
    except Exception as e:
        raise RuntimeError(f"openai-whisper not installed: {e}")
    m = whisper.load_model(model)
    res = m.transcribe(audio, language=language or None, word_timestamps=True, verbose=False)
    out_segments = []
    for seg in res.get("segments", []):
        words = [_word(w["start"], w["end"], w.get("word", ""), w.get("probability")) for w in seg.get("words", [])]
        out_segments.append(_seg(seg["start"], seg["end"], seg.get("text", ""), words))
    return {
        "backend": "openai-whisper",
        "model": model,
        "audio": os.path.abspath(audio),
        "duration": round(float(res.get("duration") or 0), 3),
        "language": res.get("language", language),
        "text": (res.get("text") or "").strip(),
        "segments": out_segments,
    }


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("audio", help="audio file path (m4a/wav/mp3/...)")
    ap.add_argument("--out", help="output JSON path (default: <audio>.whisper.json)")
    ap.add_argument("--model", default="tiny", help="model size/name (default: tiny; also base, small, medium, large-v3, distil-*)")
    ap.add_argument("--fast", action="store_true", help="prefer faster-whisper + CPU int8 defaults")
    ap.add_argument("--backend", choices=["auto", "faster", "openai"], default="auto")
    ap.add_argument("--language", default=None, help="ISO language code (e.g. en); omit to auto-detect")
    ap.add_argument("--device", default="cpu")
    ap.add_argument("--compute-type", default="int8", help="faster-whisper compute type (int8,int8_float16,float16,float32)")
    ap.add_argument("--beam-size", type=int, default=1, help="beam size (1 is fastest)")
    args = ap.parse_args()

    audio = str(Path(args.audio))
    if not Path(audio).exists():
        print(f"audio not found: {audio}", file=sys.stderr); sys.exit(2)
    out = args.out or str(Path(audio).with_suffix("")) + ".whisper.json"
    backend = args.backend
    if backend == "auto":
        backend = "faster" if args.fast else "auto"

    errors = []
    result = None
    order = (["faster", "openai"] if backend in ("auto", "faster") else ["openai", "faster"])
    if backend == "openai": order = ["openai"]
    for b in order:
        try:
            if b == "faster":
                result = run_faster_whisper(audio, args.model, args.language, args.device, args.compute_type, args.beam_size)
            else:
                result = run_openai_whisper(audio, args.model, args.language)
            break
        except Exception as e:
            errors.append(f"{b}: {e}")
            if backend != "auto": raise
    if result is None:
        print("No Whisper backend available.\n" + "\n".join(errors) + "\n\nInstall one:\n  pip install faster-whisper   (recommended, fast tiny CPU)\n  pip install openai-whisper    (fallback)", file=sys.stderr)
        sys.exit(3)

    Path(out).parent.mkdir(parents=True, exist_ok=True)
    Path(out).write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    nwords = sum(len(s.get("words", [])) for s in result.get("segments", []))
    print(json.dumps({"ok": True, "out": out, "backend": result["backend"], "model": result["model"], "duration": result["duration"], "segments": len(result["segments"]), "words": nwords, "language": result.get("language")}, ensure_ascii=False))


if __name__ == "__main__":
    main()
