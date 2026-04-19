<div align="center">

# 🎬 LocalShorts

### Fully local, automated AI short-form video pipeline for macOS Apple Silicon
### YouTube Shorts · TikTok · Instagram Reels — zero cloud, zero cost

[![macOS](https://img.shields.io/badge/macOS-14%2B%20Sonoma-black?logo=apple)](https://www.apple.com/macos/)
[![Apple Silicon](https://img.shields.io/badge/Apple%20Silicon-M1%20M2%20M3%20M4-blue)](https://www.apple.com/mac/)
[![Python](https://img.shields.io/badge/Python-3.11%2B-3776ab?logo=python&logoColor=white)](https://python.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-green)](LICENSE)
[![Free & Open Source](https://img.shields.io/badge/Free%20%26%20Open%20Source-100%25-brightgreen)](https://github.com)

</div>

---

## What is LocalShorts?

LocalShorts is a **6-stage automated pipeline** that turns a single text concept into a complete, publish-ready short-form video — entirely on your Mac, using only free and open-source tools.

No Runway. No ElevenLabs. No OpenAI. No monthly subscriptions. Everything runs on your hardware.

```
"The hidden ocean inside Saturn's moon"
          ↓  45 seconds of typing
  ┌─────────────────────────────┐
  │  python pipeline.py          │
  │  --concept "your idea here"  │
  └─────────────────────────────┘
          ↓  ~15 minutes later
  📱 short_1234567.mp4
     ├── AI-generated script (Llama 3.2)
     ├── Cinematic images (FLUX.1-schnell)
     ├── Natural voiceover (Kokoro TTS)
     ├── Animated Ken Burns motion (FFmpeg)
     ├── Auto-subtitles, styled (Whisper)
     └── Background music mix
```

---

## Table of Contents

- [Hardware Requirements](#-hardware-requirements)
- [Pipeline Architecture](#-pipeline-architecture)
- [What Gets Generated](#-what-gets-generated)
- [Full Setup Guide](#-full-setup-guide)
  - [Step 1: System Dependencies](#step-1-system-dependencies)
  - [Step 2: Ollama + LLM Model](#step-2-ollama--llm-model)
  - [Step 3: Python Environment](#step-3-python-environment)
  - [Step 4: FLUX.1 Image Model](#step-4-flux1-image-model)
  - [Step 5: Kokoro TTS Models](#step-5-kokoro-tts-models)
  - [Step 6: Whisper Model](#step-6-whisper-model)
  - [Step 7: Optional — Background Music](#step-7-optional--background-music)
- [Usage](#-usage)
- [Configuration Reference](#-configuration-reference)
- [Output Structure](#-output-structure)
- [Estimated Runtimes](#-estimated-runtimes)
- [Example Concepts & Prompts](#-example-concepts--prompts)
- [Virality Tips](#-virality-tips)
- [Troubleshooting](#-troubleshooting)
- [Model Alternatives](#-model-alternatives)
- [Contributing](#-contributing)

---

## 💻 Hardware Requirements

| Requirement | Minimum | Recommended |
|---|---|---|
| **Chip** | Apple M1 | Apple M3 / M4 |
| **RAM** | 16 GB unified memory | 16 GB+ |
| **Storage** | 40 GB free | 60 GB free |
| **macOS** | 14.0 Sonoma | 15.0 Sequoia |
| **Python** | 3.11 | 3.12 |

### Disk space breakdown

| Component | Size |
|---|---|
| FLUX.1-schnell (4-bit quantized) | ~8.5 GB |
| FLUX.1-dev (4-bit quantized) | ~11 GB |
| Llama 3.2 (via Ollama) | ~2 GB |
| Whisper base model | ~145 MB |
| Kokoro TTS models | ~80 MB |
| Python dependencies | ~3 GB |
| **Total (schnell setup)** | **~14 GB** |
| **Total (dev setup)** | **~17 GB** |

> **Note:** FLUX.1-dev requires a HuggingFace account and model access approval.  
> FLUX.1-schnell is fully open and downloads without any login.

---

## 🏗️ Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        INPUT: concept (text)                         │
└─────────────────────────────┬───────────────────────────────────────┘
                              │
              ┌───────────────▼────────────────┐
              │  STAGE 1: Script Generation     │
              │  Model:  Llama 3.2 via Ollama   │
              │  Output: script.json            │
              │  Time:   ~30–60 seconds         │
              └───────────────┬────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     │
┌───────────────┐   ┌──────────────────┐           │
│  STAGE 2      │   │  STAGE 3         │           │
│  Images       │   │  Voiceover       │           │
│  FLUX.1 (MLX) │   │  Kokoro TTS      │           │
│  6–7 PNGs     │   │  voiceover.wav   │           │
│  ~60s/image   │   │  ~5–10 seconds   │           │
└───────┬───────┘   └────────┬─────────┘           │
        │                    │                      │
        ▼                    │           ┌──────────▼──────────┐
┌───────────────┐            │           │  STAGE 5            │
│  STAGE 4      │            │           │  Subtitles          │
│  Animation    │            │           │  faster-whisper     │
│  Ken Burns    │            │           │  → styled .ass      │
│  FFmpeg clips │            │           │  ~15–20 seconds     │
└───────┬───────┘            │           └──────────┬──────────┘
        │                    │                      │
        └────────────────────┼──────────────────────┘
                             ▼
              ┌──────────────────────────────┐
              │  STAGE 6: Final Assembly     │
              │  FFmpeg                      │
              │  clips + voice + music +     │
              │  subtitles → 9:16 MP4        │
              │  ~30 seconds                 │
              └──────────────┬───────────────┘
                             │
              ┌──────────────▼───────────────┐
              │  OUTPUT: short_XXXXXX.mp4    │
              │  1080×1920 · H.264 · AAC     │
              │  45–58 seconds               │
              └──────────────────────────────┘
```

### Technology Stack

| Stage | Tool | Why |
|---|---|---|
| Script | Ollama + Llama 3.2 | Best local LLM, fast on M-series |
| Images | FLUX.1 via `mflux` | MLX-native, far better than SD on Apple Silicon |
| TTS | Kokoro ONNX | Highest quality local TTS, tiny footprint |
| Animation | FFmpeg (zoompan) | No dependencies, battle-tested, fast |
| Subtitles | faster-whisper | CTranslate2 int8, runs on CPU efficiently |
| Assembly | FFmpeg | Industry standard, handles everything |

---

## 🎬 What Gets Generated

For each concept, the pipeline produces:

```
output/1234567890/
├── scripts/
│   └── script.json          # Full script with hooks, scene prompts, narration
├── images/
│   ├── scene_01.png         # 768×1360 FLUX-generated image
│   ├── scene_02.png
│   └── …
├── audio/
│   ├── voiceover.wav        # Raw Kokoro TTS output
│   └── voiceover_processed.wav  # EQ'd + compressed + normalized
├── clips/
│   ├── clip_01.mp4          # Animated 1080×1920 clip (Ken Burns)
│   └── …
├── subtitles/
│   ├── subtitles.srt        # Standard SRT (for uploading separately)
│   └── subtitles.ass        # Styled ASS (burned into video)
└── final/
    └── short_1234567890.mp4 # ✅ Ready to upload
```

---

## 🛠️ Full Setup Guide

Follow every step in order. The setup takes about 20–30 minutes (mostly waiting for downloads).

---

### Step 1: System Dependencies

Open **Terminal** and run:

```bash
# 1a. Install Homebrew (if not already installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# After installing, follow the instructions it prints to add brew to your PATH.
# Then close and reopen Terminal, or run:
eval "$(/opt/homebrew/bin/brew shellenv)"

# 1b. Install FFmpeg — the video processing backbone
brew install ffmpeg

# Verify FFmpeg works:
ffmpeg -version
# Should print: ffmpeg version 7.x.x …

# 1c. Install Git (if not already installed)
brew install git

# 1d. Clone this repository
git clone https://github.com/yourusername/localshorts.git
cd localshorts
```

---

### Step 2: Ollama + LLM Model

Ollama runs large language models locally on your Mac.

```bash
# 2a. Install Ollama
brew install ollama

# 2b. Start the Ollama server (keep this running in the background)
ollama serve
# You should see: Listening on 127.0.0.1:11434

# Open a NEW Terminal tab and run:

# 2c. Download Llama 3.2 (the recommended model, ~2GB)
ollama pull llama3.2

# Optional: faster but slightly lower quality (700MB)
# ollama pull llama3.2:1b

# Verify it works:
ollama run llama3.2 "Say hello in one sentence"
# Should print a response, then exit with Ctrl+D
```

> **Tip:** Add `ollama serve` to your login items so it starts automatically.  
> System Preferences → General → Login Items → add `/usr/local/bin/ollama`

---

### Step 3: Python Environment

```bash
# 3a. Check Python version (need 3.11+)
python3 --version
# If below 3.11: brew install python@3.12

# 3b. Create a virtual environment (keeps dependencies isolated)
python3 -m venv .venv

# 3c. Activate it (run this every time you open a new Terminal session)
source .venv/bin/activate
# Your prompt should now show: (.venv) ...

# 3d. Upgrade pip
pip install --upgrade pip

# 3e. Install all dependencies
pip install -r requirements.txt

# This installs: mflux, kokoro-onnx, faster-whisper, ollama, pyyaml, soundfile, numpy
# Takes 5–10 minutes depending on internet speed
```

---

### Step 4: FLUX.1 Image Model

`mflux` downloads model weights automatically on first use, but they are large.  
It's better to pre-download them so you know exactly what's happening.

#### Option A: FLUX.1-schnell (Recommended — fully open, no login needed)

```bash
# Pre-download FLUX.1-schnell at 4-bit quantization (~8.5GB download)
# This only needs to run once — weights are cached in ~/.cache/huggingface/

python3 -c "
from mflux import Flux1, Config
print('Downloading FLUX.1-schnell (4-bit)... This may take 20-40 minutes.')
flux = Flux1.from_alias('flux-schnell', quantize=4)
print('Done! Model cached at ~/.cache/huggingface/')
del flux
"
```

#### Option B: FLUX.1-dev (Higher quality — requires HuggingFace account)

FLUX.1-dev is gated — you must request access before downloading.

**Step 4b-1:** Create a free account at [huggingface.co](https://huggingface.co)

**Step 4b-2:** Visit [black-forest-labs/FLUX.1-dev](https://huggingface.co/black-forest-labs/FLUX.1-dev) and click **"Access repository"** — approval is instant.

**Step 4b-3:** Create an access token:
- Go to [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
- Click **"New token"** → name it `localshorts` → select **Read** scope → Create
- Copy the token (starts with `hf_...`)

**Step 4b-4:** Log in and download:

```bash
# Install HuggingFace CLI
pip install huggingface_hub

# Log in with your token
huggingface-cli login
# Paste your hf_... token when prompted

# Download FLUX.1-dev at 4-bit quantization (~11GB download)
python3 -c "
from mflux import Flux1, Config
print('Downloading FLUX.1-dev (4-bit)... This may take 30-60 minutes.')
flux = Flux1.from_alias('flux-dev', quantize=4)
print('Done!')
del flux
"
```

**Then update `config.yaml`:**
```yaml
flux_model: "dev"
flux_steps: 28       # dev needs more steps than schnell
flux_guidance: 3.5
```

#### Test image generation

```bash
# Quick test — generates a single image (should take ~60 seconds for schnell)
mflux-generate \
  --model flux-schnell \
  --prompt "a cinematic landscape, dramatic lighting, photorealistic" \
  --steps 4 \
  --width 768 \
  --height 1360 \
  --seed 42 \
  --output test_output.png \
  --quantize 4

# Open the result:
open test_output.png
```

---

### Step 5: Kokoro TTS Models

Kokoro uses two small files (~80MB total) that you download manually.

**Step 5a:** Go to the Kokoro releases page:  
[github.com/thewh1teagle/kokoro-rs/releases/latest](https://github.com/thewh1teagle/kokoro-rs/releases/latest)

**Step 5b:** Download these two files:
- `kokoro-v0_19.onnx`
- `voices.bin`

**Step 5c:** Place them in the `assets/kokoro/` folder:

```bash
# Create the directory
mkdir -p assets/kokoro

# Move downloaded files (adjust path if your Downloads folder differs)
mv ~/Downloads/kokoro-v0_19.onnx assets/kokoro/
mv ~/Downloads/voices.bin assets/kokoro/

# Verify:
ls -lh assets/kokoro/
# Should show both files, ~50MB and ~30MB
```

**Step 5d:** Test Kokoro TTS:

```bash
python3 -c "
from kokoro_onnx import Kokoro
import soundfile as sf

kokoro = Kokoro('assets/kokoro/kokoro-v0_19.onnx', 'assets/kokoro/voices.bin')
samples, rate = kokoro.create(
    'Welcome to LocalShorts. This is a test of the Kokoro text to speech system.',
    voice='af_bella',
    speed=1.0,
    lang='en-us',
)
sf.write('/tmp/kokoro_test.wav', samples, rate)
print('Success! Playing audio...')
import subprocess
subprocess.run(['afplay', '/tmp/kokoro_test.wav'])
"
```

You should hear a natural-sounding female voice. If it sounds robotic or errors, check that both model files are in `assets/kokoro/`.

**Available voices:**

| Voice ID | Description | Best For |
|---|---|---|
| `af_bella` | Warm American female | General content, science |
| `af_sarah` | Energetic American female | Lifestyle, trends |
| `am_adam` | Deep American male | History, mystery |
| `am_michael` | Professional American male | Business, tech |
| `bf_emma` | British female | Documentary style |
| `bm_george` | British male | Nature, narration |

---

### Step 6: Whisper Model

`faster-whisper` downloads the Whisper model automatically on first use.  
Pre-download it to avoid delays during pipeline runs:

```bash
python3 -c "
from faster_whisper import WhisperModel
print('Downloading Whisper base model (~145MB)...')
model = WhisperModel('base', device='cpu', compute_type='int8')
print('Done! Cached at ~/.cache/whisper/')

# Quick transcription test
segments, info = model.transcribe('/tmp/kokoro_test.wav', word_timestamps=True)
print('Transcription test:')
for seg in segments:
    print(' ', seg.text)
"
```

**Model options** (set `whisper_model` in `config.yaml`):

| Model | Size | Speed | Accuracy |
|---|---|---|---|
| `tiny` | 75 MB | ⚡ Fastest | Good for clear speech |
| `base` | 145 MB | ✅ Balanced | **Recommended** |
| `small` | 483 MB | Slower | Best accuracy |

---

### Step 7: Optional — Background Music

The pipeline can mix background music under the voiceover at low volume.  
Drop any `.mp3` or `.wav` files into `assets/music/`. The pipeline picks one randomly per video.

**Recommended free sources (no attribution required):**

- [pixabay.com/music](https://pixabay.com/music/) — search "cinematic ambient", "space", "mystery"
- [freemusicarchive.org](https://freemusicarchive.org) — filter by CC0 license
- [incompetech.com](https://incompetech.com) — Kevin MacLeod, CC BY license

**Or generate ambient music locally with MusicGen (optional, ~2GB model):**

```bash
pip install audiocraft

python3 -c "
from audiocraft.models import MusicGen
import torchaudio, torch

model = MusicGen.get_pretrained('facebook/musicgen-small')
model.set_generation_params(duration=60)

wav = model.generate([
    'cinematic ambient electronic, space documentary, tension building, no melody'
])
torchaudio.save('assets/music/ambient_space.wav', wav[0].cpu(), 32000)
print('Music saved to assets/music/ambient_space.wav')
"
```

---

## 🚀 Usage

Make sure Ollama is running before each session:

```bash
ollama serve &   # Run in background
source .venv/bin/activate
```

### Generate a single video

```bash
python pipeline.py --concept "Your concept here"

# With style:
python pipeline.py --concept "The terrifying scale of the universe" --style cinematic
python pipeline.py --concept "5 psychological tricks used against you daily" --style documentary
python pipeline.py --concept "The Roman invention we still can't replicate" --style dramatic
python pipeline.py --concept "Morning routines of the most successful people" --style lofi
```

**Styles:**

| Flag | Aesthetic | Best Topics |
|---|---|---|
| `cinematic` | IMAX, dramatic lighting, color graded | Space, history, mystery |
| `documentary` | Natural light, photorealistic, RAW | Nature, science, psychology |
| `dramatic` | High contrast, noir, moody | Dark history, conspiracies |
| `lofi` | Warm, grainy, muted pastel | Wellness, productivity, mindset |

### Batch generation

Create a text file with one concept per line:

```bash
# Edit concepts.txt (included in repo with 12 examples)
nano concepts.txt

# Run batch:
python pipeline.py --batch concepts.txt --style cinematic

# Batch with mixed styles — use a CSV instead:
python pipeline.py --batch concepts.csv  # see concepts_example.csv
```

`concepts.txt` format:
```
# Lines starting with # are skipped

The hidden ocean inside Saturn's moon Enceladus
Why your brain fabricates memories and you'd never know
Ants have been running the world's most sophisticated civilization for 100 million years
```

### Preview mode (fast test, skips image generation)

```bash
# Generate everything except images — uses colored placeholders instead
# Completes in ~60 seconds, good for testing timing and audio
python pipeline.py --concept "Test concept" --preview
```

---

## ⚙️ Configuration Reference

Edit `config.yaml` to tune every stage of the pipeline:

```yaml
# ── Stage 1: Script Generation ───────────────────────────────────────────────
ollama_model: "llama3.2"      # Options: llama3.2, llama3.2:1b, mistral, phi3
                               # llama3.2:1b is 3× faster but lower quality

# ── Stage 2: Image Generation (FLUX via mflux) ───────────────────────────────
flux_model: "schnell"          # "schnell" (fast, 4 steps) or "dev" (slow, 28 steps)
flux_quantize: 4               # 4 = ~8GB memory, 8 = ~14GB memory (don't use 8 on 16GB)
flux_steps: 4                  # schnell: 4 steps. dev: 25–35 steps
flux_guidance: 3.5             # dev only. Ignored for schnell. Range: 2.0–5.0
flux_seed: 42                  # Fixed seed = consistent style across scenes
                               # Change this per batch for variety

# ── Stage 3: Voice (Kokoro TTS) ──────────────────────────────────────────────
tts_voice: "af_bella"          # See voice table in setup guide
tts_speed: 1.05                # 0.8 = slower/relaxed, 1.1 = faster/energetic

# ── Stage 4: Animation ────────────────────────────────────────────────────────
fps: 30                        # 30 is standard. 24 for more "cinematic" feel
use_xfade: true                # Crossfade dissolves between clips
xfade_duration: 0.3            # Dissolve length in seconds (0.2–0.5)

# ── Stage 5: Subtitles ────────────────────────────────────────────────────────
whisper_model: "base"          # tiny / base / small
subtitle_words: 4              # Words per subtitle chunk. 3–4 optimal for mobile
subtitle_style: "tiktok"       # tiktok | clean | fire | minimal
subtitle_karaoke: true         # Word-by-word yellow highlight (boosts retention)

# ── Stage 6: Assembly ─────────────────────────────────────────────────────────
music_volume: 0.08             # 0.0 = no music, 0.05 = very subtle, 0.12 = noticeable
cleanup_intermediates: true    # Delete clips/audio after final assembly
```

---

## 📂 Output Structure

```
output/
└── 1712345678/                  ← Job ID (Unix timestamp)
    ├── scripts/
    │   └── script.json          ← Hook, scenes, narration, image prompts, tags
    ├── images/
    │   ├── scene_01.png         ← 768×1360 FLUX image
    │   ├── scene_02.png
    │   ├── scene_03.png
    │   ├── scene_04.png
    │   ├── scene_05.png
    │   └── scene_06.png
    ├── audio/
    │   ├── voiceover.wav        ← Raw Kokoro output
    │   └── voiceover_processed.wav  ← EQ + compression + normalization applied
    ├── clips/
    │   ├── clip_01.mp4          ← 1080×1920 animated clip with Ken Burns
    │   ├── clip_02.mp4
    │   └── …
    ├── subtitles/
    │   ├── subtitles.srt        ← Standard SRT (upload separately if needed)
    │   └── subtitles.ass        ← Styled ASS with karaoke highlights (burned in)
    └── final/
        └── short_1712345678.mp4 ← ✅ 1080×1920 · H.264 · AAC · ready to upload
```

The `script.json` also includes:
- SEO-optimized video title
- 5 hashtags/tags
- Hook (first line of video)
- Per-scene narration and image prompts

---

## ⏱️ Estimated Runtimes

### Per-video (M4 MacBook Air, 16GB RAM)

| Stage | FLUX schnell | FLUX dev |
|---|---|---|
| S1 Script (Llama 3.2) | ~45s | ~45s |
| S2 Images (6 images) | ~6 min | ~25 min |
| S3 Voice (Kokoro) | ~8s | ~8s |
| S4 Animate (FFmpeg) | ~45s | ~45s |
| S5 Subtitles (Whisper) | ~20s | ~20s |
| S6 Assembly (FFmpeg) | ~25s | ~25s |
| **Total per video** | **~8 min** | **~27 min** |

### Batch performance

| Batch Size | FLUX schnell | FLUX dev |
|---|---|---|
| 5 videos | ~40 min | ~2.5 hours |
| 10 videos | ~80 min | ~5 hours |
| 20 videos | ~2.7 hours | ~9 hours (overnight) |

> **Tip:** Run batch jobs overnight. `python pipeline.py --batch concepts.txt` and come back to finished videos in the morning.

---

## 🎯 Example Concepts & Prompts

### Science & Space

```
Concept: "The hidden ocean inside Saturn's moon Enceladus that could harbor alien life"
Style: cinematic

→ Hook: "NASA found an alien ocean..."

→ Scene image prompts (auto-generated):
  1. "Saturn looming massive in black space, tiny moon nearby with ice plumes erupting,
     cinematic, volumetric light, photorealistic, 8k"
  2. "Underwater bioluminescent alien ocean, glowing organisms in pitch black depths,
     ethereal blue light, cinematic"
  3. "NASA mission control, scientists watching data screens with intense focus,
     dramatic blue lighting, cinematic"
```

### Psychology

```
Concept: "5 psychological tricks corporations use against you every day"
Style: documentary

→ Hook: "You're being manipulated right now..."

→ Scene image prompts:
  1. "Corporate boardroom with shadowy executives, overhead view, dramatic lighting,
     documentary style, photorealistic"
  2. "Supermarket shelf with products arranged deliberately, human psychology,
     documentary photography, natural light"
  3. "Person scrolling phone with dopamine loop visualized as glowing neural connections,
     surreal documentary style"
```

### History & Mystery

```
Concept: "The ancient Roman concrete that's been getting stronger for 2,000 years"
Style: dramatic

→ Hook: "Modern engineers still can't copy this..."

→ Scene image prompts:
  1. "Ancient Roman aqueduct at sunset, dramatic orange sky, photorealistic,
     award-winning architecture photography"
  2. "Cross-section of Roman concrete showing crystalline structure growing inside,
     macro photography, dramatic lighting"
  3. "Modern materials scientist examining Roman sample in lab, blue analytical lighting,
     documentary style"
```

---

## 💡 Virality Tips

### The Hook Formula

The first 3 seconds determine 80% of your retention. Use one of these patterns:

```
"[SHOCKING CLAIM]..."
→ "NASA is hiding an ocean..."
→ "Your memories are completely fake..."

"[NUMBER] things [AUTHORITY] won't tell you..."
→ "5 things your bank doesn't want you to know..."

"[RELATABLE SETUP] then [TWIST]..."
→ "You do this every morning. It's slowly killing you..."

"Why [THING EVERYONE ASSUMES] is completely wrong..."
→ "Why everything you know about sleep is wrong..."
```

### Image Prompt Techniques for FLUX

```bash
# Consistency across scenes: use the same "style anchor" phrase in every prompt
"... cinematic teal and orange color grade, volumetric light"

# For FLUX.1-schnell: be very descriptive, no artistic instruction needed
# Bad:  "dramatic space scene"
# Good: "black void of space, Saturn filling 40% of frame, ice geyser erupting
#        from Enceladus, backlighting from distant sun, photorealistic"

# Negative concepts don't work well in FLUX — describe what you WANT
# Bad:  "no text, no watermark"
# Good: just don't mention text; FLUX rarely adds it anyway
```

### Subtitle Rules

- **UPPERCASE** — 23% better readability on mobile (backed by platform data)
- **4 words max** per chunk — matches natural reading speed at scroll speed
- **Position**: bottom 20% of frame — thumbs block center on most phones
- **Karaoke highlight** — set `subtitle_karaoke: true` — word-by-word yellow = +18% watch time

### Pacing

- Keep each scene **4–6 seconds** (never exceed 7s on one image)
- Total video: **45–58 seconds** (YouTube Shorts rewards <60s with full distribution)
- Energy arc: **curiosity → disbelief → awe → urgency → CTA**
- Last 5 seconds = most replayed — make your CTA land here

---

## 🐛 Troubleshooting

### "mflux-generate: command not found"
```bash
# Make sure your venv is activated:
source .venv/bin/activate

# Reinstall mflux:
pip install mflux --upgrade

# Check if the CLI is installed:
which mflux-generate
# Should print: /path/to/.venv/bin/mflux-generate
```

### "Out of memory" during image generation
```bash
# In config.yaml, switch to schnell if using dev:
flux_model: "schnell"
flux_quantize: 4

# Close other apps — FLUX.1-schnell needs ~8GB unified memory free
# Check memory pressure: open Activity Monitor → Memory tab
```

### "Ollama connection refused"
```bash
# Make sure Ollama server is running:
ollama serve

# Check it's responding:
curl http://localhost:11434/api/tags
# Should list your downloaded models

# If still failing, restart:
pkill ollama
ollama serve
```

### "Kokoro model not found"
```bash
# Verify files are in the right place:
ls -lh assets/kokoro/
# Must show: kokoro-v0_19.onnx and voices.bin

# If missing, re-download from:
# https://github.com/thewh1teagle/kokoro-rs/releases/latest
```

### "faster-whisper" fails on Apple Silicon
```bash
# Install with correct backend:
pip uninstall faster-whisper
pip install faster-whisper

# If still failing, use the tiny model (most compatible):
# In config.yaml: whisper_model: "tiny"
```

### FFmpeg zoompan is very slow
```bash
# Disable Ken Burns effect in config.yaml:
use_xfade: false

# Or reduce FPS:
fps: 24
```

### JSON parsing error in script generation
```bash
# Llama sometimes outputs extra text before/after JSON
# Try a different model:
ollama pull mistral
# In config.yaml: ollama_model: "mistral"

# Or reduce temperature (more deterministic output):
# Edit stages/s1_script.py: change temperature from 0.85 to 0.6
```

---

## 🔄 Model Alternatives

### LLM (Script Generation)

| Model | Command | Speed | Quality |
|---|---|---|---|
| **Llama 3.2** (recommended) | `ollama pull llama3.2` | ✅ Fast | ★★★★ |
| Llama 3.2 1B (tiny) | `ollama pull llama3.2:1b` | ⚡ Fastest | ★★★ |
| Mistral 7B | `ollama pull mistral` | Medium | ★★★★ |
| Phi-3 Mini | `ollama pull phi3` | Fast | ★★★ |
| Llama 3.1 70B | `ollama pull llama3.1:70b` | Very slow | ★★★★★ |

### Image Generation

| Model | Quality | Speed (M4) | Memory |
|---|---|---|---|
| **FLUX.1-schnell 4-bit** (recommended) | ★★★★ | ~60s/img | ~8GB |
| FLUX.1-dev 4-bit | ★★★★★ | ~3–4 min/img | ~10GB |
| SD 1.5 (via diffusers) | ★★★ | ~45s/img | ~3.5GB |
| Dreamshaper 8 (via diffusers) | ★★★★ | ~50s/img | ~4GB |
| SDXL Turbo (via diffusers) | ★★★★ | ~90s/img | ~7GB |

To use SD-based models instead of FLUX, edit `stages/s2_images.py` to use
the `diffusers` pipeline (original code is in `GUIDE.md`).

### TTS

| Tool | Quality | Speed | Install |
|---|---|---|---|
| **Kokoro ONNX** (recommended) | ★★★★★ | ⚡ ~8s | `pip install kokoro-onnx` |
| Piper TTS | ★★★ | ⚡ ~5s | `pip install piper-tts` |
| Coqui TTS | ★★★★ | Medium | `pip install TTS` |

---

## 🤝 Contributing

Contributions welcome! Areas where help is most needed:

- **AnimateDiff-Lightning integration** — actual video diffusion for scenes
- **RVC voice conversion** — transform Kokoro output to custom voice styles
- **Beat-sync cuts** — sync transitions to background music BPM via librosa
- **SQLite job database** — persistent job history with search
- **FastAPI web server** — expose pipeline as REST API for the dashboard UI
- **Quality scoring** — CLIP-based image prompt adherence checker

```bash
git clone https://github.com/yourusername/localshorts.git
cd localshorts
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
# Make your changes, test, submit a PR
```

---

## 📄 License

MIT License — do whatever you want with it. If you build something cool, share it.

---

<div align="center">

**Built for creators who don't want to pay forever for what a laptop can do.**

Made with ☕ and too many terminal tabs.

</div>
