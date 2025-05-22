// @ts-check
import { test, expect } from '@playwright/test';
import { buildOne, upAll, downAll } from 'docker-compose'
import path from 'path';

const mailhog = require('mailhog')();

const host = 'http://localhost:8090';

test.beforeAll(async () => {
  await buildOne('pocketbase', { cwd: path.join(__dirname), log: true });
  await upAll({ cwd: path.join(__dirname), log: true });
});

test.afterAll(async () => {
  await downAll({ cwd: path.join(__dirname), log: true });
  console.log('Docker containers stopped');
});

test('register an account', async ({ page }) => {
  await page.goto(`${host}/auth/register`);

  const emailAddress = 'testuser@example.com';

  // Fill in the registration form
  await page.fill('input[name="identity"]', emailAddress);
  await page.fill('input[name="password"]', 'test_password1234');

  // Submit the form
  await page.click('button[type="submit"]');

  await page.waitForURL(new RegExp(`${host}/\\?__flash=.+`));

  // Check if the registration was successful, page should include a div with the text "Registration successful. Please check your email to verify your account."
  const successMessage = await page.locator('div').filter({ hasText: /Registration successful.*/i });

  // Access MailHog API, get email to verify the account. Might need to get all emails to user and filter?
  // Body of email is <p>Hello,</p>\n<p>Thank you for joining us at {APP_NAME}.</p>\n<p>Click on the button below to verify your email address.</p>\n<p>\n  <a class=\"btn\" href=\"{APP_URL}/auth/confirm-verification/{TOKEN}\" target=\"_blank\" rel=\"noopener\">Verify</a>\n</p>\n<p>\n  Thanks,<br/>\n  {APP_NAME} team\n</p>
  const result = await mailhog.latestTo(emailAddress);

  const body = result.Content.Body;

  // 1. Remove soft line breaks (quoted-printable)
  const cleanedBody = body.replace(/=\r?\n/g, '');

  const match = cleanedBody.match(/\[Verify\]\((.*)\)/i);

  const cleanedVerifyLink = match ? match[1] : null;

  console.log(cleanedVerifyLink);

  // thread sleep
  await new Promise(resolve => setTimeout(resolve, 30000));

  // Go to the verification link
  await page.goto(cleanedVerifyLink);

  // Check if the verification was successful, page should include a div with the text "Email address verified. You can now log in."
  await page.waitForURL(new RegExp(`${host}/auth/login?__flash=.+`));

  const loginMessage = await page.locator('div').filter({ hasText: /Your account has been verified*/i });

  expect(await successMessage.count()).toBe(1);
  expect(await loginMessage.count()).toBe(1);
});