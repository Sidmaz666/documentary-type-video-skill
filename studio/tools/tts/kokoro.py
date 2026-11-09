#!/usr/bin/env python3
# kokoro.py — local Kokoro-82M VO synthesis for Opuscar Studio.
# Runs the hexgrad/kokoro ONNX export in models/kokoro/ (gitignored weights,
# single unified models/ directory). No network, no API keys, no AI voices
# from the cloud — the model is a real open-weights TTS (Apache-2.0).
#
# Usage:
#   python studio/tools/tts/kokoro.py --text "Ten thousand years ago," --out vo.wav
#   python studio/tools/tts/kokoro.py --text-file script.txt --voice am_michael --speed 1.0 --out vo.m4a
#
# Outputs 24 kHz mono PCM16 (.wav), or encodes via ffmpeg when --out ends in
# .m4a/.aac/.ogg/.mp3. Voice default: am_michael (calm professional male).
import argparse, os, subprocess, sys, wave
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[3]
WAV_SR = 24000


def write_wav(path, samples_f32, sr=WAV_SR):
    import numpy as np
    pcm = np.clip(samples_f32, -1.0, 1.0)
    pcm = (pcm * 32767.0).astype(np.int16)
    with wave.open(str(path), 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes(pcm.tobytes())


def main():
    ap = argparse.ArgumentParser(description='Local Kokoro-82M TTS (VO) for Opuscar Studio films')
    ap.add_argument('--text', help='text to speak (inline)')
    ap.add_argument('--text-file', help='UTF-8 file with the script')
    ap.add_argument('--out', required=True, help='output file (.wav, or .m4a/.aac/.ogg/.mp3 via ffmpeg)')
    ap.add_argument('--voice', default='am_michael', help='voice id (default: am_michael, calm professional male)')
    ap.add_argument('--speed', type=float, default=1.0)
    ap.add_argument('--lang', default='en-us', help='language tag for the phonemizer (default en-us)')
    ap.add_argument('--model', default=str(REPO_ROOT / 'models' / 'kokoro' / 'kokoro-v1.0.onnx'))
    ap.add_argument('--voices', default=str(REPO_ROOT / 'models' / 'kokoro' / 'voices-v1.0.bin'))
    args = ap.parse_args()

    text = args.text
    if args.text_file:
        text = Path(args.text_file).read_text(encoding='utf-8').strip()
    if not text:
        sys.exit('error: provide --text or --text-file')
    for p, what in ((args.model, 'model'), (args.voices, 'voices')):
        if not Path(p).exists():
            sys.exit(f'error: {what} not found at {p} — see models/README.md')

    from kokoro_onnx import Kokoro
    kokoro = Kokoro(args.model, args.voices)
    available = kokoro.get_voices()
    if args.voice not in available:
        sys.exit(f'error: unknown voice "{args.voice}". Available: {", ".join(available)}')

    samples, sr = kokoro.create(text, voice=args.voice, speed=args.speed, lang=args.lang)
    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)

    ext = out.suffix.lower()
    if ext in ('.wav', '.wave'):
        write_wav(out, samples, sr)
    else:
        tmp = out.with_suffix('.tmp.wav')
        write_wav(tmp, samples, sr)
        ff = subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', str(tmp), '-ar', '48000', '-ac', '1', str(out)])
        tmp.unlink(missing_ok=True)
        if ff.returncode != 0:
            sys.exit(f'error: ffmpeg encode failed for {out}')

    dur = len(samples) / sr
    print(f'wrote {out} — voice={args.voice} speed={args.speed} dur={dur:.3f}s sr={sr}Hz')


if __name__ == '__main__':
    main()
