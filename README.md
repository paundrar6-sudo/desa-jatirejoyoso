# Website Resmi DESA JATIREJOYOSO

Website profil dan pelayanan masyarakat resmi **DESA JATIREJOYOSO** yang dibangun menggunakan bahasa pemrograman **Python (Flask)**, dilengkapi dengan animasi transisi latar belakang (background) otomatis dan desain modern responsif.

---

## 📁 1. Susunan Folder Proyek

```text
DESA JATIREJOYOSO/
│
├── app/                              # Folder inti aplikasi
│   ├── __init__.py                   # Inisialisasi aplikasi Flask & blueprint
│   ├── routes.py                     # Controller rute (Beranda, Profil, Informasi, dll)
│   │
│   ├── static/                       # Aset statis web
│   │   ├── css/
│   │   │   └── style.css             # Desain tampilan, efek glassmorphism, & animasi transisi
│   │   ├── js/
│   │   │   └── main.js               # Kontrol slider otomatis, transisi antar halaman, & navbar
│   │   ├── foto/                     # Folder khusus foto aparatur desa & dokumentasi
│   │   │   ├── kades.svg             # Foto Kepala Desa
│   │   │   ├── sekdes.svg            # Foto Sekretaris Desa
│   │   │   └── ...                   # Foto aparatur lainnya (bisa JPG/PNG)
│   │   ├── videos/                   # Folder khusus video short movie / profil desa
│   │   │   ├── README.txt            # Panduan penempatan video MP4
│   │   │   └── video-thumbnail.svg   # Poster thumbnail video player
│   │   └── images/
│   │       ├── bg-desa-1.svg         # Foto/ilustrasi desa 1 (Persawahan & Alam)
│   │       ├── bg-desa-2.svg         # Foto/ilustrasi desa 2 (Balai Desa Jatirejoyoso)
│   │       ├── bg-desa-3.svg         # Foto/ilustrasi desa 3 (Sungai & Lingkungan Asri)
│   │       └── apbdes-2026.jpg       # Infografis resmi APBDes 2026
│   │
│   └── templates/                    # Template HTML (Jinja2)
│       ├── base.html                 # Layout induk: navigasi bar, layer background, & footer
│       ├── index.html                # Halaman Beranda (Hero, Slider background, Sekilas berita)
│       ├── profil.html               # Halaman Profil (Sejarah, Visi Misi, Struktur Organisasi)
│       ├── informasi.html            # Halaman Informasi (Warta berita & pengumuman warga)
│       ├── statistik.html            # Halaman Statistik (Data kependudukan, pekerjaan, usia)
│       ├── layanan.html              # Halaman Layanan (Alur surat keterangan & permohonan)
│       └── kontak.html               # Halaman Kontak (Alamat kantor, nomor telepon, formulir aduan)
│
├── config.py                         # Konfigurasi aplikasi
├── requirements.txt                  # Daftar pustaka Python yang dibutuhkan
├── run.py                            # File utama untuk menjalankan server lokal
└── README.md                         # Dokumentasi panduan penggunaan
```

---

## 🌟 2. Fitur & Struktur Halaman

1. **Nama Website**: **DESA JATIREJOYOSO** (Terpampang jelas di Navbar, Hero, dan Footer).
2. **Navigasi 6 Menu Utama**:
   - **Beranda**: Halaman utama dengan sambutan resmi, kartu statistik cepat, keunggulan desa, dan kabar terkini.
   - **Profil**: Sejarah nama Jatirejoyoso, visi & misi, serta daftar aparatur desa.
   - **Informasi**: Berita kegiatan desa, pengumuman pembagian bansos/pupuk subsidi, dan agenda warga.
   - **Statistik**: Grafik data kependudukan (laki-laki/perempuan, mata pencaharian petani/pedagang, dan kelompok usia).
   - **Layanan**: Prosedur 4 langkah dan pengajuan surat (Domisili, SKU, SKTM, SKCK, Pengantar Nikah, dsb) yang terhubung langsung dengan WhatsApp Admin desa dengan pesan otomatis.
   - **Kontak**: Alamat balai desa, jam pelayanan resmi (Senin - Jumat: 08.00 - 14.00 WIB), integrasi WhatsApp admin cepat tanggap, serta formulir aduan/aspirasi warga.
3. **Fitur Animasi Background Foto Desa**:
   - Background berada pada layer belakang dengan efek **Ken Burns (smooth zoom & fade)**.
   - **Otomatis berganti** setiap 6 detik di halaman Beranda.
   - Terdapat **indikator titik manual** yang dapat diklik langsung oleh pengunjung.
   - Saat pengunjung mengklik menu lain (seperti *Profil*, *Informasi*, dll), background secara otomatis menyesuaikan dengan transisi lembut (*crossfade*).

---

## 🚀 3. Cara Menjalankan Website

1. Buka Terminal / PowerShell di folder proyek ini (`DESA JATIREJOYOSO`).
2. Pastikan pustaka yang dibutuhkan terpasang:
   ```powershell
   pip install -r requirements.txt
   ```
3. Jalankan aplikasi Flask:
   ```powershell
   python run.py
   ```
4. Buka browser Anda dan akses tautan berikut:
   ```
   http://127.0.0.1:5000
   ```

---

## 📷 Cara Mengganti dengan Foto Asli Desa

Anda dapat mengganti gambar ilustrasi bawaan dengan foto asli dokumentasi Desa Jatirejoyoso:
1. Simpan foto desa Anda ke folder: `app/static/images/`
2. Beri nama file seperti:
   - `bg-desa-1.jpg`
   - `bg-desa-2.jpg`
   - `bg-desa-3.jpg`
3. Sesuaikan ekstensi file di `app/templates/base.html` pada bagian tag `bg-slide`.

