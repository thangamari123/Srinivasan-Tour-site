import os, urllib.request, re, shutil
from concurrent.futures import ThreadPoolExecutor

files_data = [
    ("1Ey92CznrGXe6BZPIr62jmzSEOMEiYKk3", "amarnath-tour-14-days-1.jpg"),
    ("1IkjUypP3Gb1qY-CDuuNSVhROhA4qlidf", "amarnath-tour-14-days-2.jpg"),
    ("1plEzIqVfsXa3Nt_88Wft5LtQyYKHnJXu", "amarnath-tour-14-days-3.jpg"),
    ("1d3O2A5x-A_Ky8aJiGQQsG5fDb6wrENa4", "amarnath-tour-14-days-4.png"),
    ("1D619-1wbAT9WkAZbekwa4f1Yu3GYdL1c", "amarnath-tour-14-days-5.jpg"),
    ("1yS2sMA93qZkMs5KIrgiZk6CM6mTzxY5g", "amarnath-tour-14-days-6.jpg"),
]

target_dir = r'public/images/amarnath-tour-14-days'
os.makedirs(target_dir, exist_ok=True)

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

def download_file(item):
    fid, filename = item
    sanitized = re.sub(r'[^a-zA-Z0-9.\-_]', '-', filename).lower()
    sanitized = re.sub(r'-+', '-', sanitized)
    dest_path = os.path.join(target_dir, sanitized)
    url = f'https://drive.google.com/uc?export=download&id={fid}'
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as resp, open(dest_path, 'wb') as out:
            out.write(resp.read())
        print(f'Downloaded: {sanitized}')
        return f'/images/amarnath-tour-14-days/{sanitized}'
    except Exception as e:
        print(f'Failed {filename}: {e}')
        return None

with ThreadPoolExecutor(max_workers=8) as executor:
    results = executor.map(download_file, files_data)

new_images = [r for r in results if r]
print(f'Successfully downloaded {len(new_images)} images for Amarnath tour.')

# Update src/data/packages.ts
pkg_file = r'src/data/packages.ts'
with open(pkg_file, 'r', encoding='utf-8') as f:
    content = f.read()

pkg_id = 'amarnath-tour-14-days'
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
            print('Successfully updated packages.ts for amarnath-tour-14-days!')
        else:
            print('Error: Could not find end of images array')
    else:
        print('Error: Could not find images array start')
else:
    print('Error: Could not find amarnath-tour-14-days package')
