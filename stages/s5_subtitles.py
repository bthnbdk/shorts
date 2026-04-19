import os
from pathlib import Path
import subprocess

def run(context):
    output_dir = Path(context["output_dir"])
    config = context["config"]
    
    audio_dir = output_dir / "audio"
    sub_dir = output_dir / "subtitles"
    
    voice_path = audio_dir / "voiceover.wav"
    sub_srt = sub_dir / "subtitles.srt"
    sub_ass = sub_dir / "subtitles.ass"
    
    if sub_ass.exists():
        print("Subtitles already exist, skipping...")
        return
        
    print("Generating word-level subtitles with Whisper...")
    from faster_whisper import WhisperModel
    import math

    model_size = config.get("whisper_model", "base")
    model = WhisperModel(model_size, device="cpu", compute_type="int8")
    
    segments, info = model.transcribe(str(voice_path), word_timestamps=True)
    
    word_chunks = []
    chunk_size = config.get("subtitle_words", 4)
    
    for segment in segments:
        words = segment.words
        for i in range(0, len(words), chunk_size):
            chunk = words[i:i+chunk_size]
            start = chunk[0].start
            end = chunk[-1].end
            text = " ".join([w.word.strip() for w in chunk]).upper()
            
            # Format times for SRT
            def format_time(seconds, srt=True):
                h = int(seconds // 3600)
                m = int((seconds % 3600) // 60)
                s = int(seconds % 60)
                ms = int((seconds - int(seconds)) * 1000)
                if srt:
                    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"
                else: # ASS format
                    cs = ms // 10
                    return f"{h:01d}:{m:02d}:{s:02d}.{cs:02d}"
                    
            word_chunks.append({
                "start": start,
                "end": end,
                "text": text,
                "srt_start": format_time(start),
                "srt_end": format_time(end),
                "ass_start": format_time(start, False),
                "ass_end": format_time(end, False),
                "words": chunk
            })

    # Write SRT
    with open(sub_srt, "w", encoding="utf-8") as f:
        for i, chunk in enumerate(word_chunks):
            f.write(f"{i+1}\\n{chunk['srt_start']} --> {chunk['srt_end']}\\n{chunk['text']}\\n\\n")

    # Write ASS with Karaoke
    with open(sub_ass, "w", encoding="utf-8") as f:
        f.write("[Script Info]\\nScriptType: v4.00+\\nPlayResX: 1080\\nPlayResY: 1920\\n\\n")
        f.write("[V4+ Styles]\\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\\n")
        
        # Tiktok style bold yellow highlight
        primary = "&H00FFFFFF" # white
        if config.get("subtitle_karaoke", True):
            secondary = "&H0000FFFF" # yellow
        else:
            secondary = "&H00FFFFFF"
            
        f.write(f"Style: Default,Arial,90,{primary},{secondary},&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,6,3,2,10,10,250,1\\n\\n")
        
        f.write("[Events]\\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\\n")
        
        for chunk in word_chunks:
            if config.get("subtitle_karaoke", True):
                k_text = ""
                for w in chunk["words"]:
                    dur_cs = int((w.end - w.start) * 100)
                    k_text += f"{{\\\\k{dur_cs}}}" + w.word.strip().upper() + " "
                text = k_text.strip()
            else:
                text = chunk["text"]
            
            f.write(f"Dialogue: 0,{chunk['ass_start']},{chunk['ass_end']},Default,,0,0,0,,{text}\\n")

    print("✅ Subtitles generated.")
