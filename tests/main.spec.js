// @ts-check
import { test, expect } from '@playwright/test';
import { buildOne, upAll, downAll } from 'docker-compose'
import path from 'path';

const mailhog = require('mailhog')();

const host = 'http://localhost:8090';

const TEST_EMAIL = 'testuser@example.com';
const TEST_PASSWORD = 'test_password1234';

function extractVerifyLinkFromBody(body) {
  // Remove soft line breaks (quoted-printable)
  const cleanedBody = body.replace(/=\r?\n/g, '');
  const match = cleanedBody.match(/\[Verify\]\((.*)\)/i);
  return match ? match[1] : null;
}

test.beforeAll(async () => {
  await buildOne('pocketbase', { cwd: path.join(__dirname), log: true });
  await upAll({ cwd: path.join(__dirname), log: true });
});

test.afterAll(async () => {
  await downAll({ cwd: path.join(__dirname), log: true });
});

test('register an account (registration only)', async ({ page }) => {
  await page.goto(`${host}/auth/register`);

  // Fill in the registration form
  await page.fill('input[name="identity"]', TEST_EMAIL);
  await page.fill('input[name="password"]', TEST_PASSWORD);

  // Submit the form
  await page.click('button[type="submit"]');

  await page.waitForURL(new RegExp(`${host}/\\?__flash=.+`));

  // Check if the registration was successful
  const successMessage = await page.locator('div').filter({ hasText: "Registration successful. Please check your email to verify your account." });
  expect(await successMessage.count()).toBe(1);

  // Access MailHog API, get email to verify the account
  const result = await mailhog.latestTo(TEST_EMAIL);
  expect(result).not.toBeNull();
  const body = result.Content.Body;
  const verifyLink = extractVerifyLinkFromBody(body);
  expect(verifyLink).not.toBeNull();
});

test('verify account from email link', async ({ page }) => {
  // Access MailHog API, get email to verify the account
  const result = await mailhog.latestTo(TEST_EMAIL);
  expect(result).not.toBeNull();
  const body = result.Content.Body;
  const verifyLink = extractVerifyLinkFromBody(body);
  expect(verifyLink).not.toBeNull();
  // Go to the verification link
  await page.goto(verifyLink);
  // Check if the verification was successful
  await page.waitForURL(new RegExp(`${host}/auth/login\\?__flash=.+`));
  const loginMessage = await page.locator('div').filter({ hasText: "Your account has been verified, you can now login." });
  expect(await loginMessage.count()).toBe(1);
});

test('login with verified account', async ({ page, context }) => {
  await page.goto(`${host}/auth/login`);

  // Fill in the login form
  await page.fill('input[name="identity"]', TEST_EMAIL);
  await page.fill('input[name="password"]', TEST_PASSWORD);

  // Submit the form
  await page.click('button[type="submit"]');

  // Check for pb_auth cookie
  const cookies = await context.cookies();
  const pbAuthCookie = cookies.find(c => c.name === 'pb_auth');
  expect(pbAuthCookie).toBeDefined();
  expect(pbAuthCookie && pbAuthCookie.value).toBeTruthy();

  const logoutLink = await page.locator('a[href="/account/logout"]');
  expect(await logoutLink.count()).toBe(1);
});