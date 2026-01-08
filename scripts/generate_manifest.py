
import os
import json

base_dir = 'public/raven-assets'
manifest = {}

# Ensure order 1 to 9
folders = sorted([f for f in os.listdir(base_dir) if os.path.isdir(os.path.join(base_dir, f)) and f[0].isdigit()])

for folder in folders:
    files = [f for f in os.listdir(os.path.join(base_dir, folder)) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
    # Filter out empty names or dotfiles just in case
    files = [f for f in files if not f.startswith('.')]
    manifest[folder] = sorted(files)

output_path = os.path.join(base_dir, 'manifest.json')
with open(output_path, 'w') as f:
    json.dump(manifest, f, indent=2)

print(f"Manifest generated at {output_path}")
print(json.dumps(manifest, indent=2))
