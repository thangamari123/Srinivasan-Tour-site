import os, urllib.request, re, shutil
from concurrent.futures import ThreadPoolExecutor

files_data = [
    ("1PrqzF6UXNwS959k5wfEtA9hsW3wqe0J6", "kashmir-tour-14-days-1.jpg"),
    ("1s_tTCUXeJSzM15WVsmNhSkvwth_GxlFv", "kashmir-tour-14-days-2.jpg"),
    ("14yx3KYrSYh506Tpxag5oSyHt0bNnDDYy", "kashmir-tour-14-days-3.jpg"),
    ("1w-wmRMYAh2y22RTVXrJx5AxLRjh0M0tH", "kashmir-tour-14-days-4.jpg"),
    ("1neFl0MDKeZgM5c_28TT2uBhegLNPLagF", "kashmir-tour-14-days-5.jpg"),
    ("1-eiK6tVauBQ0-GNCod_-cn5KsckqCtU0", "kashmir-tour-14-days-6.jpg"),
    ("1N5oedMIK5ZZO8owbMseIoIw11IuoWz38", "kashmir-tour-14-days-7.jpg"),
    ("10wYOBP7QQNrfS8QyTp7DZcuR50U6Fp8e", "kashmir-tour-14-days-8.jpg"),
    ("1aDsx2iovi04fLGff1WYk9tIanf3L06gY", "kashmir-tour-14-days-9.jpg"),
    ("1AcP4nSLaWGpwweYMhZuX5YGv_qi4EfC9", "kashmir-tour-14-days-10.jpg"),
    ("1KfmEiqgaYEbMXdl9UbH4hIBk60IYGFL5", "kashmir-tour-14-days-11.jpg"),
    ("1ejN9sKGt17HkdzRwwzEiJA6oNxEMzZmM", "kashmir-tour-14-days-12.jpg"),
    ("1xhLYXimSpLL8jCfYTS4tsGzD3K60R74W", "kashmir-tour-14-days-13.jpg"),
    ("1O0VkTVh865ewV6mdMRVJecrEYADaniAp", "kashmir-tour-14-days-14.jpg"),
    ("1NC88n1zYHmEwbj7ZuPtLU97mV3Rzptqe", "kashmir-tour-14-days-15.jpg"),
    ("19gWUhqQGFzcGuFLkY6wbGukxX5o_Cvjj", "kashmir-tour-14-days-16.jpg"),
    ("1ueqIUXNGYbEjtzr5OTUTh9t4C_BGquH1", "kashmir-tour-14-days-17.jpg"),
    ("1VMY4-iUrXfJ9NZ7Qyq62kYTabL3Dw2Fq", "kashmir-tour-14-days-18.jpg"),
]

target_dir = r'public/images/kashmir-tour-14-days'
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
        return f'/images/kashmir-tour-14-days/{sanitized}'
    except Exception as e:
        print(f'Failed {filename}: {e}')
        return None

with ThreadPoolExecutor(max_workers=8) as executor:
    results = executor.map(download_file, files_data)

new_images = [r for r in results if r]
print(f'Successfully downloaded {len(new_images)} images for Kashmir tour.')

# Update src/data/packages.ts
pkg_file = r'src/data/packages.ts'
with open(pkg_file, 'r', encoding='utf-8') as f:
    content = f.read()

pkg_id = 'kashmir-tour-14-days'
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
            print('Successfully updated packages.ts for kashmir-tour-14-days!')
        else:
            print('Error: Could not find end of images array')
    else:
        print('Error: Could not find images array start')
else:
    print('Error: Could not find kashmir-tour-14-days package')
