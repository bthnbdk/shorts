import os
from pathlib import Path
import subprocess
from PIL import Image

def run(context):
    output_dir = Path(context["output_dir"])
    config = context["config"]
    script_data = context["script_data"]
    
    img_dir = output_dir / "images"
    clips_dir = output_dir / "clips"
    
    use_film = config.get("use_film", True)
    fps = config.get("fps", 30)
    
    existing_clips = list(clips_dir.glob("*.mp4"))
    if len(existing_clips) >= len(script_data["scenes"]):
        print("Clips already exist, skipping...")
        return
        
    for i, scene in enumerate(script_data["scenes"]):
        clip_path = clips_dir / f"clip_{i+1:02d}.mp4"
        if clip_path.exists():
            continue
            
        print(f"Animating scene {i+1}...")
        img_path = img_dir / f"scene_{i+1:02d}.png"
        
        # Calculate duration based on word count (approx 160 wpm)
        words = len(scene["narration"].split())
        duration = max(3.0, (words / 160.0) * 60.0)
        frames_needed = int(duration * fps)
        
        if use_film:
            print("Applying FILM interpolation for actual motion...")
            # We'll create an artificial end frame by zooming into the image 
            # and let FILM hallucinate the transition frames.
            start_img = Image.open(img_path)
            w, h = start_img.size
            
            # Zoom and crop to create end state
            zoom_factor = 1.15
            new_w, new_h = int(w / zoom_factor), int(h / zoom_factor)
            left = (w - new_w) / 2
            top = (h - new_h) / 2
            right = (w + new_w) / 2
            bottom = (h + new_h) / 2
            
            end_img = start_img.crop((left, top, right, bottom)).resize((w, h), Image.Resampling.LANCZOS)
            
            frame_dir = clips_dir / f"film_frames_{i+1:02d}"
            frame_dir.mkdir(exist_ok=True)
            
            # Save anchor frames
            start_img.save(frame_dir / "frame_0000.png")
            end_img.save(frame_dir / "frame_0001.png")
            
            # Run FILM (we assume `frame_interpolator` CLI from Google Research FILM is installed)
            # Typically FILM uses 2^n interpolation. 
            # If we need e.g. 120 frames, we run 7 times (2^7 = 128 frames)
            import math
            times_to_interpolate = math.ceil(math.log2(frames_needed))
            
            film_cmd = [
                "frame_interpolator",
                "--photos", str(frame_dir),
                "--times_to_interpolate", str(times_to_interpolate)
            ]
            
            try:
                subprocess.run(film_cmd, check=True)
                
                # Render interpolated frames to video
                interpolated_dir = frame_dir / "interpolated_frames"
                ffmpeg_cmd = [
                    "ffmpeg", "-y",
                    "-framerate", str(fps),
                    "-pattern_type", "glob",
                    "-i", str(interpolated_dir / "*.png"),
                    "-c:v", "libx264", "-pix_fmt", "yuv420p",
                    "-t", str(duration),
                    str(clip_path)
                ]
                subprocess.run(ffmpeg_cmd, check=True)
                print(f"✅ Scene {i+1} animated with FILM.")
            except Exception as e:
                print(f"FILM failed, falling back to Ken Burns: {e}")
                use_film = False
                
        if not use_film:
            # Fallback to standard FFmpeg Ken Burns
            # Pan options to add variety
            pans = [
                f"zoompan=z='min(zoom+0.001,1.15)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={frames_needed}:s=1080x1920", # zoom in
                f"zoompan=z='1.15-p*0.001':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={frames_needed}:s=1080x1920", # zoom out
                f"zoompan=z='1.1':x='x+1':y='ih/2-(ih/zoom/2)':d={frames_needed}:s=1080x1920" # pan right
            ]
            pan_effect = pans[i % len(pans)]
            
            cmd = [
                "ffmpeg", "-y",
                "-loop", "1",
                "-framerate", str(fps),
                "-i", str(img_path),
                "-vf", f"scale=1080:1920,setsar=1,{pan_effect}",
                "-c:v", "libx264",
                "-t", str(duration),
                "-pix_fmt", "yuv420p",
                str(clip_path)
            ]
            
            subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            print(f"✅ Scene {i+1} animated (Ken Burns).")

    print("✅ All scenes animated.")
