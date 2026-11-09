# models/ — all model weights, one directory

Every machine-learning weight in this repo lives here, gitignored, single place to cache/re-download. Do not commit (`.gitignore` excludes `/models/`).

```
models/
├── whisper/          ASR/STT word-level timestamps (studio/tools/asr/transcribe.mjs)
│   └── Xenova/whisper-tiny.en/…         @huggingface/transformers cache (primary)
└── kokoro/           Kokoro-82M TTS VO synthesis (kokoro-v1.0.onnx + voices-v1.0.bin)
```

- **Whisper** (`Xenova/whisper-tiny.en`, ~116 MB): auto-downloads on first `transcribe.mjs` run. The legacy `ggml-tiny.en.bin` (whisper.cpp) was removed — the JS/onnxruntime stack is the only ASR path. Force a fresh copy by deleting `models/whisper/Xenova/`.
- **Kokoro** (`kokoro-v1.0.onnx` + `voices-v1.0.bin`, ~330 MB): local VO synthesis — the default for new films without supplied narration (calm professional male voice, per `AGENTS.md` §3). Tool: `python studio/tools/tts/kokoro.py --text "…" --out assets/vo.m4a` (offline, Apache-2.0, requires `pip install kokoro-onnx`; verified 2026-11-09). User-supplied narration remains canonical when provided.
- Both are excluded from any published zip/hand-off (LAW 7) and from the site build. Re-download as documented in `studio/ASSETS-AND-CLIPS.md` / `AGENTS.md` §3.
