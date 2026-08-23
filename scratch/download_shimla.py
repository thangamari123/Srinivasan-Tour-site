import os, urllib.request, re, shutil
from concurrent.futures import ThreadPoolExecutor

files_data = [
    ("13j8Gxzt6ohlJLodqY0whwyxzLT61zeiF", "011dd0c6-5b6c-4455-9230-fda8fd77d13f.jpg"),
    ("12tmwBD-mXV5CTxRrcQERWooDrhfl9l1b", "1c3b8118-1b2a-42ad-bd02-cc6f89bd9842.jpg"),
    ("1We_3vZjj-i5d3InEQVIDibDqrdObTVWH", "4dfe427e-2dc7-48d6-be6a-6b9dbefc4bfc.jpg"),
    ("1_-DcOucxfwQtbkmHt8SWByZ60rEHuyRO", "6a179d67-3ec2-4786-98a2-35c46004d54f.jpg"),
    ("13tC15oNr5t8nwgeu0vSFnqmXtJMmZxJW", "6bd7bd34-fb71-41de-a133-e9c52e7f5795.jpg"),
    ("13Cozt9YRhEqfY2DdjRkkH_juJjH4zScJ", "8dab54ec-9370-466b-b3ce-8082b9e0f1c7.jpg"),
    ("13LsMFavXazbKl7q7nXz_zAxyFpGdmUPP", "94c6989f-eb81-414e-8a14-02be86a91f18.jpg"),
    ("18SpMMl5SiJv0o0D0FQ1KCdu2Dc8lV-zR", "a8373774-e2c3-4f00-aecc-c6a60eda34b8.jpg"),
    ("12FZhT_Lqpx77wSLK_mjXEW_ERP346Gdo", "a880e1fd-0ef4-4e07-9572-402b15e629bf.jpg"),
    ("1EcythPFJiul0YiAs1ToZL32oOnsd97mD", "c7cdcc67-74eb-4f19-a4e6-f6d9291126cd.jpg"),
    ("1gooylFryadZe0LT4Hn65nMKZmh4Zec69", "c7d00115-5251-4ff2-87c0-e3c9dab95722.jpg"),
    ("1HB6a98q1oBdznVfiOg1bDKOs51bPQv-D", "c9b8f9e9-ce36-4249-b149-3383e7b83b77.jpg"),
    ("1wBOHtdqD2k-L4dxeaN237nc2BpmTzjmB", "f2fd52f4-bdfb-4c50-b59b-a90c78009ab5.jpg"),
    ("1jTMV-Q58jRrxwp8iGJsUgTOOipU8qzt_", "shimla-tour-14-days (1).jpg"),
    ("1rEAv0-4WtE3dIZVXhANI59ccwLc8CL2x", "shimla-tour-14-days (10).jpg"),
    ("1wZ_prvwhXvTmME-ym21YicOkiRmX2sb3", "shimla-tour-14-days (11).jpg"),
    ("1HqbloTFMC-NyV4Pgq1UxJscPAiDSowis", "shimla-tour-14-days (12).jpg"),
    ("16GEK9SJswDFeP5KLjrS5IrQHouZfCLUr", "shimla-tour-14-days (13).jpg"),
    ("1Gf4m1mI07YowtxsU89rk-VjcJ2asJH2L", "shimla-tour-14-days (14).jpg"),
    ("1jXVdWr8QC-CaFVaZuDmgFc6aLLrfGOCc", "shimla-tour-14-days (15).jpg"),
    ("1BU8Oc_WWVsvIJjVs06dyc3wcNruRnsBc", "shimla-tour-14-days (16).jpg"),
    ("1ZSn3vJyEO0jwesTXs7qCspB8gyUdnKxO", "shimla-tour-14-days (17).jpg"),
    ("1baW5DIymxGu5gLVVhZ-tlXwQ4jmyyFTV", "shimla-tour-14-days (18).jpg"),
    ("1-MSH1wC7LjJmrKjD_YrR7ViV2M71R5Nf", "shimla-tour-14-days (19).jpg"),
    ("1b-tmcBYkKaNvNYEtWSL3WAqFZ98Xp02r", "shimla-tour-14-days (2).jpg"),
    ("1EgsmO9DKihTPSA8YeKAPfhZJVWwGibKk", "shimla-tour-14-days (20).jpg"),
    ("13_qJ1FupguoYoXu2PRDPNw8QAeCxT5-M", "shimla-tour-14-days (21).jpg"),
    ("1sRp78Exny0Y7ZwxDmELWk70chuTyiUHC", "shimla-tour-14-days (22).jpg"),
    ("1VV3zw9MFVgOpYmsl7jvoN1m4aF1s2RPP", "shimla-tour-14-days (24).jpg"),
    ("15ka8q1mx6wbAITiKPqfrGtix92-Lwjx0", "shimla-tour-14-days (25).jpg"),
    ("1_1OB1Eab1GYv-2EOlkklgc453PckM3OT", "shimla-tour-14-days (26).jpg"),
    ("1TGuzCRa6qqtpP06WTYRNuGAsZQ2ecPBD", "shimla-tour-14-days (3).jpg"),
    ("14b4_IZ-I06WXOqhwWcQT3HdAUIJbtbSy", "shimla-tour-14-days (4).jpg"),
    ("1rs_uSvrJja3PF-gCbb-tgOBjX3jkwGlc", "shimla-tour-14-days (5).jpg"),
    ("1694rSW9-H4ahupBKKb0OejMGSS8H8juO", "shimla-tour-14-days (6).jpg"),
    ("1gXMcQ7QQjDJmq_UT4LhnAUxPXjOdDA_N", "shimla-tour-14-days (7).jpg"),
    ("1boJJIyPIGS9adQG_H86p3vioL2bxHDWC", "shimla-tour-14-days (8).jpg"),
    ("1Wt0IF-MVdyj0Qw03Q86mp7m5-Mpyu4db", "shimla-tour-14-days (9).jpg"),
]

target_dir = r'public/images/shimla-tour-14-days'
os.makedirs(target_dir, exist_ok=True)

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
new_images = []

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
        return f'/images/shimla-tour-14-days/{sanitized}'
    except Exception as e:
        print(f'Failed {filename}: {e}')
        return None

with ThreadPoolExecutor(max_workers=8) as executor:
    results = executor.map(download_file, files_data)

new_images = [r for r in results if r]
print(f'Successfully downloaded {len(new_images)} images for Shimla tour.')

# Update src/data/packages.ts
pkg_file = r'src/data/packages.ts'
with open(pkg_file, 'r', encoding='utf-8') as f:
    content = f.read()

pkg_id = 'shimla-tour-14-days'
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
            print('Successfully updated packages.ts for shimla-tour-14-days!')
        else:
            print('Error: Could not find end of images array')
    else:
        print('Error: Could not find images array start')
else:
    print('Error: Could not find shimla-tour-14-days package')
