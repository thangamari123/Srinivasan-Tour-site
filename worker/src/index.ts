/**
 * Srinivasa Tours — Media API (Cloudflare Worker + R2)
 *
 *   POST   /api/upload        multipart/form-data { file, folder }   → { key, url, size, contentType }
 *   DELETE /api/delete        application/json    { key }            → { ok: true }
 *   GET    /api/images/:key   public image delivery (cached)
 *
 * Security model
 *  - R2 is accessed only through the `MEDIA_BUCKET` binding: no access keys exist anywhere.
 *  - Every write requires `Authorization: Bearer <Firebase ID token>`. The token's RS256
 *    signature, issuer, audience and expiry are verified here with Google's public keys.
 *  - The caller must have an active document in Firestore `admins/{uid}`. This is read
 *    through the Firestore REST API *with the caller's own token*, so Firestore security
 *    rules apply and no service-account secret is needed.
 *  - Uploads are restricted to image MIME types, validated by magic bytes, and size-limited.
 *  - Object keys are generated server-side (UUID) — clients cannot choose or overwrite keys.
 *  - Deletion requires the "admin" role (editors may upload but not delete).
 */

export interface Env {
  MEDIA_BUCKET: R2Bucket;
  /** Firebase project id, e.g. "srinivasa-tours" */
  FIREBASE_PROJECT_ID: string;
  /** Comma separated list of allowed browser origins, e.g. "https://example.com,http://localhost:5173" */
  ALLOWED_ORIGINS: string;
  /** Optional public base URL of the bucket (custom domain / r2.dev). If empty, images are served by this Worker. */
  PUBLIC_BASE_URL?: string;
  /** Optional override, in bytes. Default 10 MB. */
  MAX_UPLOAD_BYTES?: string;
}

const DEFAULT_MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_FOLDERS = ['packages', 'destinations', 'categories', 'homepage', 'testimonials', 'general'];
const MIME_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
};
const KEY_PATTERN = /^(packages|destinations|categories|homepage|testimonials|general)\/\d{4}\/\d{2}\/[a-f0-9-]{36}\.(jpg|png|webp|gif|avif)$/;
const MIGRATED_KEY_PATTERN = /^(?:website\/(?:logo|homepage|destinations|gallery|other)|packages\/(?:featured|gallery))\/[a-z0-9][a-z0-9/_-]{1,180}\.(jpg|png|webp|gif|avif)$/;

function isValidKey(key: string): boolean {
  if (!key || key.includes('..') || key.includes('//')) return false;
  return KEY_PATTERN.test(key) || MIGRATED_KEY_PATTERN.test(key);
}

// ─── HTTP helpers ────────────────────────────────────────────────────────────

class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function corsHeaders(request: Request, env: Env): Record<string, string> {
  const origin = request.headers.get('Origin') || '';
  const allowed = (env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
  if (origin && allowed.includes(origin)) headers['Access-Control-Allow-Origin'] = origin;
  return headers;
}

function json(body: unknown, status: number, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...extra },
  });
}

// ─── Firebase ID token verification ─────────────────────────────────────────

const JWKS_URL = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';
let jwksCache: { keys: Map<string, CryptoKey>; expires: number } | null = null;

async function getSigningKey(kid: string): Promise<CryptoKey> {
  const now = Date.now();
  if (!jwksCache || jwksCache.expires < now || !jwksCache.keys.has(kid)) {
    const res = await fetch(JWKS_URL);
    if (!res.ok) throw new HttpError(503, 'Unable to fetch token signing keys');
    const maxAge = Number(/max-age=(\d+)/.exec(res.headers.get('Cache-Control') || '')?.[1] || 3600);
    const { keys } = (await res.json()) as { keys: (JsonWebKey & { kid: string })[] };
    const map = new Map<string, CryptoKey>();
    for (const jwk of keys) {
      map.set(
        jwk.kid,
        await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']),
      );
    }
    jwksCache = { keys: map, expires: now + maxAge * 1000 };
  }
  const key = jwksCache.keys.get(kid);
  if (!key) throw new HttpError(401, 'Unknown token key');
  return key;
}

