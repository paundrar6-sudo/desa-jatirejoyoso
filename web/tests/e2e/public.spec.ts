import { expect, test } from '@playwright/test';

const PAGES = ['/', '/profil/', '/informasi/', '/statistik/', '/layanan/', '/kontak/'];

test.describe('halaman publik', () => {
  test('semua halaman terbuka dengan judul yang benar', async ({ page }) => {
    const titles = [
      'Beranda - DESA JATIREJOYOSO',
      'Profil Desa - DESA JATIREJOYOSO',
      'Informasi & Berita - DESA JATIREJOYOSO',
      'Statistik Desa - DESA JATIREJOYOSO',
      'Layanan Masyarakat - DESA JATIREJOYOSO',
      'Kontak & Lokasi - DESA JATIREJOYOSO',
    ];
    for (let index = 0; index < PAGES.length; index += 1) {
      const response = await page.goto(PAGES[index]);
      expect(response?.status()).toBe(200);
      await expect(page).toHaveTitle(titles[index]);
    }
  });

  test('beranda menampilkan 3 berita dari API', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-content-loaded', 'true');
    await expect(page.locator('#homeNewsGrid .news-card')).toHaveCount(3);
    await expect(page.locator('#homeNewsGrid .news-card').first()).toContainText(
      'Gotong Royong Normalisasi Saluran Irigasi'
    );
  });

  test('profil menampilkan 14 aparatur', async ({ page }) => {
    await page.goto('/profil/');
    await expect(page.locator('html')).toHaveAttribute('data-content-loaded', 'true');
    await expect(page.locator('#orgStructure .team-spotlight-card')).toHaveCount(14);
    await expect(page.locator('#orgStructure').locator('text=Didit Mulyo Santoso')).toBeVisible();
    await expect(
      page.locator('#orgStructure').locator('text=Mukhamad Afifudin')
    ).toBeVisible();
  });

  test('informasi: daftar berita, filter, dan kalender', async ({ page }) => {
    await page.goto('/informasi/');
    await expect(page.locator('html')).toHaveAttribute('data-content-loaded', 'true');
    await expect(page.locator('#newsList .news-card-horizontal')).toHaveCount(4);

    await page.getByRole('button', { name: 'Pengumuman', exact: true }).click();
    await expect(page.locator('#newsList .news-card-horizontal')).toHaveCount(1);
    await expect(page.locator('#newsList')).toContainText('Penyaluran Bantuan Pangan');

    await page.getByRole('button', { name: 'Bansos & Pertanian' }).click();
    await expect(page.locator('#newsList .news-empty-state')).toBeVisible();

    await page.getByRole('button', { name: 'Semua', exact: true }).click();
    await expect(page.locator('#newsList .news-card-horizontal')).toHaveCount(4);

    await expect(page.locator('#calendarAgendaItems .calendar-agenda-item')).toHaveCount(8);
    await expect(page.locator('#calendarEventCount')).toContainText('8 Kegiatan Terdata');
  });

  test('statistik, layanan, dan kontak menampilkan konten statis', async ({ page }) => {
    await page.goto('/statistik/');
    await expect(page.locator('body')).toContainText('Total Anggaran Keseluruhan');
    await page.goto('/layanan/');
    await expect(page.locator('body')).toContainText('Surat Keterangan Domisili');
    await page.goto('/kontak/');
    await expect(page.locator('body')).toContainText('Balai Desa Jatirejoyoso');
  });
});
