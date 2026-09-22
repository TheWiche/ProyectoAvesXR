import os
import json
import argparse
from PIL import Image, ImageDraw, ImageFont

def get_font(name, size):
    fonts_dir = "C:\\Windows\\Fonts"
    font_path = os.path.join(fonts_dir, name)
    if os.path.exists(font_path):
        try:
            return ImageFont.truetype(font_path, size)
        except Exception:
            pass
    return ImageFont.load_default()

def generate_callout_badge(bird_id, callout_idx, callout_data, output_dir="temp_textures"):
    """
    Generates a compact, clean 3D callout badge (512 x 136 px)
    without unnecessary headers ('Callout XX' / 'Aves de la Guajira').
    Focuses directly on Title and Description.
    """
    os.makedirs(output_dir, exist_ok=True)
    
    W, H = 512, 136
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Palette
    bg_color = (12, 22, 18, 242)             # Dark glass 95% opacity
    border_cyan = (0, 220, 255, 230)          # Tech Cyan
    gold_accent = (235, 180, 60, 255)         # Gold Guajira
    text_white = (255, 255, 255, 255)
    text_muted = (185, 215, 210, 255)
    
    pad_x, pad_y = 12, 10
    x0, y0 = pad_x, pad_y
    x1, y1 = W - pad_x, H - pad_y
    radius = 16
    
    # 1. Main badge card
    draw.rounded_rectangle([x0, y0, x1, y1], radius=radius, fill=bg_color, outline=border_cyan, width=2)
    
    # 2. Left vertical accent bar
    bar_w = 6
    draw.rounded_rectangle([x0 + 4, y0 + 12, x0 + 4 + bar_w, y1 - 12], radius=3, fill=gold_accent)
    
    # 3. Corner tech brackets
    b_len = 16
    b_thick = 3
    # Top-Right
    draw.line([(x1 - b_len, y0), (x1, y0), (x1, y0 + b_len)], fill=border_cyan, width=b_thick)
    # Bottom-Right
    draw.line([(x1 - b_len, y1), (x1, y1), (x1, y1 - b_len)], fill=border_cyan, width=b_thick)
    
    # Fonts
    font_title = get_font("segoeuib.ttf", 29)
    font_desc = get_font("segoeui.ttf", 20)
    
    content_x = x0 + 26
    
    # Line 1: Title
    title = callout_data.get("title", "CARACTERÍSTICA").upper()
    draw.text((content_x, y0 + 20), title, font=font_title, fill=text_white)
    
    # Line 2: Description
    desc = callout_data.get("desc", "")
    draw.text((content_x, y0 + 64), desc, font=font_desc, fill=text_muted)
    
    callout_id = callout_data.get("id", f"callout_{callout_idx}")
    out_filename = f"{bird_id}_{callout_id}.png"
    out_path = os.path.join(output_dir, out_filename)
    img.save(out_path, "PNG")
    return out_path

def generate_all_bird_badges(bird_id, bird_info, output_dir="temp_textures"):
    callouts = bird_info.get("callouts", [])
    paths = []
    for idx, c in enumerate(callouts):
        p = generate_callout_badge(bird_id, idx, c, output_dir)
        paths.append(p)
    return paths

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate individual callout badges")
    parser.add_argument("--bird", type=str, default="turpial", help="Bird ID")
    parser.add_argument("--all", action="store_true", help="Generate all birds callouts")
    args = parser.parse_args()
    
    with open("birds_data.json", "r", encoding="utf-8") as f:
        birds = json.load(f)
        
    if args.all:
        for b_id, b_data in birds.items():
            generate_all_bird_badges(b_id, b_data)
            print(f"[OK] Generated badges for: {b_id}")
    else:
        if args.bird in birds:
            generate_all_bird_badges(args.bird, birds[args.bird])
            print(f"[OK] Generated badges for: {args.bird}")
        else:
            print(f"Error: Bird '{args.bird}' not found.")
