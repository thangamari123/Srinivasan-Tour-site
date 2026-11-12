# Admin Panel — Setup & Deployment

The admin panel lives at **`/admin`** in the same React app. Content is stored in
**Firebase Firestore**, images in **Cloudflare R2** (uploaded through a Cloudflare
Worker), and the public website reads Firestore in realtime.

There is **no demo or mock fallback**. If the Firebase environment variables are
missing, `/admin` shows a configuration error and the public site shows a
configuration error instead of package data. `src/data/packages.ts` is used only by
the one-time **Import existing website content** tool.

```
Browser (admin) ──Firebase ID token──► Cloudflare Worker ──R2 binding──► R2 bucket
      │                                      │
      │                                      └─ verifies token + admins/{uid} role
      └──── Firestore (content, image URLs, rules-enforced) ◄──── Public website (realtime)
```

---

## 1. Firebase

1. Create a project at <https://console.firebase.google.com>.
2. **Firestore Database → Create database** (production mode).
3. **Authentication → Get started → Email/Password → Enable.**
4. **Authentication → Settings → User actions → untick “Enable create (sign-up)”.**
   This stops anyone from creating accounts from the browser. (Even if someone did,
   they would have no `admins` document and could not access anything.)
5. **Project settings → General → Your apps → Add web app.** Copy the config values.
6. Copy `.env.example` to `.env` and fill in the `VITE_FIREBASE_*` values.
7. Deploy the security rules:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase use --add            # pick your project
   firebase deploy --only firestore:rules,firestore:indexes
   ```

### Create the first admin

There is no public registration. Create the first admin by hand:

1. **Authentication → Users → Add user** (email + strong password). Copy the **User UID**.
2. **Firestore → Start collection** `admins` → Document ID = *that UID* → fields:

   | field    | type    | value                 |
   |----------|---------|-----------------------|
   | `email`  | string  | the admin’s email     |
   | `name`   | string  | display name          |
   | `role`   | string  | `admin`               |
   | `active` | boolean | `true`                |

Further admins/editors can then be added from **Admin → Settings → Admin users**
(create the login in Firebase Authentication first, then paste its UID).

| Role     | Can do |
|----------|--------|
| `admin`  | Everything: create, edit, delete, publish, delete images, manage users, import |
| `editor` | Create & edit content, publish/unpublish, upload images. Cannot delete or manage settings |

Roles are enforced by `firestore.rules` and by the Worker — not by the UI.

**How admin authorization is verified (server-side):** the `admins/{uid}` document is
the source of truth. Firestore rules only let an existing `admin` create or change
admin documents, so nobody can grant themselves access, and an admin cannot demote or
deactivate themselves. Every Firestore write is checked against that document by the
rules, and the Worker reads the same document through the Firestore REST API (using
the caller's verified ID token) before every upload/delete. Deactivating a user takes
effect in the admin UI immediately and in the Worker within 60 seconds (role cache).
This avoids needing a service account or Cloud Functions to manage custom claims.

---

## 2. Cloudflare R2 + Worker

The R2 bucket **`srinivasa-tour-media`** already exists (Public Access: Disabled) and is
bound in `worker/wrangler.toml`.

```bash
cd worker
npm install
npx wrangler login
```

Edit `worker/wrangler.toml`:

- `FIREBASE_PROJECT_ID` — your Firebase project id
- `ALLOWED_ORIGINS` — your site origin(s), e.g. `https://srinivasatours.com,http://localhost:5173`
- `PUBLIC_BASE_URL` — *optional*. If you connect a custom domain (R2 → bucket →
  Settings → Custom Domains, e.g. `https://media.srinivasatours.com`), put it here and
  images are served straight from R2’s CDN. Leave empty to serve images through the
  Worker at `/api/images/<key>` (cached at the edge).

Deploy:

```bash
npx wrangler deploy
```

Put the Worker URL (e.g. `https://srinivasa-media-api.<you>.workers.dev`) in
`VITE_MEDIA_API_URL` in `.env`.

**No R2 access keys are needed at all** — the Worker uses an R2 *binding*. Never put
R2 keys in the frontend or in `.env`.

What the Worker enforces:
- Verifies the Firebase ID token (RS256 signature, issuer, audience, expiry).
- Checks `admins/{uid}` is active with role `admin`/`editor` (upload) or `admin` (delete).
- Accepts only JPG/PNG/WebP/GIF/AVIF, checked by file signature, max 10 MB.
- Generates unique keys (`packages/2026/11/<uuid>.webp`); clients cannot choose keys.

---

## 3. Import the existing website content (once)

```bash
npm run dev
```

Open <http://localhost:5173/admin>, sign in, go to **Settings → Import existing website
content → Import**. This copies all current packages, the 3 categories, testimonials
and homepage text into Firestore. It never overwrites anything, so running it twice is
safe. Existing package photos keep being served from `/public/images`.

> Do this **before** deploying the site with Firebase env variables — once Firebase is
> configured, the public site shows only what is in Firestore.

---

## 4. Deploy the website (Vercel)

Add the same `VITE_FIREBASE_*` and `VITE_MEDIA_API_URL` variables under
**Vercel → Project → Settings → Environment Variables**, then redeploy. Add your
production domain to `ALLOWED_ORIGINS` in the Worker and to
**Firebase → Authentication → Settings → Authorized domains**.

After this, content changes made in the admin panel appear on the live site within
seconds — no rebuild or redeploy needed.

---

## Data model (Firestore)

| Collection      | Doc id            | Notes |
|-----------------|-------------------|-------|
| `admins`        | Firebase Auth UID | `email, name, role, active` — never publicly readable |
| `tourPackages`  | auto              | title, slug, slugHistory, descriptions, categoryId, destinationId, durationDays/Nights, price, discountPrice, priceNote, startingLocation, highlights[], itinerary[], inclusions[], exclusions[], importantInfo, featured, status, featuredImage, gallery[], sortOrder, mediaRefs[] |
| `categories`    | auto              | name, slug, description, image, tagColor, status, sortOrder |
| `destinations`  | auto              | name, slug, description, image, country, state, status |
| `testimonials`  | auto              | name, location, tour, text, rating, color, status, sortOrder |
| `homepage`      | `hero`, `featured`, `destinations`, `banners`, `about`, `testimonials`, `cta` | one document per section |
| `media`         | auto              | url, key, fileName, contentType, size, uploadedAt, width, height, folder, uploadedBy |
| `activityLogs`  | auto              | append-only audit trail |
| `settings`      | `public` / other  | `public` is readable by the site; others are staff-only |

Every content document has `createdAt`, `updatedAt` and `status` (`active`/`inactive`).
Images are stored as `{ url, key, mediaId }` references — never as binary data.

`mediaRefs` lists the R2 image URLs a document uses. The Media Library checks it
before deleting, so an image that is still used by a package, destination, category
or homepage section cannot be deleted.

Changing a package slug keeps the old slug in `slugHistory`, and old links redirect to
the new URL automatically.
