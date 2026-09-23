import bpy
import os

BLENDER_EXE = r"C:\Program Files\Blender Foundation\Blender 5.2\blender.exe"

BIRDS = [
    {"id": "buco", "decimate": 0.45},
    {"id": "flamenco", "decimate": 0.40},
    {"id": "paloma", "decimate": 0.85},
    {"id": "rey_guajiro", "decimate": 0.75},
    {"id": "turpial", "decimate": 0.70},
]

for bird in BIRDS:
    b_id = bird["id"]
    in_glb = f"public/models/{b_id}.glb"
    out_usdz = f"public/models/{b_id}.usdz"
    
    print(f"\n--- Converting {b_id} -> {out_usdz} ---")
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=in_glb)
    
    dec_ratio = bird.get("decimate", 1.0)
    if dec_ratio < 1.0:
        for obj in bpy.context.scene.objects:
            if obj.type == 'MESH':
                mod = obj.modifiers.new(name="DecimateMod", type='DECIMATE')
                mod.ratio = dec_ratio
                print(f"Applied Decimate ({dec_ratio}) to {obj.name}")
                
    bpy.ops.wm.usd_export(
        filepath=out_usdz,
        usdz_downscale_size='2048',
        export_materials=True,
        generate_preview_surface=True
    )
    
    if os.path.exists(out_usdz):
        size_mb = os.path.getsize(out_usdz) / (1024 * 1024)
        print(f"✅ Successfully created {out_usdz}: {size_mb:.2f} MB")
    else:
        print(f"❌ Failed to create {out_usdz}")

print("\n🎉 All 5 birds optimized for iOS Quick Look!")
