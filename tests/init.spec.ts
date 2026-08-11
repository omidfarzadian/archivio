import { test, expect } from '@playwright/test';

test('app loads home page', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));

  await page.goto('http://localhost:4173/', { waitUntil: 'load', timeout: 20000 });

  await expect(page.getByText('مدیریت اطلاعات و آمار')).toBeVisible({ timeout: 30000 });

  if (errors.length) console.log('Page errors:', errors);
});