function b64urlDecode(input: string): Uint8Array {
  const pad = input.length % 4 === 0 ? '' : '='.repeat(4 - (input.length % 4));
  const bin = atob(input.replace(/-/g, '+').replace(/_/g, '/') + pad);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

interface FirebaseClaims {
  sub: string;
  aud: string;
  iss: string;
  exp: number;
  iat: number;
  auth_time: number;
  email?: string;
}

async function verifyIdToken(token: string, projectId: string): Promise<FirebaseClaims> {
  const parts = token.split('.');
  if (parts.length !== 3) throw new HttpError(401, 'Malformed token');
  const [h, p, s] = parts;

  let header: { alg: string; kid: string };
  let claims: FirebaseClaims;
  try {
    header = JSON.parse(new TextDecoder().decode(b64urlDecode(h)));
    claims = JSON.parse(new TextDecoder().decode(b64urlDecode(p)));
  } catch {
    throw new HttpError(401, 'Malformed token');
  }
  if (header.alg !== 'RS256' || !header.kid) throw new HttpError(401, 'Invalid token algorithm');

  const key = await getSigningKey(header.kid);
  const valid = await crypto.subtle.verify(
    'RSASSA-PKCS1-v1_5',
    key,
    b64urlDecode(s),
    new TextEncoder().encode(`${h}.${p}`),
  );
  if (!valid) throw new HttpError(401, 'Invalid token signature');

  const now = Math.floor(Date.now() / 1000);
  const skew = 60;
  if (claims.aud !== projectId) throw new HttpError(401, 'Invalid token audience');
  if (claims.iss !== `https://securetoken.google.com/${projectId}`) throw new HttpError(401, 'Invalid token issuer');
  if (typeof claims.exp !== 'number' || claims.exp < now - skew) throw new HttpError(401, 'Token expired');
  if (typeof claims.iat !== 'number' || claims.iat > now + skew) throw new HttpError(401, 'Token issued in the future');
  if (typeof claims.auth_time !== 'number' || claims.auth_time > now + skew) throw new HttpError(401, 'Invalid auth time');
  if (!claims.sub || typeof claims.sub !== 'string') throw new HttpError(401, 'Invalid token subject');
  return claims;
}

// ─── Admin role check (Firestore REST, evaluated under security rules) ──────

type Role = 'admin' | 'editor';
const roleCache = new Map<string, { role: Role | null; expires: number }>();

async function getAdminRole(uid: string, idToken: string, projectId: string): Promise<Role | null> {
  const cached = roleCache.get(uid);
  if (cached && cached.expires > Date.now()) return cached.role;

  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/admins/${encodeURIComponent(uid)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${idToken}` } });
  let role: Role | null = null;
  if (res.ok) {
    const doc = (await res.json()) as {
      fields?: { active?: { booleanValue?: boolean }; role?: { stringValue?: string } };
    };
    const active = doc.fields?.active?.booleanValue === true;
    const r = doc.fields?.role?.stringValue;
    if (active && (r === 'admin' || r === 'editor')) role = r;
  } else if (res.status !== 404 && res.status !== 403) {
    throw new HttpError(503, 'Unable to verify admin access');
  }
  // Short cache: role changes take effect within a minute.
  roleCache.set(uid, { role, expires: Date.now() + 60_000 });
  return role;
}

async function requireRole(request: Request, env: Env, allowed: Role[]): Promise<FirebaseClaims> {
  const auth = request.headers.get('Authorization') || '';
  const match = /^Bearer\s+(.+)$/i.exec(auth);
  if (!match) throw new HttpError(401, 'Missing bearer token');
  const token = match[1].trim();
  const claims = await verifyIdToken(token, env.FIREBASE_PROJECT_ID);
  const role = await getAdminRole(claims.sub, token, env.FIREBASE_PROJECT_ID);
  if (!role || !allowed.includes(role)) throw new HttpError(403, 'You do not have permission to perform this action');
  return claims;
}

// ─── File validation ────────────────────────────────────────────────────────

function sniffImageType(bytes: Uint8Array): string | null {
  const b = bytes;
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg';
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return 'image/png';
  if (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38) return 'image/gif';
  const ascii = (from: number, to: number) => String.fromCharCode(...b.slice(from, to));
  if (ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP') return 'image/webp';
  if (ascii(4, 8) === 'ftyp' && ['avif', 'avis'].includes(ascii(8, 12))) return 'image/avif';
  return null;
}

function publicUrl(env: Env, request: Request, key: string): string {
  const base = (env.PUBLIC_BASE_URL || '').replace(/\/+$/, '');
  if (base) return `${base}/${key}`;
  return `${new URL(request.url).origin}/api/images/${key}`;
}

// ─── Handlers ───────────────────────────────────────────────────────────────

async function handleUpload(request: Request, env: Env): Promise<Response> {
  const claims = await requireRole(request, env, ['admin', 'editor']);
  const maxBytes = Number(env.MAX_UPLOAD_BYTES) || DEFAULT_MAX_BYTES;

  const contentLength = Number(request.headers.get('Content-Length') || 0);
  if (contentLength > maxBytes + 64 * 1024) throw new HttpError(413, 'File is too large');

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    throw new HttpError(400, 'Expected multipart/form-data');
  }
  const file = form.get('file');
  const folderInput = String(form.get('folder') || 'general');
  const folder = ALLOWED_FOLDERS.includes(folderInput) ? folderInput : 'general';

  if (!file || typeof file === 'string') throw new HttpError(400, 'No file provided');
  if (file.size === 0) throw new HttpError(400, 'File is empty');
  if (file.size > maxBytes) throw new HttpError(413, `File exceeds ${Math.round(maxBytes / 1024 / 1024)} MB`);

  const buffer = await file.arrayBuffer();
  const sniffed = sniffImageType(new Uint8Array(buffer.slice(0, 16)));
  if (!sniffed || !MIME_EXT[sniffed]) throw new HttpError(415, 'Only JPG, PNG, WebP, GIF and AVIF images are allowed');
  if (file.type && file.type !== sniffed) throw new HttpError(415, 'File content does not match its declared type');

  const now = new Date();
  const key = `${folder}/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, '0')}/${crypto.randomUUID()}.${MIME_EXT[sniffed]}`;

  await env.MEDIA_BUCKET.put(key, buffer, {
    httpMetadata: { contentType: sniffed, cacheControl: 'public, max-age=31536000, immutable' },
    customMetadata: { uploadedBy: claims.sub, originalName: file.name.slice(0, 200) },
  });

  return json({ key, url: publicUrl(env, request, key), size: buffer.byteLength, contentType: sniffed }, 201);
}

async function handleDelete(request: Request, env: Env): Promise<Response> {
  await requireRole(request, env, ['admin']);
  let body: { key?: unknown };
  try {
    body = await request.json();
  } catch {
    throw new HttpError(400, 'Expected JSON body');
  }
  const key = typeof body.key === 'string' ? body.key : '';
  if (!isValidKey(key)) throw new HttpError(400, 'Invalid object key');
  await env.MEDIA_BUCKET.delete(key);
  return json({ ok: true }, 200);
}

function buildImageHeaders(object: R2Object): Headers {
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('ETag', object.httpEtag);
  headers.set('Content-Length', String(object.size));
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Access-Control-Allow-Origin', '*');
  return headers;
}

async function handleGetImage(request: Request, env: Env, key: string): Promise<Response> {
  if (!isValidKey(key)) return new Response('Not found', { status: 404 });

  const cache = caches.default;
  const cacheKey = new Request(request.url, { method: 'GET' });
  const cached = await cache.match(cacheKey);
  if (cached) {
    if (request.method === 'HEAD') {
      return new Response(null, { status: cached.status, headers: cached.headers });
    }
    return cached;
  }

  if (request.method === 'HEAD') {
    const headObject = await env.MEDIA_BUCKET.head(key);
    if (!headObject) return new Response('Not found', { status: 404 });
    return new Response(null, { status: 200, headers: buildImageHeaders(headObject) });
  }

  const object = await env.MEDIA_BUCKET.get(key);
  if (!object) return new Response('Not found', { status: 404 });

  const headers = buildImageHeaders(object);
  const response = new Response(object.body, { headers });
  await cache.put(cacheKey, response.clone());
  return response;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    void ctx;
    const url = new URL(request.url);
    const cors = corsHeaders(request, env);

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });

    try {
      if (url.pathname === '/api/upload' && request.method === 'POST') {
        const res = await handleUpload(request, env);
        Object.entries(cors).forEach(([k, v]) => res.headers.set(k, v));
        return res;
      }
      if (url.pathname === '/api/delete' && request.method === 'DELETE') {
        const res = await handleDelete(request, env);
        Object.entries(cors).forEach(([k, v]) => res.headers.set(k, v));
        return res;
      }
      if (url.pathname.startsWith('/api/images/') && (request.method === 'GET' || request.method === 'HEAD')) {
        return await handleGetImage(request, env, decodeURIComponent(url.pathname.slice('/api/images/'.length)));
      }
      if (url.pathname === '/api/health') return json({ ok: true }, 200, cors);
      return json({ error: 'Not found' }, 404, cors);
    } catch (err) {
      if (err instanceof HttpError) return json({ error: err.message }, err.status, cors);
      console.error(err);
      return json({ error: 'Internal error' }, 500, cors);
    }
  },
};
