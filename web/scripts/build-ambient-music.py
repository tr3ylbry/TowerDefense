"""Original 15-second, 128-BPM synth loop; no samples or external audio.

Run: python3 scripts/build-ambient-music.py
Eight bars of arpeggios, pulsed bass and restrained electronic percussion.
Circular envelopes/echoes keep the loop seam continuous. Standard-library PCM.
"""
from array import array
from pathlib import Path
import math
import random
import sys
import wave

RATE = 22050
SECONDS = 15
BEAT = 60 / 128
samples = [0.0] * (RATE * SECONDS)
noise = random.Random(3352019)


def add(start, duration, voice):
    offset = round(start * RATE)
    for i in range(round(duration * RATE)):
        samples[(offset + i) % len(samples)] += voice(i / RATE)


def synth(midi, start, duration, level, pad=False, bass=False):
    frequency = 440 * 2 ** ((midi - 69) / 12)

    def voice(t):
        phase = 2 * math.pi * frequency * t
        if pad:
            envelope = math.sin(math.pi * t / duration) ** 2
            tone = math.sin(phase) + 0.15 * math.sin(2 * phase)
        else:
            envelope = (1 - math.exp(-350 * t)) * math.exp(-t * (16 if bass else 11))
            # Band-limited harmonic pluck, with audible bass harmonics on phone speakers.
            tone = sum(math.sin(phase * h) / h ** 1.7 for h in range(1, 6))
        return level * envelope * tone

    add(start, duration, voice)


# Two bars each: Cm(add9), Abmaj7, Ebmaj9, Bb(add9).
chords = ((60, 67, 74, 75), (56, 63, 67, 72), (63, 70, 74, 77), (58, 65, 72, 74))
pattern = (0, 1, 2, 1, 3, 1, 2, 1)
for section, chord in enumerate(chords):
    start = section * 8 * BEAT
    for midi in chord:
        synth(midi, start, 5, 0.018, pad=True)
    for step in range(16):
        synth(chord[pattern[step % len(pattern)]], start + step * BEAT / 2,
              0.38, 0.075 if step % 4 == 0 else 0.055)
    root = chord[0] - 24
    for beat in range(8):
        synth(root + (12 if beat == 7 else 0), start + (beat + 0.25) * BEAT,
              0.24, 0.13, bass=True)

# Dotted-eighth tonal echoes; drums stay crisp rather than reverberating.
dry = samples[:]
for delay, level in ((BEAT * 0.75, 0.20), (BEAT * 1.5, 0.09)):
    shift = round(delay * RATE)
    for i, value in enumerate(dry):
        samples[(i + shift) % len(samples)] += value * level

for beat in range(32):
    def kick(t):
        # A continuous pitch fall from 125Hz to 45Hz.
        phase = 2 * math.pi * (45 * t + 80 * (1 - math.exp(-35 * t)) / 35)
        return 0.16 * (1 - math.exp(-500 * t)) * math.exp(-24 * t) * math.sin(phase)
    add(beat * BEAT, 0.22, kick)
    if beat % 4 in (1, 3):
        def snare(t):
            envelope = (1 - math.exp(-450 * t)) * math.exp(-38 * t)
            return 0.034 * envelope * (noise.uniform(-1, 1) + 0.35 * math.sin(2 * math.pi * 185 * t))
        add(beat * BEAT, 0.14, snare)
    for offbeat in (0, 0.5):
        previous = [0.0]
        def hat(t):
            current = noise.uniform(-1, 1)
            high = current - previous[0]
            previous[0] = current
            return 0.012 * (1 - math.exp(-800 * t)) * math.exp(-85 * t) * high
        add((beat + offbeat) * BEAT, 0.07, hat)

peak = max(abs(value) for value in samples)
pcm = array("h", (round(value / peak * 0.65 * 32767) for value in samples))
if sys.byteorder != "little":
    pcm.byteswap()
output = Path(__file__).resolve().parents[1] / "public/audio/orbital-drift.wav"
output.parent.mkdir(parents=True, exist_ok=True)
with wave.open(str(output), "wb") as track:
    track.setnchannels(1)
    track.setsampwidth(2)
    track.setframerate(RATE)
    track.writeframes(pcm.tobytes())
print(f"{output.name}: {output.stat().st_size} bytes, {SECONDS}s, 128BPM, mono PCM")
