import { test, expect } from '@playwright/test';

test('can create a category', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));

  await page.goto('http://localhost:4173/', { waitUntil: 'load', timeout: 20000 });
  await expect(page.getByText(/ماوا|Mava/)).toBeVisible({ timeout: 30000 });

  await page.getByRole('button', { name: /دسته‌بندی جدید|New category/ }).first().click();
  await page.getByPlaceholder(/گزارش‌های مالی|Financial reports/).fill('تست');
  await page.getByRole('button', { name: /ایجاد دسته‌بندی|Create category/ }).click();

  await expect(page.getByText('تست')).toBeVisible({ timeout: 10000 });
  if (errors.length) console.log('Page errors:', errors);
});
