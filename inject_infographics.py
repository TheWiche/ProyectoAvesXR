import os
import sys
import json
import math
import shutil
import argparse
import bpy
import mathutils

# Ensure local imports work
sys.path.append(os.getcwd())
try:
    from generate_labels import generate_all_bird_badges
except ImportError:
    generate_all_bird_badges = None

def clear_scene():
    """Removes all objects, meshes, materials and textures from the scene."""
    for obj in list(bpy.data.objects):
        bpy.data.objects.remove(obj, do_unlink=True)
    for mesh in list(bpy.data.meshes):
        bpy.data.meshes.remove(mesh, do_unlink=True)
    for mat in list(bpy.data.materials):
        bpy.data.materials.remove(mat, do_unlink=True)
    for img in list(bpy.data.images):
        bpy.data.images.remove(img, do_unlink=True)
    for curve in list(bpy.data.curves):
        bpy.data.curves.remove(curve, do_unlink=True)

def get_bounding_box():
    """Calculates overall bounding box of mesh objects in world coordinates."""
    min_coords = [float('inf')] * 3
    max_coords = [float('-inf')] * 3
    mesh_objs = [obj for obj in bpy.context.scene.objects if obj.type == 'MESH']
    
    if not mesh_objs:
        return None
        
    for obj in mesh_objs:
        for v in obj.bound_box:
            world_v = obj.matrix_world @ mathutils.Vector(v)
            for i in range(3):
                min_coords[i] = min(min_coords[i], world_v[i])
                max_coords[i] = max(max_coords[i], world_v[i])
                
    dims = [max_coords[i] - min_coords[i] for i in range(3)]
    center = [(min_coords[i] + max_coords[i]) / 2.0 for i in range(3)]
    max_dim = max(dims)
    
    return {
        "min": min_coords,
        "max": max_coords,
        "dims": dims,
        "center": center,
        "max_dim": max_dim
    }

def create_badge_material(badge_id, texture_path):
    """Creates a Principled BSDF material for a badge with emission and transparency."""
    mat = bpy.data.materials.new(name=f"Mat_Badge_{badge_id}")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    
    bsdf = nodes.get("Principled BSDF")
    
    tex_node = nodes.new('ShaderNodeTexImage')
    tex_node.image = bpy.data.images.load(os.path.abspath(texture_path))
    tex_node.interpolation = 'Smart'
    
    links.new(tex_node.outputs['Color'], bsdf.inputs['Base Color'])
    links.new(tex_node.outputs['Color'], bsdf.inputs['Emission Color'])
    if 'Emission Strength' in bsdf.inputs:
        bsdf.inputs['Emission Strength'].default_value = 1.3
    links.new(tex_node.outputs['Alpha'], bsdf.inputs['Alpha'])
    
    if 'Roughness' in bsdf.inputs:
        bsdf.inputs['Roughness'].default_value = 0.5
    if 'Specular IOR Level' in bsdf.inputs:
        bsdf.inputs['Specular IOR Level'].default_value = 0.0
        
    return mat

def create_glow_line_material():
    """Creates a glowing cyan emission material for the leader lines and pin markers."""
    mat = bpy.data.materials.new(name="Mat_GlowLeaderLine")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    bsdf = nodes.get("Principled BSDF")
    
    cyan = (0.0, 0.88, 1.0, 1.0)
    bsdf.inputs['Base Color'].default_value = cyan
    bsdf.inputs['Emission Color'].default_value = cyan
    if 'Emission Strength' in bsdf.inputs:
        bsdf.inputs['Emission Strength'].default_value = 3.0
        
    return mat

