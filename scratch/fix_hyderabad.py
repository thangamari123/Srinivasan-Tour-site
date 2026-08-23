import urllib.request, os, glob, re

fid = '1u746iu_BiEDLlUmpBKDy_jjbtBXuJ7x6'
filename = 'hyderabad-tour-5-days-18-.jpg'
target_dir = r'public/images/hyderabad-tour-5-days'
dest_path = os.path.join(target_dir, filename)

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
url = f'https://drive.google.com/uc?export=download&id={fid}'

try:
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req) as resp, open(dest_path, 'wb') as out:
        out.write(resp.read())
    print('Successfully downloaded image 18!')
except Exception as e:
    print('Error downloading image 18:', e)

# Update packages.ts
target_dir = r'public/images/hyderabad-tour-5-days'
files = glob.glob(os.path.join(target_dir, '*'))
new_images = [f'/images/hyderabad-tour-5-days/{os.path.basename(f)}' for f in sorted(files) if os.path.isfile(f)]

pkg_file = r'src/data/packages.ts'
with open(pkg_file, 'r', encoding='utf-8') as f:
    content = f.read()

pkg_id = 'hyderabad-tour-5-days'
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
            print(f'Successfully updated packages.ts with {len(new_images)} images!')
