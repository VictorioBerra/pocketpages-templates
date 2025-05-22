// @ts-check
import { test, expect } from '@playwright/test';
import { upAll } from 'docker-compose'
import path from 'path';

test.beforeAll(async () => {
  await upAll({ cwd: path.join(__dirname), log: true });
});

test('has title', async ({ page }) => {
  await page.goto('http://localhost:8090/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/PocketBase PocketPages Starter/);
});