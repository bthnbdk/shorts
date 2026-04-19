import os
from pathlib import Path
import json

def run(context):
    output_dir = Path(context["output_dir"])
    config = context["config"]
    script_data = context["script_data"]
    
    # We will use diffusers here because it supports IP-Adapter perfectly
    import torch
    from diffusers import AutoPipelineForText2Image, DDIMScheduler
    from PIL import Image

    print("Checking for existing images...")
    img_dir = output_dir / "images"
    existing_images = list(img_dir.glob("*.png"))
    if len(existing_images) >= len(script_data["scenes"]):
        print("Images already exist, skipping...")
        return
        
    print("Loading Image Generation Model with IP-Adapter...")
    
    # Default Configuration logic 
    model_id = config.get("sd_model", "stabilityai/sdxl-turbo")
    use_ip_adapter = config.get("use_ip_adapter", True) if "sdxl-turbo" not in model_id else False
    ip_adapter_scale = config.get("ip_adapter_scale", 0.5)
    
    device = "mps" if torch.backends.mps.is_available() else "cpu"
    if torch.cuda.is_available(): device = "cuda"

    print(f"Loading {model_id} on {device}...")
    pipeline = AutoPipelineForText2Image.from_pretrained(
        model_id, 
        torch_dtype=torch.float16 if device != "cpu" else torch.float32,
        variant="fp16" if "sdxl-turbo" in model_id else None,
        use_safetensors=True
    )
    
    # Load IP-Adapter if enabled, SDXL-Turbo does not inherently support SD15 IP Adapter logic well, so we isolate it
    if use_ip_adapter and "sdxl-turbo" not in model_id:
        print("Loading IP-Adapter weights for consistent style...")
        # Assume SD1.5 base if using IP-Adapter here for simplicity
        pipeline.load_ip_adapter("h94/IP-Adapter", subfolder="models", weight_name="ip-adapter_sd15.bin")
        pipeline.set_ip_adapter_scale(ip_adapter_scale)

    pipeline = pipeline.to(device)
    
    # Optional: xformers or attention slicing for memory
    if device == "mps":
        pipeline.enable_attention_slicing()

    seed = config.get("sd_seed", 42)
    generator = torch.Generator(device=device).manual_seed(seed)
    
    reference_image = None
    ref_image_path = config.get("reference_image_path", None)
    
    if use_ip_adapter and "sdxl-turbo" not in model_id and ref_image_path and os.path.exists(ref_image_path):
        print(f"Using reference image: {ref_image_path}")
        reference_image = Image.open(ref_image_path).convert("RGB")
    
    for i, scene in enumerate(script_data["scenes"]):
        img_path = img_dir / f"scene_{i+1:02d}.png"
        if img_path.exists():
            continue
            
        print(f"Generating image {i+1}/{len(script_data['scenes'])}")
        
        prompt = scene["image_prompt"]
        if "style" in scene and scene["style"]:
            prompt += f", {scene['style']}"
        if "camera" in scene and scene["camera"]:
            prompt += f", {scene['camera']}"
            
        if "style_anchor" in config:
            prompt += f", {config['style_anchor']}"
            
        is_turbo = "sdxl-turbo" in model_id
        
        kwargs = {
            "prompt": prompt,
            "num_inference_steps": config.get("sd_steps", 2 if is_turbo else 20),
            "guidance_scale": config.get("sd_guidance", 0.0 if is_turbo else 7.5),
            "generator": generator,
            # Generate slightly lower res base for 16GB RAM limit, FILM will upscale later or FFmpeg can pad/scale
            "width": 512,
            "height": 768 if is_turbo else 912
        }
        
        # Only use negative prompt if guidance scale > 1 (required by diffusers)
        if kwargs["guidance_scale"] > 1.0:
             kwargs["negative_prompt"] = "blurry, text, watermark, bad anatomy, deformed"
        
        # If IP-Adapter is active, we can feed the first generated image as reference for the rest!
        if use_ip_adapter and not is_turbo:
            if reference_image is not None:
                kwargs["ip_adapter_image"] = reference_image
            
        image = pipeline(**kwargs).images[0]
        image.save(img_path)
        
        # Auto-reference: Use first generated image as style anchor for the rest of the video if no ref provided
        if use_ip_adapter and not is_turbo and reference_image is None:
            print("Using Scene 1 as IP-Adapter reference for subsequent scenes.")
            reference_image = image

        # CRITICAL MEMORY CLEANUP for 16GB Apple Silicon
        if device == "mps":
            torch.mps.empty_cache()

    print("✅ Image generation complete.")
