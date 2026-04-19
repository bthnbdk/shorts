import os
from pathlib import Path
import json
import subprocess

def run(context):
    output_dir = Path(context["output_dir"])
    config = context["config"]
    script_data = context["script_data"]
    
    audio_dir = output_dir / "audio"
    final_voice = audio_dir / "voiceover.wav"
    rvc_voice = audio_dir / "voiceover_rvc.wav"
    
    if rvc_voice.exists() or final_voice.exists():
        print("Voiceover already exists, skipping...")
        return
        
    engine = config.get("tts_engine", "kokoro") # kokoro or f5-tts
    
    # Extract full text
    full_text = " ".join([scene["narration"] for scene in script_data["scenes"]])
    text_path = audio_dir / "script.txt"
    with open(text_path, "w") as f:
        f.write(full_text)
        
    print(f"Generating TTS using {engine.upper()}...")
    
    if engine == "kokoro":
        import soundfile as sf
        from kokoro_onnx import Kokoro
        
        kokoro_model = config.get("kokoro_model_path", "assets/kokoro/kokoro-v0_19.onnx")
        voices_bin = config.get("kokoro_voices_path", "assets/kokoro/voices.bin")
        
        kokoro = Kokoro(kokoro_model, voices_bin)
        samples, rate = kokoro.create(
            full_text,
            voice=context["voice"],
            speed=config.get("tts_speed", 1.0),
            lang='en-us'
        )
        sf.write(final_voice, samples, rate)
        
    elif engine == "f5-tts":
        # Integrating F5-TTS
        # Assuming F5-TTS CLI or API usage
        ref_audio = config.get("f5_ref_audio", "assets/f5/ref.wav")
        ref_text = config.get("f5_ref_text", "Sample reference text.")
        
        cmd = [
            "f5-tts_infer-cli",
            "--model", "F5-TTS",
            "--ref_audio", ref_audio,
            "--ref_text", ref_text,
            "--gen_text", full_text,
            "--output_dir", str(audio_dir),
            "--output_file", "voiceover.wav"
        ]
        
        print("Running F5-TTS...")
        subprocess.run(cmd, check=True)
    else:
        raise ValueError(f"Unknown TTS engine: {engine}")

    # RVC Integration
    use_rvc = config.get("use_rvc", False)
    if use_rvc:
        print("Applying RVC to voiceover...")
        rvc_model = config.get("rvc_model", "assets/rvc/model.pth")
        rvc_index = config.get("rvc_index", "assets/rvc/model.index")
        
        # We assume `rvc-cli` exists for standard RVC inference
        rvc_cmd = [
            "rvc", "infer", 
            "-m", rvc_model,
            "-i", str(final_voice),
            "-o", str(rvc_voice),
            "-pi", rvc_index,
            "-f0", "rmvpe", # pitch extraction method
            "-up", "0"      # keypitch transpose
        ]
        
        try:
            subprocess.run(rvc_cmd, check=True)
            print("✅ RVC transformation complete.")
            # Swap final voice variables
            os.replace(rvc_voice, final_voice)
        except Exception as e:
            print(f"RVC failed: {e}. Falling back to original TTS audio.")
            
    print("✅ Voiceover complete.")