def build_callout(callout_idx, callout_data, bbox, texture_path, line_mat):
    """
    Builds a complete floating 3D callout with guaranteed non-overlapping clearance:
    - Double-sided badge plane with inverted UV for 360 reading
    - Sleek leader line cylinder
    - Anchor pin sphere at anatomical target point
    - Joint connector sphere at badge boundary
    """
    max_dim = bbox["max_dim"]
    center = bbox["center"]
    dims = bbox["dims"]
    half_x = dims[0] / 2.0
    half_y = dims[1] / 2.0
    
    target_rel = callout_data.get("target_rel", [0, 0, 0.5])
    badge_rel = callout_data.get("badge_rel", [1.0, -0.5, 0.7])
    
    # 1. World coordinates for anatomical target point
    target_x = center[0] + (target_rel[0] * half_x)
    target_y = center[1] + (target_rel[1] * half_y)
    target_z = bbox["min"][2] + (target_rel[2] * dims[2])
    target_pt = mathutils.Vector((target_x, target_y, target_z))
    
    # 2. Dimensions of badge (512x136 aspect ratio)
    badge_w = max_dim * 0.40
    badge_h = badge_w * (136.0 / 512.0)
    
    # Clearance: ensure inner edge never penetrates bird's bounding box
    clearance_x = half_x + (badge_w * 0.55) + (max_dim * 0.08)
    clearance_y = half_y + (max_dim * 0.08)
    
    badge_x = center[0] + (badge_rel[0] * clearance_x)
    badge_y = center[1] + (badge_rel[1] * clearance_y)
    badge_z = bbox["min"][2] + (badge_rel[2] * dims[2])
    badge_center = mathutils.Vector((badge_x, badge_y, badge_z))
    
    # 3. Badge material
    badge_id = callout_data.get("id", f"callout_{callout_idx}")
    badge_mat = create_badge_material(badge_id, texture_path)
    
    # 4. Front Plane
    bpy.ops.mesh.primitive_plane_add(size=1.0, location=badge_center)
    front_plane = bpy.context.active_object
    front_plane.name = f"Callout_{callout_idx+1}_{badge_id}_Front"
    front_plane.scale = (badge_w, badge_h, 1.0)
    # Face -Y (standing vertical, front view)
    front_plane.rotation_euler = (math.radians(90), 0, 0)
    front_plane.data.materials.append(badge_mat)
    
    # 5. Back Plane (offset by 0.5mm, rotated 180 Z, inverted UV)
    back_y_offset = 0.0006 * max_dim
    bpy.ops.mesh.primitive_plane_add(size=1.0, location=(badge_x, badge_y + back_y_offset, badge_z))
    back_plane = bpy.context.active_object
    back_plane.name = f"Callout_{callout_idx+1}_{badge_id}_Back"
    back_plane.scale = (badge_w, badge_h, 1.0)
    back_plane.rotation_euler = (math.radians(90), 0, math.radians(180))
    back_plane.data.materials.append(badge_mat)
    
    uv_layer = back_plane.data.uv_layers.active
    for loop in back_plane.data.loops:
        uv = uv_layer.data[loop.index].uv
        uv[0] = 1.0 - uv[0]
        
    # 6. Anchor start on badge boundary (closest side to target_pt)
    if target_x >= badge_x:
        start_x = badge_x + (badge_w * 0.46)
    else:
        start_x = badge_x - (badge_w * 0.46)
        
    start_z = badge_z - (badge_h * 0.35)
    start_y = badge_y
    start_pt = mathutils.Vector((start_x, start_y, start_z))
    
    # 7. Sleek leader line cylinder
    diff = target_pt - start_pt
    dist = diff.length
    if dist > 0.001:
        midpoint = (start_pt + target_pt) / 2.0
        dir_vec = diff.normalized()
        up = mathutils.Vector((0, 0, 1))
        rot_quat = up.rotation_difference(dir_vec)
        
        line_radius = max_dim * 0.0022
        bpy.ops.mesh.primitive_cylinder_add(
            radius=line_radius,
            depth=dist,
            location=midpoint
        )
        cylinder = bpy.context.active_object
        cylinder.name = f"LeaderLine_{callout_idx+1}_{badge_id}"
        cylinder.rotation_mode = 'QUATERNION'
        cylinder.rotation_quaternion = rot_quat
        cylinder.data.materials.append(line_mat)
        
        # 8. Target pin sphere at bird surface
        pin_radius = line_radius * 2.5
        bpy.ops.mesh.primitive_uv_sphere_add(
            radius=pin_radius,
            location=target_pt
        )
        pin = bpy.context.active_object
        pin.name = f"PinSphere_{callout_idx+1}_{badge_id}"
        pin.data.materials.append(line_mat)
        
        # 9. Joint sphere at badge edge
        joint_radius = line_radius * 1.6
        bpy.ops.mesh.primitive_uv_sphere_add(
            radius=joint_radius,
            location=start_pt
        )
        joint = bpy.context.active_object
        joint.name = f"JointSphere_{callout_idx+1}_{badge_id}"
        joint.data.materials.append(line_mat)

