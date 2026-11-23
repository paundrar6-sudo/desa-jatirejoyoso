# Keamanan Admin

## Ringkasan Kontrol

- Endpoint admin berada di `/api/admin/*`, dilindungi sesi cookie HttpOnly.
- Password tidak pernah disimpan dalam bentuk teks; disimpan sebagai hash PBKDF2-SHA256 (210.000 iterasi, salt 16 byte).
- Sesi menggunakan token HMAC-SHA256 berisi payload `{ sub, iat, exp }`, masa berlaku 8 jam.
- Cookie sesi: `HttpOnly`, `SameSite=Strict`, `Secure` (HTTPS), `Path=/`.
- CSRF: double-submit cookie (`csrf_token`) + header `X-CSRF-Token`, plus pemeriksaan `Origin`.
- Rate limit login: 5 percobaan gagal per 15 menit per IP, lalu lockout 15 menit.
- IP pengguna tidak disimpan mentah; hanya disimpan sebagai hash SHA-256 (`ip_hash`).
- Semua konten admin divalidasi server-side; output publik dirender dengan `textContent` (bukan `innerHTML`) untuk konten dinamis.

## Secret yang Wajib Disetel di Produksi

Setel tiga secret pada Worker:

```bash
npx wrangler secret put ADMIN_PASSWORD_HASH
npx wrangler secret put SESSION_SECRET
npx wrangler secret put IP_HASH_SECRET
```

- `ADMIN_PASSWORD_HASH`: output dari `node scripts/hash-password.mjs <password>`.
- `SESSION_SECRET`: minimal 32 byte acak (base64url/hex).
- `IP_HASH_SECRET`: minimal 32 byte acak (base64url/hex).

Jika salah satu tidak disetel atau terlalu pendek, API admin akan mengembalikan HTTP 500 dengan pesan "Server belum dikonfigurasi".

## Keterbatasan yang Harus Dipahami

- **Rate limit per-IP dapat dilewati** oleh serangan terdistribusi (banyak IP berbeda). Ini adalah batasan desain, bukan proteksi penuh.
- **Kuota write D1 Free (100k/hari)** bisa habis jika rate limit diserang massal; pada kondisi itu login bisa gagal karena tabel `login_attempts` tidak dapat ditulis.
- **Satu password, satu admin**: tidak ada multi-user, role, reset password, atau audit log. Jika password bocor, ganti secret `ADMIN_PASSWORD_HASH` segera.
- **Lockout bersifat global per IP-hash**: pengguna yang berbagi IP publik dapat saling memicu lockout.
- PBKDF2 dengan 210k iterasi tetap memakan CPU; Worker Free memiliki batas CPU 10ms per request. Jika login terasa lambat atau gagal karena CPU limit, turunkan iterasi (mis. 100k) dan perbarui hash.

## Rekomendasi Operasional

1. Gunakan password kuat (minimal 16 karakter, acak).
2. Simpan password di password manager, bukan di chat/repo.
3. Ganti `SESSION_SECRET` dan `IP_HASH_SECRET` secara berkala atau saat curiga. Ganti secret akan logout semua sesi.
4. Jangan pernah commit `.dev.vars` atau secret produksi.
5. Pantau log Worker (observability) untuk pola percobaan login gagal.
6. Endpoint `/admin` sudah `noindex`; tetap jangan sebar link publik.
