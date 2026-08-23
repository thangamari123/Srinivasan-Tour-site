import os, glob, shutil, re

src_dir = r'public/images/temp-kolkata'
target_dir = r'public/images/kolkata-tour-11-days'

os.makedirs(target_dir, exist_ok=True)

files = glob.glob(os.path.join(src_dir, '*'))
new_images = []

for f in files:
    if os.path.isfile(f):
        base = os.path.basename(f)
        # sanitize filename
        sanitized = re.sub(r'[^a-zA-Z0-9.\-_]', '-', base).lower()
        sanitized = re.sub(r'-+', '-', sanitized)
        dest_path = os.path.join(target_dir, sanitized)
        shutil.copy2(f, dest_path)
        new_images.append(f'/images/kolkata-tour-11-days/{sanitized}')

# Cleanup temp dir
shutil.rmtree(src_dir, ignore_errors=True)

print(f'Processed {len(new_images)} images for Kolkata tour.')

# Now update src/data/packages.ts
pkg_file = r'src/data/packages.ts'
with open(pkg_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Find kolkata-tour-11-days block
pkg_id = 'kolkata-tour-11-days'
idx = content.find(f"slug: '{pkg_id}'")
if idx == -1:
    idx = content.find(f'slug: "{pkg_id}"')

if idx != -1:
    img_start = content.find('images: [', idx)
    if img_start != -1:
        img_end = content.find(']', img_start)
        if img_end != -1:
            images_formatted = 'images: [\n' + ',\n'.join([f'      "{img}"' for img in sorted(new_images)]) + '\n    ]'
            content = content[:img_start] + images_formatted + content[img_end+1:]
            with open(pkg_file, 'w', encoding='utf-8') as f:
                f.write(content)
            print('Successfully updated packages.ts for kolkata-tour-11-days!')
        else:
            print('Error: Could not find end of images array')
    else:
        print('Error: Could not find images array start')
else:
    print('Error: Could not find kolkata-tour-11-days package')
