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
    You are an expert short-form video creator. Create a highly engaging 45-60 second script for: {concept}
    Visual style: {context['style']}
    
    Respond ONLY with valid JSON. Do not include markdown blocks or any other text.
    Format:
    {{
      "title": "SEO optimized title",
      "hook": "The first engaging 3 seconds",
      "tags": ["tag1", "tag2", "tag3"],
      "scenes": [
        {{
          "narration": "The words to be spoken",
          "image_prompt": "A highly detailed, cinematic prompt for a text-to-image model without negative instructions"
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
