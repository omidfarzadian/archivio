import { test } from '@playwright/test';

test('full debug', async ({ page }) => {
  const logs: string[] = [];
  page.on('console', (msg) => logs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', (err) => logs.push(`[PAGEERROR] ${err.message}`));

  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(20000);

  const text = await page.evaluate(() => document.body.innerText);
  const jeepState = await page.evaluate(async () => {
    const jeep = document.querySelector('jeep-sqlite') as { isStoreOpen?: () => Promise<boolean> } | null;
    return {
      hasJeep: !!jeep,
      defined: !!customElements.get('jeep-sqlite'),
      storeOpen: jeep?.isStoreOpen ? await jeep.isStoreOpen() : null,
    };
  });

  console.log('TEXT:', text);
  console.log('JEEP:', JSON.stringify(jeepState));
  console.log('LOGS:', logs.join('\n'));
});