def process_bird_infographic(bird_id, birds_data_path="birds_data.json", output_dirs=["modelos_anotados", "public/models/annotated"]):
    """Main pipeline to process a bird with 5+ individual callout badges."""
    print("=" * 60)
    print(f">> Processing Multi-Callout 3D Pipeline: [{bird_id.upper()}]")
    print("=" * 60)
    
    with open(birds_data_path, "r", encoding="utf-8") as f:
        birds = json.load(f)
        
    if bird_id not in birds:
        raise ValueError(f"Bird '{bird_id}' not found in {birds_data_path}")
        
    bird_info = birds[bird_id]
    glb_path = os.path.abspath(bird_info["file_path"])
    
    if not os.path.exists(glb_path):
        raise FileNotFoundError(f"Model GLB not found: {glb_path}")
        
    # Step 1: Ensure callout textures exist
    tex_dir = "temp_textures"
    os.makedirs(tex_dir, exist_ok=True)
    
    callouts = bird_info.get("callouts", [])
    if not callouts:
        raise ValueError(f"No callouts defined for bird '{bird_id}' in {birds_data_path}")
        
    print(f">> Generating {len(callouts)} callout badges for {bird_id}...")
    if generate_all_bird_badges:
        tex_paths = generate_all_bird_badges(bird_id, bird_info, tex_dir)
    else:
        tex_paths = [os.path.join(tex_dir, f"{bird_id}_{c['id']}.png") for c in callouts]
        
    # Step 2: Clean Scene
    clear_scene()
    print(">> Scene cleared.")
    
    # Step 3: Import GLB
    print(f">> Importing GLB: {glb_path}")
    bpy.ops.import_scene.gltf(filepath=glb_path)
    
    # Step 4: Calculate Bounding Box
    bbox = get_bounding_box()
    if not bbox:
        raise RuntimeError("No mesh objects found after GLB import.")
        
    print(f">> Bounding Box:")
    print(f"   - Dimensions (X, Y, Z): {bbox['dims'][0]:.3f}m, {bbox['dims'][1]:.3f}m, {bbox['dims'][2]:.3f}m")
    print(f"   - Max Dim: {bbox['max_dim']:.3f}m")
    
    # Step 5: Shared leader line material
    line_mat = create_glow_line_material()
    
    # Step 6: Build each Callout badge + leader line
    for idx, (callout_data, tex_p) in enumerate(zip(callouts, tex_paths)):
        print(f"   [+] Callout #{idx+1}: [{callout_data['title']}]")
        build_callout(idx, callout_data, bbox, tex_p, line_mat)
        
    # Step 7: Export Consolidated GLB to all requested output directories
    out_filename = f"{bird_id}_con_infografia.glb"
    
    primary_out = None
    for out_dir in output_dirs:
        os.makedirs(out_dir, exist_ok=True)
        target_path = os.path.abspath(os.path.join(out_dir, out_filename))
        
        if primary_out is None:
            print(f">> Exporting GLB: {target_path}")
            bpy.ops.export_scene.gltf(
                filepath=target_path,
                export_format='GLB',
                export_apply=True,
                export_image_format='AUTO',
                export_draco_mesh_compression_enable=True,
                export_draco_mesh_compression_level=7
            )
            primary_out = target_path
        else:
            print(f">> Mirroring GLB to: {target_path}")
            shutil.copyfile(primary_out, target_path)
            
    file_size_mb = os.path.getsize(primary_out) / (1024 * 1024)
    print("=" * 60)
    print(f"[SUCCESS] {bird_id.upper()} processed successfully! ({file_size_mb:.2f} MB)")
    print("=" * 60)
    return primary_out

if __name__ == "__main__":
    argv = sys.argv
    if "--" in argv:
        args_to_parse = argv[argv.index("--") + 1:]
    else:
        args_to_parse = []
        
    parser = argparse.ArgumentParser(description="Inject multi-callout 3D infographics")
    parser.add_argument("--bird", type=str, default="turpial", help="Bird ID to process")
    parser.add_argument("--all", action="store_true", help="Process all birds")
    parser.add_argument("--data", type=str, default="birds_data.json", help="Path to birds metadata JSON")
    args = parser.parse_args(args_to_parse)
    
    with open(args.data, "r", encoding="utf-8") as f:
        birds = json.load(f)
        
    if args.all:
        for b_id in birds.keys():
            process_bird_infographic(bird_id=b_id, birds_data_path=args.data)
    else:
        process_bird_infographic(bird_id=args.bird, birds_data_path=args.data)
