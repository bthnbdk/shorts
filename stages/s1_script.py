import json
import os
import subprocess
from pathlib import Path

def run(context):
    output_dir = Path(context["output_dir"])
    config = context["config"]
    concept = context["concept"]
    
    script_path = output_dir / "scripts" / "script.json"
    if script_path.exists():
        print("Script already exists, skipping generation...")
        with open(script_path, "r") as f:
            context["script_data"] = json.load(f)
        return

    print("Generating script with Llama 3.2 via Ollama...")
    
    prompt = f"""
    You are an AI director creating short-form vertical videos (TikTok, YouTube Shorts).

    Your task:
    - Convert this concept into structured scenes: "{concept}"
    - Visual style requested: {context['style']}
    - Each scene must be visually strong and cinematic
    - Maintain character consistency across scenes
    - Keep total duration around 30-45 seconds

    Rules:
    - 5 to 7 scenes total
    - Each scene 4-6 seconds
    - Use simple, vivid English
    - Keep the same main character/subject description in ALL prompts

    Character consistency rule:
    Always determine a base description of your subject/character and REPEAT it in every single scene's image_prompt.
    Example: "a young blonde woman with blue eyes, wearing a white coat"

    Style rules:
    - cinematic lighting
    - realistic photo
    - shallow depth of field

    Generate:
    - narration (short sentence)
    - visual description
    - camera movement
    - SDXL-friendly image prompt

    Output ONLY valid JSON. No markdown blocks, no explanations.
    {{
      "title": "string",
      "duration_sec": 30,
      "tags": ["tag1", "tag2", "tag3"],
      "scenes": [
        {{
          "id": 1,
          "duration": 5,
          "narration": "string",
          "visual": "string",
          "camera": "string",
          "style": "string",
          "image_prompt": "string",
          "negative_prompt": "string"
        }}
      ]
    }}
    """
    
    # Run ollama using subprocess
    model = config.get("ollama_model", "llama3.2")
    try:
        result = subprocess.run(["ollama", "run", model, prompt], capture_output=True, text=True, check=True)
        raw_output = result.stdout.strip()
        
        # Clean up possible markdown around JSON
        if raw_output.startswith("```json"):
            raw_output = raw_output[7:]
        if raw_output.endswith("```"):
            raw_output = raw_output[:-3]
            
        script_data = json.loads(raw_output)
        
        with open(script_path, "w") as f:
            json.dump(script_data, f, indent=4)
            
        context["script_data"] = script_data
        print(f"✅ Generated {len(script_data['scenes'])} scenes.")
        
    except json.JSONDecodeError as e:
        raise Exception(f"Failed to parse LLM output as JSON: {e}")
    except subprocess.CalledProcessError as e:
        raise Exception(f"Ollama failed: {e.stderr}")
