import { test } from '@playwright/test';

test('debug init on preview', async ({ page }) => {
  const logs: string[] = [];
  page.on('console', (msg) => logs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', (err) => logs.push(`[PAGEERROR] ${err.message}`));

  await page.goto('http://localhost:4173/', { waitUntil: 'load', timeout: 15000 });
  await page.waitForTimeout(8000);

  const body = await page.locator('body').innerText({ timeout: 5000 }).catch(() => 'TIMEOUT');
  console.log('BODY:', String(body).slice(0, 500));
  console.log('LOGS:', logs.filter((l) => 
    l.includes('wasm') || l.includes('Mava') || l.includes('Error') || l.includes('PAGEERROR') || l.includes('jeep')
  ).join('\n'));
});
