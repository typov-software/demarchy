import { expect, test } from '@playwright/test';

test('index page has expected auth buttons', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Join now')).toBeVisible();
  await expect(page.getByText('Login')).toBeVisible();
});
