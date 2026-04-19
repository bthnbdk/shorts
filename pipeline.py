import argparse
import os
import sys
import yaml
import time
import json
from pathlib import Path
import subprocess

# Local imports for pipeline stages
from stages import s1_script, s2_images, s3_voice, s4_animate, s5_subtitles, s6_assemble

STAGE_MAP = {
    "script": (1, s1_script.run),
    "images": (2, s2_images.run),
    "voice": (3, s3_voice.run),
    "animate": (4, s4_animate.run),
    "subtitles": (5, s5_subtitles.run),
    "assemble": (6, s6_assemble.run)
}

def load_config(config_path="config.yaml"):
    if not os.path.exists(config_path):
        print(f"Error: {config_path} not found.")
        sys.exit(1)
    with open(config_path, "r") as f:
        return yaml.safe_load(f)

def run_pipeline(concept, style, voice, config, resume_from=None, job_id=None):
    if not job_id:
        job_id = str(int(time.time()))
    
    output_dir = Path(f"output/{job_id}")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    context = {
        "job_id": job_id,
        "concept": concept,
        "style": style,
        "voice": voice,
        "config": config,
        "output_dir": str(output_dir),
        "script_data": None
    }
    
    # Setup subdirectories
    for d in ["scripts", "images", "audio", "clips", "subtitles", "final"]:
        (output_dir / d).mkdir(exist_ok=True)
        
    start_stage = 1
    if resume_from:
        if resume_from not in STAGE_MAP:
            print(f"Error: Unknown resume stage '{resume_from}'")
            sys.exit(1)
        start_stage = STAGE_MAP[resume_from][0]
        
        # Load script data if we resume past stage 1
        if start_stage > 1:
            script_path = output_dir / "scripts" / "script.json"
            if script_path.exists():
                with open(script_path, "r") as f:
                    context["script_data"] = json.load(f)
            else:
                print("Error: Cannot resume past stage 1 without script.json")
                sys.exit(1)

    print(f"\\n🚀 Starting LocalShorts Pipeline | Job: {job_id}")
    print(f"Concept: {concept}\\n")

    stages = sorted(STAGE_MAP.items(), key=lambda x: x[1][0])
    
    for stage_name, (stage_num, stage_func) in stages:
        if stage_num < start_stage:
            print(f"⏭️ Skipping Stage {stage_num}: {stage_name.capitalize()}")
            continue
            
        print(f"\\n===========================")
        print(f"⏳ STAGE {stage_num}: {stage_name.upper()}")
        print(f"===========================")
        
        retry_count = config.get("max_retries", 3)
        attempt = 0
        success = False
        
        while attempt < retry_count:
            try:
                stage_func(context)
                success = True
                break
            except Exception as e:
                attempt += 1
                print(f"❌ Error in {stage_name} (Attempt {attempt}/{retry_count}): {str(e)}")
                if attempt < retry_count:
                    print("Retrying in 5 seconds...")
                    time.sleep(5)
                
        if not success:
            print(f"\\n💥 Pipeline failed at stage '{stage_name}' after {retry_count} attempts.")
            print(f"To resume later, run:")
            print(f"python pipeline.py --concept \\"{concept}\\" --resume-from {stage_name} --job-id {job_id}")
            sys.exit(1)

    print(f"\\n✅ Pipeline Complete! Result saved in: {output_dir / 'final'}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="LocalShorts AI Video Pipeline")
    parser.add_argument("--concept", type=str, help="The video concept/idea")
    parser.add_argument("--batch", type=str, help="Path to text or CSV file with concepts")
    parser.add_argument("--style", type=str, default="cinematic", help="Visual style")
    parser.add_argument("--voice", type=str, default="af_bella", help="TTS Voice")
    parser.add_argument("--resume-from", type=str, choices=STAGE_MAP.keys(), help="Resume pipeline from specific stage")
    parser.add_argument("--job-id", type=str, help="Job ID for resuming")
    
    args = parser.parse_args()
    config = load_config()
    
    if args.batch:
        with open(args.batch, "r") as f:
            for line in f:
                if line.strip() and not line.startswith("#"):
                    run_pipeline(line.strip(), args.style, args.voice, config)
    elif args.concept:
        run_pipeline(args.concept, args.style, args.voice, config, args.resume_from, args.job_id)
    else:
        print("Error: Must provide --concept or --batch")
        parser.print_help()
