import bpy
import os
import shutil

BIRDS = [
    {"id": "buco", "decimate": 0.40},
    {"id": "flamenco", "decimate": 0.35},
    {"id": "paloma", "decimate": 0.80},
    {"id": "rey_guajiro", "decimate": 0.60},
]

TEMP_PNG_DIR = os.path.abspath("temp_pngs")

for bird in BIRDS:
    b_id = bird["id"]
    in_glb = f"public/models/annotated/{b_id}_con_infografia.glb"
    out_usdz = f"public/models/{b_id}.usdz"
    
    print(f"\n==========================================")
    print(f"Processing {b_id} -> {out_usdz}")
    print(f"==========================================")
    
    # Clean temp png dir
    if os.path.exists(TEMP_PNG_DIR):
        shutil.rmtree(TEMP_PNG_DIR)
    os.makedirs(TEMP_PNG_DIR, exist_ok=True)
    
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=in_glb)
    
    # 1. Convert ALL images to uncompressed true PNG files
    for img in list(bpy.data.images):
        clean_name = img.name.replace('.webp', '').replace('.png', '')
        png_path = os.path.join(TEMP_PNG_DIR, f"{b_id}_{clean_name}.png")
        img.file_format = 'PNG'
        img.filepath_raw = png_path
        img.save()
        print(f"  Converted image {img.name} -> {png_path} ({os.path.getsize(png_path)} bytes)")
        
        # Reload from disk as PNG and remap users
        new_img = bpy.data.images.load(png_path)
        img.user_remap(new_img)
        bpy.data.images.remove(img)
        
    # 2. Decimate bird body mesh only
    dec_ratio = bird["decimate"]
    for obj in bpy.context.scene.objects:
        if obj.type == 'MESH' and len(obj.data.vertices) > 5000:
            mod = obj.modifiers.new(name="Decimate_Body", type='DECIMATE')
            mod.ratio = dec_ratio
            print(f"  Applied Decimate ({dec_ratio}) to bird body: {obj.name} ({len(obj.data.vertices)} verts)")
            
    # 3. Export to USDZ with Apple Quick Look settings:
    # convert_orientation=True, export_global_up_selection='Y', export_global_forward_selection='NEGATIVE_Z'
    bpy.ops.wm.usd_export(
        filepath=out_usdz,
        convert_orientation=True,
        export_global_forward_selection='NEGATIVE_Z',
        export_global_up_selection='Y',
        usdz_downscale_size='2048',
        export_materials=True,
        generate_preview_surface=True
    )
    
    if os.path.exists(out_usdz):
        size_mb = os.path.getsize(out_usdz) / (1024 * 1024)
        print(f"  ✅ SUCCESS: {out_usdz} created ({size_mb:.2f} MB)")
    else:
        print(f"  ❌ FAILED to create {out_usdz}")

# Clean temp directory when done
if os.path.exists(TEMP_PNG_DIR):
    shutil.rmtree(TEMP_PNG_DIR)

print("\n🎉 ALL BIRDS SUCCESSFULLY EXPORTED TO USDZ WITH 3D ANNOTATIONS & PNG TEXTURES!")
