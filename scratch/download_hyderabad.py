import os, urllib.request, re, shutil
from concurrent.futures import ThreadPoolExecutor

files_data = [
    ("1wSe1z9P_QkxYQPN4g6q6LHDvdzpRmeYL", "hyderabad-tour-5-days (1).jpg"),
    ("1xmAX9Egy_Gnrog7bJ9-k0WG8GsDS-hQ5", "hyderabad-tour-5-days (10).jpg"),
    ("1Yp-WdEsuFnCfsbdurUwyS5ZGTxPqqxpd", "hyderabad-tour-5-days (11).jpg"),
    ("1UxKSsm552zcy2IEuJBAvmIlGXLC72Sjj", "hyderabad-tour-5-days (12).jpg"),
    ("1zqRhV_7H_sIs4elsVt4o_9J-giX8N1i1", "hyderabad-tour-5-days (13).jpg"),
    ("1ZDIFECRn0b61NPMFz8C5QZ6x0nbUEeYv", "hyderabad-tour-5-days (14).jpg"),
    ("12xg34I6AnGw0tZnCE-3vl7l8b6Ig9sIC", "hyderabad-tour-5-days (15).jpg"),
    ("1aGqsSUIQuK321pD8x7d1wqne_oJBd03C", "hyderabad-tour-5-days (16).jpg"),
    ("1bGhsKIIdmLUBiRDtDYGCIAfBMHmGf79H", "hyderabad-tour-5-days (17).jpg"),
    ("1u746iu_BiEDLlUmpBKDy_jjbtBXuJ7x6", "hyderabad-tour-5-days (18).jpg"),
    ("1WLTDi_tf3wM8ideWXhBeulyvHWh91l5I", "hyderabad-tour-5-days (19).jpg"),
    ("178IAbsJhwd0cQJBCizJBEGvrO9kvoEwa", "hyderabad-tour-5-days (2).jpg"),
    ("1Z7SdlBFsaov5ZtXBgj588aaSl8-I7cew", "hyderabad-tour-5-days (20).jpg"),
    ("1AX_0FSBduxTQszoWU0nYh4CjiKmxHtjD", "hyderabad-tour-5-days (3).jpg"),
    ("1wCqzad3Ao90yhMEMbxC0itPNUZw3JBZY", "hyderabad-tour-5-days (4).jpg"),
    ("1Rao4IZhySzVuZ0xEdRSDvMSISjKcLhKX", "hyderabad-tour-5-days (5).jpg"),
    ("16W5gnpH0aD1BHIRthJXZeYsxiSdF-Zlq", "hyderabad-tour-5-days (6).jpg"),
    ("1mpVsB2GK5QQBCYtieVhk68o18j1I1208", "hyderabad-tour-5-days (7).jpg"),
    ("1cUVeC2ISuvf8ATIb7gp4CkW7ciRlQAN6", "hyderabad-tour-5-days (8).jpg"),
    ("1o30mh2kxTUDW20J9TmhHAQPwf-Cs67UT", "hyderabad-tour-5-days (9).jpg"),
]

target_dir = r'public/images/hyderabad-tour-5-days'
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
        return f'/images/hyderabad-tour-5-days/{sanitized}'
    except Exception as e:
        print(f'Failed {filename}: {e}')
        return None

with ThreadPoolExecutor(max_workers=8) as executor:
    results = executor.map(download_file, files_data)

new_images = [r for r in results if r]
print(f'Successfully downloaded {len(new_images)} images for Hyderabad tour.')

# Update src/data/packages.ts
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
            images_formatted = 'images: [\n' + ',\n'.join([f'      "{img}"' for img in sorted(new_images)]) + '\n    ]'
            content = content[:img_start] + images_formatted + content[img_end+1:]
            with open(pkg_file, 'w', encoding='utf-8') as f:
                f.write(content)
            print('Successfully updated packages.ts for hyderabad-tour-5-days!')
        else:
            print('Error: Could not find end of images array')
    else:
        print('Error: Could not find images array start')
else:
    print('Error: Could not find hyderabad-tour-5-days package')
