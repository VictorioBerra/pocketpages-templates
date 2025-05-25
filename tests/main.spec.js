// @ts-check
import { test, expect } from '@playwright/test';
const mailhog = require('mailhog')();

const host = 'http://localhost:8090';

const TEST_EMAIL = 'testuser@example.com';
const TEST_PASSWORD = 'test_password1234';

// Shared state for test flows
let LATEST_PASSWORD = 'test_password1234';
let NEW_EMAIL = 'changeduser@example.com';

// Helper to extract the body from a MailHog message
function getMailBody(result) {
  if (!result) return '';
  // Try common MailHog API shapes
  if (result.Content && result.Content.Body) return result.Content.Body;
  if (result.Body) return result.Body;
  if (result.MIME && result.MIME.Body) return result.MIME.Body;
  if (result.html && typeof result.html === 'string') return result.html;
  if (result.text && typeof result.text === 'string') return result.text;
  return '';
}

function extractVerifyLinkFromBody(body) {
  // Remove soft line breaks (quoted-printable)
  const cleanedBody = body.replace(/=\r?\n/g, '');
  const match = cleanedBody.match(/\[Verify\]\((.*)\)/i);
  return match ? match[1] : null;
}

async function login(page, email, password = LATEST_PASSWORD) {
  await page.goto(`${host}/auth/login`);
  await page.fill('input[name="identity"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
}

async function expectLoggedIn(page) {
  const logoutLink = await page.locator('a[href="/account/logout"]');
  expect(await logoutLink.count()).toBe(1);
}

test('register an account (registration only)', async ({ page }) => {
  await page.goto(`${host}/auth/register`);

  // Fill in the registration form
  await page.fill('input[name="identity"]', TEST_EMAIL);
  await page.fill('input[name="password"]', LATEST_PASSWORD);

  // Submit the form
  await page.click('button[type="submit"]');

  const flashContainer = await page.getByTestId('flashContainer');
  await expect(flashContainer).toHaveText("Registration successful. Please check your email to verify your account.");

  // Access MailHog API, get email to verify the account
  const result = await mailhog.latestTo(TEST_EMAIL);
  expect(result).not.toBeNull();
  const body = getMailBody(result);
  const verifyLink = extractVerifyLinkFromBody(body);
  expect(verifyLink).not.toBeNull();
});

test('verify account from email link', async ({ page }) => {

  // Access MailHog API, get email to verify the account
  const result = await mailhog.latestTo(TEST_EMAIL);
  expect(result).not.toBeNull();

  const body = getMailBody(result);
  const verifyLink = extractVerifyLinkFromBody(body);
  expect(verifyLink).not.toBeNull();

  // Go to the verification link
  await page.goto(verifyLink);

  const flashContainer = await page.getByTestId('flashContainer');

  await expect(flashContainer).toHaveText("Your account has been verified, you can now login.");
});

test('login with verified account', async ({ page, context }) => {
  await login(page, TEST_EMAIL, TEST_PASSWORD);
  await expectLoggedIn(page);
});

test('Change password', async ({ page, context }) => {
  await login(page, TEST_EMAIL);
  
  await page.goto(`${host}/account/change-password`);
  await page.fill('input[name="currentPassword"]', LATEST_PASSWORD);
  const newPassword = 'new_password_' + Date.now();
  await page.fill('input[name="newPassword"]', newPassword);
  await page.fill('input[name="confirmPassword"]', newPassword);
  await page.click('button[type="submit"]');

  LATEST_PASSWORD = newPassword;

  const flashContainer = await page.getByTestId('flashContainer');
  await expect(flashContainer).toHaveText("Password changed successfully, you will need to login again.");
});

test('Login with changed password', async ({ page, context }) => {
  await login(page, TEST_EMAIL, LATEST_PASSWORD);
  await expectLoggedIn(page);
});

test('Change email', async ({ page, context }) => {
  await login(page, TEST_EMAIL, LATEST_PASSWORD);
  await page.goto(`${host}/account/change-email`);
  await page.fill('input[name="identity"]', NEW_EMAIL);
  await page.click('button[type="submit"]');
  const flashContainer = await page.getByTestId('flashContainer');
  await expect(flashContainer).toHaveText("Email change requested, please check your email.");
});

test('Confirm Change email', async ({ page, context }) => {
  // Get confirmation email
  const result = await mailhog.latestTo(NEW_EMAIL);
  expect(result).not.toBeNull();

  const body = getMailBody(result);
  const match = body.match(/\[Confirm new email\]\(([^)]+)\)/i);
  expect(match).not.toBeNull();

  const confirmLink = match[1];
  await page.goto(confirmLink);
  await page.fill('input[name="password"]', LATEST_PASSWORD);
  await page.click('button[type="submit"]');

  await page.screenshot({ path: 'screenshot.png' });

  const flashContainer = await page.getByTestId('flashContainer');
  await expect(flashContainer).toHaveText("Your email has been changed. You will need to login again.");
});

test('Login with changed email', async ({ page, context }) => {
  await login(page, NEW_EMAIL, LATEST_PASSWORD);
  await expectLoggedIn(page);
});

test('Logout', async ({ page, context }) => {
  await page.goto(`${host}/account/logout`);

  const cookies = await context.cookies();
  const pbAuthCookie = cookies.find(c => c.name === 'pb_auth');
  expect(pbAuthCookie).toBeUndefined();
});

test('Send Forgot Password Reset', async ({ page, context }) => {
  await page.goto(`${host}/auth/forgot`);
  await page.fill('input[name="identity"]', NEW_EMAIL);
  await page.click('button[type="submit"]');
  const flashContainer = await page.getByTestId('flashContainer');
  await expect(flashContainer).toHaveText("Password reset email sent, please check your inbox.");
});

test('Confirm Forgot Password Reset', async ({ page, context }) => {
  // Get reset email
  const RESET_PASSWORD = 'reset_password_9999';
  const result = await mailhog.latestTo(NEW_EMAIL);
  expect(result).not.toBeNull();
  const body = getMailBody(result);
  const match = body.match(/\[Reset Password\]\(([^)]+)\)/i);
  expect(match).not.toBeNull();
  const resetLink = match[1];
  await page.goto(resetLink);
  await page.fill('input[name="newPassword"]', RESET_PASSWORD);
  await page.fill('input[name="confirmPassword"]', RESET_PASSWORD);
  await page.click('button[type="submit"]');
  LATEST_PASSWORD = RESET_PASSWORD;
  const flashContainer = await page.getByTestId('flashContainer');
  await expect(flashContainer).toHaveText("Your password has been reset, you can now login.");
});

test('Login after password reset', async ({ page, context }) => {
  await login(page, NEW_EMAIL, LATEST_PASSWORD);
  await expectLoggedIn(page);
});