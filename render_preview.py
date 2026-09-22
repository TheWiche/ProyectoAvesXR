import os
import sys
import math
import argparse
import bpy
import mathutils

def render_model_preview(glb_path, output_png_path, width=1280, height=720):
    # Clear scene
    for obj in list(bpy.data.objects):
        bpy.data.objects.remove(obj, do_unlink=True)
    for mesh in list(bpy.data.meshes):
        bpy.data.meshes.remove(mesh, do_unlink=True)
    for light in list(bpy.data.lights):
        bpy.data.lights.remove(light, do_unlink=True)
    for cam in list(bpy.data.cameras):
        bpy.data.cameras.remove(cam, do_unlink=True)
        
    bpy.ops.import_scene.gltf(filepath=glb_path)
    
    # Calculate bounds of everything
    min_c = [float('inf')]*3
    max_c = [float('-inf')]*3
    mesh_objs = [o for o in bpy.context.scene.objects if o.type == 'MESH']
    for o in mesh_objs:
        for v in o.bound_box:
            wv = o.matrix_world @ mathutils.Vector(v)
            for i in range(3):
                min_c[i] = min(min_c[i], wv[i])
                max_c[i] = max(max_c[i], wv[i])
                
    center = mathutils.Vector([(min_c[i] + max_c[i])/2.0 for i in range(3)])
    dims = [max_c[i] - min_c[i] for i in range(3)]
    max_dim = max(dims)
    
    # Add Camera facing from front-angle (-Y and slightly +X)
    cam_data = bpy.data.cameras.new("PreviewCam")
    cam_obj = bpy.data.objects.new("PreviewCam", cam_data)
    bpy.context.scene.collection.objects.link(cam_obj)
    bpy.context.scene.camera = cam_obj
    
    # Camera distance
    cam_dist = max_dim * 2.2
    cam_pos = mathutils.Vector((
        center.x + max_dim * 0.05,
        center.y - cam_dist,
        center.z + max_dim * 0.10
    ))
    cam_obj.location = cam_pos
    
    # Point camera to center
    dir_vec = center - cam_pos
    rot_quat = dir_vec.to_track_quat('-Z', 'Y')
    cam_obj.rotation_euler = rot_quat.to_euler()
    
    # Add 3-point studio lighting
    # Key light
    key_light_data = bpy.data.lights.new(name="KeyLight", type='SUN')
    key_light_data.energy = 3.5
    key_light_obj = bpy.data.objects.new(name="KeyLight", object_data=key_light_data)
    key_light_obj.rotation_euler = (math.radians(45), math.radians(15), math.radians(-30))
    bpy.context.scene.collection.objects.link(key_light_obj)
    
    # Fill light
    fill_light_data = bpy.data.lights.new(name="FillLight", type='SUN')
    fill_light_data.energy = 1.8
    fill_light_obj = bpy.data.objects.new(name="FillLight", object_data=fill_light_data)
    fill_light_obj.rotation_euler = (math.radians(30), math.radians(-40), math.radians(45))
    bpy.context.scene.collection.objects.link(fill_light_obj)
    
    # Background color (subtle dark gray studio)
    bpy.context.scene.world.use_nodes = True
    bg_node = bpy.context.scene.world.node_tree.nodes.get("Background")
    if bg_node:
        bg_node.inputs['Color'].default_value = (0.05, 0.07, 0.08, 1.0)
        
    # Render settings
    bpy.context.scene.render.resolution_x = width
    bpy.context.scene.render.resolution_y = height
    bpy.context.scene.render.filepath = os.path.abspath(output_png_path)
    bpy.context.scene.render.image_settings.file_format = 'PNG'
    bpy.context.scene.render.engine = 'BLENDER_EEVEE'
    
    bpy.ops.render.render(write_still=True)
    print(f">> Render saved to: {output_png_path}")

if __name__ == "__main__":
    glb = sys.argv[-2]
    out = sys.argv[-1]
    render_model_preview(glb, out)
