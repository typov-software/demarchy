import { expect, test } from '@playwright/test';

test('index page has expected auth buttons', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTitle('Join now')).toBeVisible();
});
