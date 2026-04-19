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
     ├── Cinematic images (SDXL Turbo / SD 1.5 LCM)
     ├── Natural voiceover (Kokoro TTS / Piper)
     ├── Animated FILM Interpolation (AnimateDiff / FFmpeg)
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
  - [Step 4: SDXL Turbo / Image Model](#step-4-sdxl-turbo--image-model)
  - [Step 5: Voice TTS Models](#step-5-voice-tts-models)
  - [Step 6: Whisper Model](#step-6-whisper-model)
  - [Step 7: Optional — Background Music](#step-7-optional--background-music)
- [Usage](#-usage)
- [Configuration Reference](#-configuration-reference)
- [Output Structure](#-output-structure)
- [Estimated Runtimes](#-estimated-runtimes)
- [Example Concepts & Prompts](#-example-concepts--prompts)
- [Virality Tips](#-virality-tips)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)

---

## 💻 Hardware Requirements

| Requirement | Minimum | Recommended |
|---|---|---|
| **Chip** | Apple M1 | Apple M3 / M4 |
| **RAM** | 16 GB unified memory | 16 GB+ |
| **Storage** | 20 GB free | 40 GB free |
| **macOS** | 14.0 Sonoma | 15.0 Sequoia |
| **Python** | 3.11 | 3.12 |

### Disk space breakdown

| Component | Size |
|---|---|
| SDXL Turbo / SD 1.5 LCM | ~6.5 GB |
| Llama 3.2 (via Ollama) | ~2 GB |
| Whisper base model | ~145 MB |
| Kokoro TTS / Piper | ~80 MB |
| Python dependencies | ~3 GB |
| **Total (Fast Setup)** | **~12 GB** |

> **Note:** The pipeline is thoroughly optimized to rely on Diffusers for SDXL Turbo to prevent 16GB out-of-memory RAM crashes common with other setups like FLUX.

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
│  Diffusers    │   │  Kokoro / Piper  │           │
│  6–7 PNGs     │   │  voiceover.wav   │           │
│  ~2s/image    │   │  ~5–10 seconds   │           │
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

# This installs: diffusers, kokoro-onnx, faster-whisper, ollama, pyyaml, soundfile, numpy
# Takes 5–10 minutes depending on internet speed
```

---

### Step 4: SDXL Turbo / Image Model

Diffusers will download model weights dynamically on the first run, but it is highly recommended to fetch them securely beforehand to initialize the caching.

**Why SDXL Turbo?**
FLUX models severely hallucinate Memory limitations on 16GB Apple Silicon machines. This setup defaults to SDXL Turbo which requires less than a third of the overhead, outputs in 1-4 inference steps max, and runs perfectly via Apple's `mps` backend locally on a 16GB limit.

```bash
# Pre-download SDXL-Turbo at 16-bit precision (~6.5GB)
# This only needs to run once — weights are cached in ~/.cache/huggingface/

python3 -c "
from diffusers import AutoPipelineForText2Image
import torch
print('Downloading SDXL-Turbo... This may take 5-10 minutes.')
pipeline = AutoPipelineForText2Image.from_pretrained(
   'stabilityai/sdxl-turbo', 
   torch_dtype=torch.float16, 
   variant='fp16'
)
print('Done! Model successfully cached.')
del pipeline
"
```

#### Test Image Generation

```bash
# Quick test to ensure `mps` (Apple Metal / GPU) is rendering correctly
python3 -c "
from diffusers import AutoPipelineForText2Image
import torch

try:
    pipe = AutoPipelineForText2Image.from_pretrained(
       'stabilityai/sdxl-turbo', 
       torch_dtype=torch.float16, 
       variant='fp16'
    )
    pipe.to('mps')

    # Generate image (1-4 steps to operate)
    image = pipe('a cinematic landscape, dramatic lighting, photorealistic', num_inference_steps=2, guidance_scale=0.0).images[0]
    image.save('test_output.png')
    print('Render complete, saved to test_output.png')
except Exception as e:
    print('Failed:', e)
"

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

# ── Stage 2: Image Generation (Diffusers) ───────────────────────────────
use_ip_adapter: true           # Maintains facial and style consistency
sd_model: "stabilityai/sdxl-turbo" # Or "SG161222/Realistic_Vision_V5.1_noVAE"
sd_steps: 4                    # SDXL Turbo: 2-4 steps. SD1.5: 20 steps.
sd_guidance: 0.0               # SDXL Turbo uses 0.0. SD 1.5 uses 7.5.

# ── Stage 3: Voice (Kokoro / F5 / RVC) ──────────────────────────────────────
tts_engine: "kokoro"           # "kokoro" or "f5-tts"
tts_voice: "af_bella"          # Options: af_bella, af_sarah, am_adam
use_rvc: false                 # Clone voice via rvc-cli sequentially

# ── Stage 4: Animation (FILM / FFmpeg) ──────────────────────────────────────
fps: 30                        # 30 is standard. 24 for more "cinematic" feel
use_film: true                 # Runs frame_interpolator hallucination for fluid motion
use_xfade: true                # Crossfade dissolves between clips

# ── Stage 5: Subtitles ────────────────────────────────────────────────────────
whisper_model: "base"          # tiny / base / small
subtitle_words: 4              # Words per subtitle chunk. 3–4 optimal for mobile
subtitle_karaoke: true         # Word-by-word yellow highlight (boosts retention)

# ── Stage 6: Assembly ─────────────────────────────────────────────────────────
beat_sync: true                # Uses librosa to dynamically cut scenes to BPM
music_volume: 0.08             # Bass volume under voiceover
cleanup_intermediates: false   # Delete clips/audio after final assembly
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

*Note: Runtimes heavily depend on whether you use heavy Frame Interpolation (FILM).*

| Stage | Time (SDXL Turbo - Simple Pan) | Time (SDXL Turbo + FILM) |
|---|---|---|
| S1 Script (Llama/Gemma) | ~45s | ~45s |
| S2 Images (6 images) | ~15s | ~15s |
| S3 Voice (Kokoro + RVC) | ~45s | ~45s |
| S4 Animate | ~45s (FFmpeg Pan) | ~5-10 min (FILM) |
| S5 Subtitles (Whisper) | ~15s | ~15s |
| S6 Assembly (FFmpeg) | ~20s | ~20s |
| **Total per video** | **~3-4 min** | **~8-13 min** |

### Batch performance

| Batch Size | SDXL Turbo | SD 1.5 |
|---|---|---|
| 5 videos | ~20 min | ~30 min |
| 10 videos | ~40 min | ~1 hour |
| 20 videos | ~1.5 hours | ~2 hours |

> **Tip:** Run batch jobs natively in the background. `python pipeline.py --batch concepts.txt` and come back to finished videos later.

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

### Image Prompt Techniques for SDXL Turbo

```bash
# Consistency across scenes: use the same "style anchor" phrase in every prompt
"... cinematic teal and orange color grade, volumetric light"

# For SDXL: be very descriptive
# Bad:  "dramatic space scene"
# Good: "black void of space, Saturn filling 40% of frame, ice geyser erupting
#        from Enceladus, backlighting from distant sun, photorealistic"

# SDXL Turbo supports negative prompts, but keep them simple:
# "blurry, text, watermark, bad anatomy, deformed"
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

### "GPU Out of memory" during generation
```bash
# SDXL Turbo is highly optimized, but ensure no other Heavy ML apps are running.
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

### Image Generation

| Model | Quality | Speed (M4) | Memory |
|---|---|---|---|
| **SDXL Turbo 16-bit** (recommended) | ★★★★ | ~3s/img | ~6.5GB |
| SD 1.5 LCM | ★★★ | ~2s/img | ~3.5GB |
| FLUX.1-schnell | ★★★★★ | ~60s/img | ~8GB (Requires `mflux` repo) |

### TTS

| Tool | Quality | Speed | Install |
|---|---|---|---|
| **Kokoro ONNX** (recommended) | ★★★★★ | ⚡ ~8s | `pip install kokoro-onnx` |
| Piper TTS | ★★★ | ⚡ ~5s | `pip install piper-tts` |

---

## 🤝 Contributing

Contributions welcome! We recently merged major updates including IP-Adapter, FILM Interpolation, RVC, Librosa BPM Sync, and the Node Express server. Areas where help is most needed:

- **Advanced AnimateDiff-Lightning integration** — robust text-to-video for 16GB
- **YouTube/TikTok API integration** — direct upload from the UI
- **SQLite job database** — persistent job history with search

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
