import os, urllib.request, re, shutil
from concurrent.futures import ThreadPoolExecutor

files_data = [
    ("17hQDL0WPgLxD73Zoerde7-J88SiTqm7r", "puri-bhubaneswar-tour-9-days (1).jpg"),
    ("1-pPAjUZ0tmnmswaPWpUnMDUxYIfChwU5", "puri-bhubaneswar-tour-9-days (2).jpg"),
    ("1oiRb9-Uyr1wwao-OxO9axoiL6WcutkPj", "puri-bhubaneswar-tour-9-days (3).jpg"),
    ("1jBiUc2xIxa3BgjP97OB5lEqWTccfm-AV", "puri-bhubaneswar-tour-9-days (4).jpg"),
    ("1U_D6upfEn9d5f9K4UptSgN7lMy6Hlihe", "puri-bhubaneswar-tour-9-days (5).jpg"),
    ("1tpDkSrsJxQIui-h9fFyJLXFYpmqNL06z", "puri-bhubaneswar-tour-9-days (6).jpg"),
    ("1o6snuZ8_OquR8fhWAyWQtu7xx2_UPh7n", "puri-bhubaneswar-tour-9-days (7).jpg"),
    ("1rLor3lSYynQ-gMzZwRPQc1lHsbi9aTNb", "puri-bhubaneswar-tour-9-days (8).jpg"),
    ("1TihK4t95y1981n6JHE0LJMDSDUbYXY8W", "puri-bhubaneswar-tour-9-days (9).jpg"),
    ("1Wz2yo6rGOJX8IaBOp5mRDVkRgzboGefj", "puri-bhubaneswar-tour-9-days (10).jpg"),
    ("1-P0SqHumbbXBG5zEy_6PhfSpQlZcUEc2", "puri-bhubaneswar-tour-9-days (11).jpg"),
    ("1wuMwrZ5YrfuPShEqz98zRKGjLFGtuxKI", "puri-bhubaneswar-tour-9-days (12).jpg"),
    ("1fpDUTKO7b60Xz_a20R7EZ2N_Jyc3w4Gq", "puri-bhubaneswar-tour-9-days (13).jpg"),
    ("1G4ojKFkBK_9mxlxrL1nawbTETxQbh7WC", "puri-bhubaneswar-tour-9-days (15).jpg"),
    ("1TY2XnMkRMGAW0KTpaAL07_13H9bqaDF8", "puri-bhubaneswar-tour-9-days (16).jpg"),
    ("142xAj5lR56ePzTHrt66-HJVuDirJZx5u", "puri-bhubaneswar-tour-9-days (17).jpg"),
    ("16PeF5SrYdPt8ZgPY3w56cJuIoUyay5pb", "puri-bhubaneswar-tour-9-days (18).jpg"),
    ("13dWrgedCcXBIuWMp-1HJKN8C5Sj_fJkF", "puri-bhubaneswar-tour-9-days (19).jpg"),
    ("1pUalAfYGpoZwh1opAhUHELnxz7utBIZN", "puri-bhubaneswar-tour-9-days (20).jpg"),
    ("1-UCnAfQiuV0OgshbSYpEnbZkZ-jgNkzO", "puri-bhubaneswar-tour-9-days (21).jpg"),
    ("1J_FXjpDLIFcdl6hho6aPF4iVdGB9ArKm", "puri-bhubaneswar-tour-9-days (22).jpg"),
    ("15yamuG24D_d89-K3zlWAa2w4gtYskgL3", "puri-bhubaneswar-tour-9-days (23).jpg"),
    ("1J305uSX2_9oKDmxHHK__wZBywSOR_33j", "puri-bhubaneswar-tour-9-days (24).jpg"),
]

target_dir = r'public/images/puri-bhubaneswar-tour-9-days'
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
        return f'/images/puri-bhubaneswar-tour-9-days/{sanitized}'
    except Exception as e:
        print(f'Failed {filename}: {e}')
        return None

with ThreadPoolExecutor(max_workers=8) as executor:
    results = executor.map(download_file, files_data)

new_images = [r for r in results if r]
print(f'Successfully downloaded {len(new_images)} images for Puri tour.')

# Update src/data/packages.ts
pkg_file = r'src/data/packages.ts'
with open(pkg_file, 'r', encoding='utf-8') as f:
    content = f.read()

pkg_id = 'puri-bhubaneswar-tour-9-days'
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
            print('Successfully updated packages.ts for puri-bhubaneswar-tour-9-days!')
        else:
            print('Error: Could not find end of images array')
    else:
        print('Error: Could not find images array start')
else:
    print('Error: Could not find puri-bhubaneswar-tour-9-days package')
