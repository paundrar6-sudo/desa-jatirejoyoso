# web — Desa Jatirejoyoso (Astro + Cloudflare)

Static-first Astro site with a small Cloudflare Worker API layer backed by D1.

## Stack

- Astro 7 (`output: 'static'`, adapter `@astrojs/cloudflare`)
- Cloudflare Workers + D1 (binding `DB`)
- Vanilla JS (`public/js`) untuk interaksi dan render konten
- Playwright untuk e2e test

## Perintah

```bash
npm install
npm run dev        # astro dev
npm run build      # astro build
npm run check      # astro check
npm run test:e2e   # playwright test (start wrangler dev otomatis)
```

## Setup lokal

1. Install dependency.

2. Buat file `.dev.vars` (tidak di-commit):

   ```env
   ADMIN_PASSWORD_HASH=pbkdf2_sha256$...
   SESSION_SECRET=...
   IP_HASH_SECRET=...
   ```

   Generate hash password:

   ```bash
   node scripts/hash-password.mjs <password>
   ```

3. Siapkan D1 lokal:

   ```bash
   npx wrangler d1 execute DB --local --file=./db/schema.sql
   npx wrangler d1 execute DB --local --file=./db/seed.sql
   ```

   Untuk menjalankan hasil build dengan `wrangler dev --config dist/server/wrangler.json`,
   gunakan `--config dist/server/wrangler.json` juga saat mengeksekusi schema/seed,
   karena state lokal D1 mengikuti path config.

4. Build dan jalankan Worker lokal:

   ```bash
   npm run build
   npx wrangler dev --config dist/server/wrangler.json --port 8787
   ```

## Admin

- Halaman: `/admin`
- Endpoint: `/api/admin/auth`, `/api/admin/content?type=articles|officials|events`
- Keamanan: lihat `docs/security.md`
- Backup/restore: lihat `docs/backup.md`

## Deploy (ringkas)

1. Buat D1 produksi dan set `database_id` di `wrangler.jsonc`.
2. `npx wrangler d1 execute desa-jatirejoyoso-db --remote --file=./db/schema.sql`
3. `npx wrangler d1 execute desa-jatirejoyoso-db --remote --file=./db/seed.sql`
4. Set secret (`ADMIN_PASSWORD_HASH`, `SESSION_SECRET`, `IP_HASH_SECRET`).
5. `npm run build`
6. `npx wrangler deploy`
