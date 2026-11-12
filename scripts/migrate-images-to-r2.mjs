/**
 * Idempotent migration script: uploads all referenced local images to Cloudflare R2
 * (`srinivasa-tour-media`) via Wrangler CLI and verifies every uploaded URL through
 * the live Worker (`https://srinivasa-media-api.srinivasatour23.workers.dev`).
 *
 * Rules:
 * - Never deletes or modifies original local files.
 * - Checks HEAD on the Worker first; skips if the object already exists with matching byte length.
 * - Retries transient upload failures safely.
 * - Writes `src/data/r2MigrationMap.json` and a detailed report.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const root = process.cwd();
const BUCKET = 'srinivasa-tour-media';
const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || 'f0c7c9f714aef338c7145d8b97a8640a';
const MANIFEST_PATH = process.argv[2] ? path.resolve(process.argv[2]) : '';
const REPORT_PATH = process.argv[3] ? path.resolve(process.argv[3]) : '';
const MAP_PATH = path.join(root, 'src', 'data', 'r2MigrationMap.json');
const CONCURRENCY = Number(process.env.R2_CONCURRENCY || 6);

const KEY_REGEX = /^(?:website\/(?:logo|homepage|destinations|gallery|other)|packages\/(?:featured|gallery))\/[a-z0-9][a-z0-9/_-]{1,180}\.(jpg|png|webp|gif|avif)$/;

function runWranglerPut(item) {
  return new Promise((resolve, reject) => {
    const wranglerJs = path.join(root, 'worker', 'node_modules', 'wrangler', 'bin', 'wrangler.js');
    const args = [
      wranglerJs,
      'r2',
      'object',
      'put',
      `${BUCKET}/${item.key}`,
      `--file=${item.diskRel}`,
      `--content-type=${item.contentType}`,
      '--cache-control=public, max-age=31536000, immutable',
      '--remote',
    ];
    const child = spawn(process.execPath, args, {
      cwd: root,
      shell: false,
      env: { ...process.env, CLOUDFLARE_ACCOUNT_ID: ACCOUNT_ID },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stderr = '';
    let stdout = '';
    child.stdout.on('data', (d) => (stdout += d.toString()));
    child.stderr.on('data', (d) => (stderr += d.toString()));
    child.on('close', (code) => {
      if (code === 0) resolve(stdout);
      else reject(new Error(`wrangler exit ${code}: ${stderr || stdout}`));
    });
  });
}

async function checkRemote(item) {
  const res = await fetch(item.url, { method: 'HEAD' });
  if (res.status === 200) {
    const len = Number(res.headers.get('content-length') || 0);
    if (len === item.size) return { exists: true, size: len };
  }
  return { exists: false };
}

async function migrateItem(item) {
  if (!KEY_REGEX.test(item.key)) {
    throw new Error(`Invalid key pattern: ${item.key}`);
  }
  const diskAbs = path.join(root, item.diskRel);
  if (!fs.existsSync(diskAbs)) {
    throw new Error(`Missing local source file: ${item.diskRel}`);
  }

  const pre = await checkRemote(item);
  if (pre.exists) {
    return { ...item, status: 'skipped_existing', verified: true };
  }

  let lastErr;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await runWranglerPut(item);
      const post = await checkRemote(item);
      if (!post.exists) {
        throw new Error(`Verification HEAD failed after upload for ${item.url}`);
      }
      return { ...item, status: 'uploaded', verified: true };
    } catch (err) {
      lastErr = err;
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }
  throw lastErr;
}

async function main() {
  if (!MANIFEST_PATH || !fs.existsSync(MANIFEST_PATH)) {
    console.error('Usage: node scripts/migrate-images-to-r2.mjs <manifest.json> [report.json]');
    process.exit(1);
  }
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  const results = new Array(manifest.length);
  let nextIdx = 0;
  let done = 0;
  let failed = 0;

  async function worker() {
    while (true) {
      const idx = nextIdx++;
      if (idx >= manifest.length) return;
      const item = manifest[idx];
      try {
        results[idx] = await migrateItem(item);
      } catch (err) {
        failed++;
        results[idx] = { ...item, status: 'failed', verified: false, error: err.message };
        console.error(`FAILED [${idx + 1}/${manifest.length}] ${item.localPath}:`, err.message);
      }
      done++;
      if (done % 25 === 0 || done === manifest.length) {
        console.log(`Progress: ${done}/${manifest.length} (failed: ${failed})`);
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));

  const mapObj = {};
  for (const r of results) {
    if (r.verified) {
      mapObj[r.localPath] = {
        key: r.key,
        url: r.url,
        contentType: r.contentType,
        size: r.size,
      };
    }
  }
  fs.writeFileSync(MAP_PATH, JSON.stringify(mapObj, null, 2) + '\n', 'utf8');
  if (REPORT_PATH) {
    fs.writeFileSync(REPORT_PATH, JSON.stringify(results, null, 2) + '\n', 'utf8');
  }
  console.log(`Done. Verified: ${Object.keys(mapObj).length}/${manifest.length}, Failed: ${failed}`);
  if (failed > 0) process.exit(1);
}

main();
