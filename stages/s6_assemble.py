import os
from pathlib import Path
import subprocess
import glob
import random

def run(context):
    output_dir = Path(context["output_dir"])
    config = context["config"]
    
    clips_dir = output_dir / "clips"
    audio_dir = output_dir / "audio"
    sub_dir = output_dir / "subtitles"
    final_dir = output_dir / "final"
    
    voice_path = audio_dir / "voiceover.wav"
    sub_ass = sub_dir / "subtitles.ass"
    out_file = final_dir / f"short_{context['job_id']}.mp4"
    
    # 1. Select random music track
    music_files = glob.glob("assets/music/*.mp3") + glob.glob("assets/music/*.wav")
    chosen_music = random.choice(music_files) if music_files else None
    
    # Extract beats if beat sync enabled
    beats = []
    if chosen_music and config.get("beat_sync", True):
        print("Analyzing music BPM for beat-synced transitions with librosa...")
        try:
            import librosa
            y, sr = librosa.load(chosen_music)
            tempo, beat_frames = librosa.beat.beat_track(y=y, sr=sr)
            beats = librosa.frames_to_time(beat_frames, sr=sr)
            print(f"Detected {len(beats)} beats. Adjusting cuts...")
        except Exception as e:
            print(f"Librosa beat sync failed: {e}")
            beats = []

    # Get clips and existing durations
    # To keep it simple, we use FFmpeg concat file
    clips = sorted(os.listdir(clips_dir))
    concat_lines = []
    
    current_time = 0.0
    for clip in clips:
        if not clip.endswith(".mp4"): continue
        clip_p = clips_dir / clip
        
        # Get duration
        dur_cmd = ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", str(clip_p)]
        dur = float(subprocess.check_output(dur_cmd).decode().strip())
        
        ideal_end = current_time + dur
        
        # Align end to nearest beat
        if beats is not None and len(beats) > 0:
            nearest_beat = min(beats, key=lambda x: abs(x - ideal_end))
            if abs(nearest_beat - ideal_end) < 1.5:  # only adjust if within max 1.5 seconds
                dur = nearest_beat - current_time
                if dur < 1.0: dur = 1.0 # Minimum clip duration
        
        concat_lines.append(f"file '{clip_p.resolve()}'")
        concat_lines.append(f"duration {dur}")
        current_time += dur

    concat_file = output_dir / "concat.txt"
    with open(concat_file, "w") as f:
        f.write("\\n".join(concat_lines))
        
    temp_video = output_dir / "temp_video.mp4"
    
    print("Concatenating video clips...")
    subprocess.run([
        "ffmpeg", "-y", "-f", "concat", "-safe", "0",
        "-i", str(concat_file),
        "-c:v", "libx264", "-pix_fmt", "yuv420p",
        str(temp_video)
    ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    
    print("Muxing final audio, music, and subtitles...")
    
    volume = config.get("music_volume", 0.08)
    
    if chosen_music:
        # Complex filter string for mixing audio and burning subtitles
        filter_complex = f"[1:a]volume=1.0[a1];[2:a]volume={volume}[a2];[a1][a2]amix=inputs=2:duration=first:dropout_transition=2[aout];[0:v]ass='{sub_ass.resolve()}'[vout]"
        
        cmd = [
            "ffmpeg", "-y",
            "-i", str(temp_video),
            "-i", str(voice_path),
            "-i", chosen_music,
            "-filter_complex", filter_complex,
            "-map", "[vout]", "-map", "[aout]",
            "-c:v", "libx264", "-preset", "fast",
            "-c:a", "aac", "-b:a", "192k",
            str(out_file)
        ]
    else:
        filter_complex = f"[0:v]ass='{sub_ass.resolve()}'[vout]"
        cmd = [
            "ffmpeg", "-y",
            "-i", str(temp_video),
            "-i", str(voice_path),
            "-filter_complex", filter_complex,
            "-map", "[vout]", "-map", "1:a",
            "-c:v", "libx264", "-preset", "fast",
            "-c:a", "aac", "-b:a", "192k",
            str(out_file)
        ]
        
    subprocess.run(cmd, check=True)
    
    print(f"✅ Final video assembled: {out_file.name}")
