import os, glob

target_dir = r'public/images/kerala-tour-8-days'
files = glob.glob(os.path.join(target_dir, '*'))
new_images = [f'/images/kerala-tour-8-days/{os.path.basename(f)}' for f in sorted(files) if os.path.isfile(f)]

print(f'Found {len(new_images)} images in {target_dir}')

pkg_file = r'src/data/packages.ts'
with open(pkg_file, 'r', encoding='utf-8') as f:
    content = f.read()

pkg_id = 'kerala-tour-8-days'
idx = content.find(f"slug: '{pkg_id}'")
if idx == -1:
    idx = content.find(f'slug: "{pkg_id}"')

if idx != -1:
    img_start = content.find('images: [', idx)
    if img_start != -1:
        img_end = content.find(']', img_start)
        if img_end != -1:
            images_formatted = 'images: [\n' + ',\n'.join([f'      "{img}"' for img in new_images]) + '\n    ]'
            content = content[:img_start] + images_formatted + content[img_end+1:]
            with open(pkg_file, 'w', encoding='utf-8') as f:
                f.write(content)
            print('Successfully updated packages.ts for kerala-tour-8-days!')
