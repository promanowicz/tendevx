import { test, expect } from '@playwright/test';

test.describe('Login View', () => {
  test('shows error message for non-existent user', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');

    // Fill in the login form
    await page.getByTestId('email-input').fill('test@test.test');
    await page.getByTestId('password-input').fill('testtesttest');

    // Submit the form
    await page.getByTestId('submit-button').click();

    // Wait for and verify the error message
    const errorMessage = page.getByTestId('error-message');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toHaveText('Failed to sign in');
  });
});
