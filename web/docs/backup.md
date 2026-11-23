# Backup & Restore Database

## Prinsip

- **D1 Time Travel** aktif otomatis untuk database produksi (Free plan: riwayat 7 hari).
- Time Travel **bukan pengganti export**. Export SQL tetap wajib dilakukan rutin dan sebelum perubahan besar.
- Semua perintah di bawah dijalankan dari folder `web/` dengan `wrangler` yang sudah login ke akun Cloudflare.

## Checklist Sebelum Perubahan Berisiko

Lakukan sebelum: migrasi skema, update konten massal, delete massal, atau deploy besar.

1. Export snapshot SQL:

   ```bash
   npx wrangler d1 export desa-jatirejoyoso-db --remote --output "backup/pre-change-$(date +%Y%m%d-%H%M).sql"
   ```

   Di PowerShell, ganti `$(date ...)` dengan format manual, contoh:

   ```powershell
   npx wrangler d1 export desa-jatirejoyoso-db --remote --output "backup/pre-change-20261124-0900.sql"
   ```

2. Catat bookmark Time Travel:

   ```bash
   npx wrangler d1 time-travel info desa-jatirejoyoso-db --json
   ```

   Simpan output (termasuk nilai `bookmark`) di catatan change/go-live.

3. Verifikasi status database:

   ```bash
   npx wrangler d1 info desa-jatirejoyoso-db --json
   ```

4. Pastikan `version: production` pada output (Time Travel hanya aktif untuk versi produksi).

## Export Rutin

- Minimal 1x per bulan.
- Simpan file di folder `web/backup/` (folder ini tidak di-commit ke git).
- Nama file yang disarankan: `monthly-YYYYMM.sql`.

```bash
npx wrangler d1 export desa-jatirejoyoso-db --remote --output backup/monthly-202611.sql
```

## Restore via Time Travel

1. Tentukan titik waktu target (RFC3339 atau Unix seconds):

   ```bash
   npx wrangler d1 time-travel info desa-jatirejoyoso-db --timestamp "2026-11-24T09:00:00Z" --json
   ```

2. Catat bookmark yang dikembalikan.

3. Restore ke titik tersebut:

   ```bash
   npx wrangler d1 time-travel restore desa-jatirejoyoso-db --bookmark <BOOKMARK>
   ```

   Alternatif tanpa bookmark eksplisit:

   ```bash
   npx wrangler d1 time-travel restore desa-jatirejoyoso-db --timestamp "2026-11-24T09:00:00Z"
   ```

### Peringatan Restore

- Restore **menimpa seluruh isi database** pada titik waktu tersebut.
- Simpan dulu export terbaru sebelum restore.
- Restore bersifat destruktif terhadap data yang dibuat setelah titik waktu target.

## Restore dari File SQL

Gunakan bila Time Travel tidak mencakup keadaan yang dibutuhkan (>7 hari).

1. Buat database baru atau kosongkan tabel yang ada.
2. Import file:

   ```bash
   npx wrangler d1 execute desa-jatirejoyoso-db --remote --file backup/monthly-202611.sql
   ```

## Restore Drill

Lakukan sebelum go-live pertama, lalu minimal tiap 3 bulan:

1. Export snapshot terbaru.
2. Catat bookmark Time Travel saat ini.
3. Buat perubahan uji kecil (mis. tambah 1 artikel dummy via `/admin`).
4. Restore ke bookmark sebelum perubahan.
5. Verifikasi artikel dummy hilang dan data lama utuh.
6. Catat hasil drill di log internal (tanggal, bookmark, hasil).
