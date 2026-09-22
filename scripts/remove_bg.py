"""
remove_bg.py — Elimina el fondo negro de los posters de aves
usando rembg (modelo u2net) para obtener PNG con alpha transparente
"""
import sys
from pathlib import Path
from rembg import remove
from PIL import Image
import io

POSTERS_DIR = Path("public/posters")
OUTPUT_DIR  = POSTERS_DIR  # sobreescribir en el mismo lugar

files = sorted(POSTERS_DIR.glob("*.png"))
if not files:
    print("No PNG files found in public/posters/")
    sys.exit(1)

print(f"Processing {len(files)} poster(s)...\n")

for img_path in files:
    print(f">> {img_path.name} ... ", end="", flush=True)

    with open(img_path, "rb") as f:
        input_data = f.read()

    # Remove background — returns PNG with transparent alpha
    output_data = remove(
        input_data,
        alpha_matting=True,
        alpha_matting_foreground_threshold=240,
        alpha_matting_background_threshold=10,
        alpha_matting_erode_size=10,
    )

    # Open result, resize to 512x512 preserving transparency
    img = Image.open(io.BytesIO(output_data)).convert("RGBA")
    img = img.resize((512, 512), Image.LANCZOS)

    # Save as PNG with transparency (overwrite)
    out_path = OUTPUT_DIR / img_path.name
    img.save(out_path, "PNG", optimize=True)

    size_kb = out_path.stat().st_size // 1024
    print(f"done → {size_kb} KB (transparent PNG 512×512)")

print("\nOK - All posters have transparent backgrounds!")
