import os, urllib.request, re, shutil
from concurrent.futures import ThreadPoolExecutor

files_data = [
    ("1l-zYXYaMgroIOURSYfMpBjF9I9MU6RCc", "navagraha-tour-3-days-1.jpg"),
    ("16TkdK18N2EaegGu5XWSK0vUBH4bR_eLP", "navagraha-tour-3-days-2.jpg"),
    ("1u_x3_15lLnqd60fMnsGoC6BfiTIXJ-vE", "navagraha-tour-3-days-3.jpg"),
    ("1sJK2YCCA1CB0Aq1-mwn7UGYnQqWzPO_c", "navagraha-tour-3-days-4.jpg"),
    ("1hcO-veY53mvU6E3PgVv4fSKB3qwyhYF2", "navagraha-tour-3-days-5.jpg"),
    ("1UDspBdrJ2rMhkToBCO-Qpf1vkJERsajx", "navagraha-tour-3-days-6.jpg"),
    ("1MUbNzL_cKS8f4odIcdpMYPmVHKNWnLMD", "navagraha-tour-3-days-7.jpg"),
    ("1usXSvK1eej4CSZru5c_hRj4o6hF5_zzK", "navagraha-tour-3-days-8.jpg"),
    ("1h4PXGzUgHJ6_suZmDjX8R5-VN3P8Me3D", "navagraha-tour-3-days-9.jpg"),
    ("1-frTBnXP8v9SPJUYSnJsgs007s6zV0sT", "navagraha-tour-3-days-10.jpg"),
    ("1Ax1uTGzv3OqCF7Qtvgi69A5p0rn_bdhM", "navagraha-tour-3-days-11.jpg"),
    ("1sU4aYwl_X7Sx8xMdE0TUxjnZGcYeg2BE", "navagraha-tour-3-days-12.jpg"),
    ("1QUdLi7nJp6trl4dSgF4v0zUvE3KsEk9t", "navagraha-tour-3-days-13.jpg"),
    ("1t5H-hg8c5THHG2MDdP54yOKp6oMcP0fF", "navagraha-tour-3-days-14.jpg"),
    ("1NI7ZGbs8iajsIOtzPqXGC2SqqriImZLG", "navagraha-tour-3-days-15.jpg"),
    ("1S76SrnlS0J_-XrtUs_7MwuMangBEHdZv", "navagraha-tour-3-days-16.jpg"),
]

target_dir = r'public/images/navagraha-tour-3-days'
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
        return f'/images/navagraha-tour-3-days/{sanitized}'
    except Exception as e:
        print(f'Failed {filename}: {e}')
        return None

with ThreadPoolExecutor(max_workers=8) as executor:
    results = executor.map(download_file, files_data)

new_images = [r for r in results if r]
print(f'Successfully downloaded {len(new_images)} images for Navagraha tour.')

# Update src/data/packages.ts
pkg_file = r'src/data/packages.ts'
with open(pkg_file, 'r', encoding='utf-8') as f:
    content = f.read()

pkg_id = 'navagraha-tour-3-days'
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
            print('Successfully updated packages.ts for navagraha-tour-3-days!')
        else:
            print('Error: Could not find end of images array')
    else:
        print('Error: Could not find images array start')
else:
    print('Error: Could not find navagraha-tour-3-days package')
