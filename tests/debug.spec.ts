import { test } from '@playwright/test';

test('debug init', async ({ page }) => {
  const logs: string[] = [];
  page.on('console', (msg) => logs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', (err) => logs.push(`[PAGEERROR] ${err.message}`));

  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(8000);

  const body = await page.locator('body').innerText();
  console.log('BODY:', body.slice(0, 500));
  console.log('LOGS:', logs.join('\n'));
});
