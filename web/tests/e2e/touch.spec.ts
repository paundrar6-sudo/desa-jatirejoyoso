import { expect, test } from '@playwright/test';

// Touch interaction tests terhadap PRODUKSI (mobile viewport via playwright.prod.config.ts)

test.describe('mobile sentuh - produksi', () => {
  test('hamburger menu buka/tutup dan navigasi berfungsi', async ({ page }) => {
    await page.setViewportSize({ width: 412, height: 915 });
    await page.goto('/');
    const toggle = page.locator('#mobileToggle');
    const nav = page.locator('#mainNav');

    await expect(toggle).toBeVisible();
    await expect(nav).not.toHaveClass(/show/);
    await toggle.tap();
    await expect(nav).toHaveClass(/show/);
    await toggle.tap();
    await expect(nav).not.toHaveClass(/show/);

    // Buka lagi lalu klik link -> menu tertutup otomatis
    await toggle.tap();
    await expect(nav).toHaveClass(/show/);
    await page.locator('.nav-link', { hasText: 'Profil' }).tap();
    await expect(page).toHaveURL(/\/profil/);
  });

  test('lightbox peta buka, zoom, tutup dengan ESC', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-content-loaded="true"]', { timeout: 15000 });

    const modal = page.locator('#imageLightboxModal');
    await expect(modal).not.toHaveClass(/active/);

    // Tombol zoom di section peta beranda
    await page.locator('.btn-zoom-map').first().tap();
    await expect(modal).toHaveClass(/active/);

    // Toggle zoom pada gambar
    const img = page.locator('#lightboxImg');
    await img.tap();
    await expect(img).toHaveClass(/zoomed/);
    await img.tap();
    await expect(img).not.toHaveClass(/zoomed/);

    // Tutup via ESC
    await page.keyboard.press('Escape');
    await expect(modal).not.toHaveClass(/active/);
  });

  test('tap kartu aparatur menampilkan toast detail', async ({ page }) => {
    await page.goto('/profil/');
    await page.waitForSelector('[data-content-loaded="true"]', { timeout: 15000 });

    await expect(page.locator('#orgStructure .team-spotlight-card')).toHaveCount(14);
    const card = page.locator('#orgStructure .team-spotlight-card').first();
    await card.tap();

    const toast = page.locator('.site-toast').first();
    await expect(toast).toBeVisible({ timeout: 5000 });
    await expect(toast).toContainText('Didit Mulyo Santoso');
    await expect(toast).toContainText('Kepala Desa');
  });

  test('filter berita berfungsi via tap di informasi', async ({ page }) => {
    await page.goto('/informasi/');
    await page.waitForSelector('[data-content-loaded="true"]', { timeout: 15000 });

    await expect(page.locator('#newsList .news-card-horizontal')).toHaveCount(4);
    await page.locator('.category-pills .pill', { hasText: 'Kegiatan Warga' }).tap();
    await expect(page.locator('#newsList .news-card-horizontal')).toHaveCount(2);
    await page.locator('.category-pills .pill', { hasText: 'Bansos & Pertanian' }).tap();
    await expect(page.locator('.news-empty-state')).toBeVisible();
  });
});
