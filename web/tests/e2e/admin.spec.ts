import { expect, test } from '@playwright/test';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Jatirejoyoso2026!';

test.describe('admin', () => {
  test('login menampilkan dashboard dan tab konten', async ({ page }) => {
    await page.goto('/admin/');
    await expect(page.locator('#adminLoginCard')).toBeVisible();

    await page.locator('#adminPassword').fill(ADMIN_PASSWORD);
    await page.getByRole('button', { name: 'Masuk' }).click();

    await expect(page.locator('#adminDashboard')).toBeVisible();
    await expect(page.locator('#adminTableBody tr')).not.toHaveCount(0);

    await page.getByRole('button', { name: 'Aparatur' }).click();
    await expect(page.locator('#adminTableBody tr')).toHaveCount(14);
    await page.getByRole('button', { name: 'Agenda' }).click();
    await expect(page.locator('#adminTableBody tr')).toHaveCount(8);
  });

  test('password salah ditolak', async ({ page }) => {
    await page.goto('/admin/');
    await page.locator('#adminPassword').fill('password-salah');
    await page.getByRole('button', { name: 'Masuk' }).click();
    await expect(page.locator('#adminLoginStatus')).toContainText('Password salah');
    await expect(page.locator('#adminDashboard')).toBeHidden();
  });
});
