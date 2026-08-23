import os, urllib.request, re, shutil
from concurrent.futures import ThreadPoolExecutor

files_data = [
    ("1jxZC20X2UK0skSHienIOgE6Y2eQW8NZ4", "badrinath-tour-16-days-1.jpg"),
    ("1qJfsRzguKMx416yNWPLgHHHQC_rrHKt8", "badrinath-tour-16-days-2.jpg"),
    ("1a2LwlS7EGJH_eNVelAA7-73IUgZXSBVX", "badrinath-tour-16-days-3.jpg"),
    ("1gxE85afGI0djslvTX6ZZPutmQNcXJ1JD", "badrinath-tour-16-days-4.jpg"),
    ("1Hx9RNkuMBVNoWsBe1ZUNamwjZAnec3jA", "badrinath-tour-16-days-5.jpg"),
    ("1mVsGIZPggyGkDFg1sMSFck3sVOtqTpkB", "badrinath-tour-16-days-6.jpg"),
    ("1AUv-E_UFE2pvZ9q-A62aqCr5nW1wc44i", "badrinath-tour-16-days-7.jpg"),
    ("11_PP3HsUjNbKhI_th7LYC6up9EYOHkBb", "badrinath-tour-16-days-8.jpg"),
    ("1tHlEIIWsm_7i1gBdkBf7hxyWZlPWFg9l", "yamunotri_temple_and_ashram.jpg"),
    ("1a9Zrn-JE6Ani5x6DdgikQ5fMU7EWpi3a", "yamunotri_temple_under_the_glacier.jpg"),
]

target_dir = r'public/images/badrinath-tour-16-days'
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
        return f'/images/badrinath-tour-16-days/{sanitized}'
    except Exception as e:
        print(f'Failed {filename}: {e}')
        return None

with ThreadPoolExecutor(max_workers=8) as executor:
    results = executor.map(download_file, files_data)

new_images = [r for r in results if r]
print(f'Successfully downloaded {len(new_images)} images for Badrinath tour.')

# Update src/data/packages.ts
pkg_file = r'src/data/packages.ts'
with open(pkg_file, 'r', encoding='utf-8') as f:
    content = f.read()

pkg_id = 'badrinath-tour-16-days'
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
            print('Successfully updated packages.ts for badrinath-tour-16-days!')
        else:
            print('Error: Could not find end of images array')
    else:
        print('Error: Could not find images array start')
else:
    print('Error: Could not find badrinath-tour-16-days package')
