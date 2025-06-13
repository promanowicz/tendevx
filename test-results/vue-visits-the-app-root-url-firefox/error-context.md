# Test info

- Name: visits the app root url
- Location: /Users/roman/AndroidProjects/commercial-manager/e2e/vue.spec.ts:5:1

# Error details

```
Error: Timed out 5000ms waiting for expect(locator).toHaveText(expected)

Locator: locator('h1')
Expected string: "You did it!"
Received string: "Login"
Call log:
  - expect.toHaveText with timeout 5000ms
  - waiting for locator('h1')
    9 × locator resolved to <h1 data-v-409777eb="">Login</h1>
      - unexpected value "Login"

    at /Users/roman/AndroidProjects/commercial-manager/e2e/vue.spec.ts:7:36
```

# Page snapshot

```yaml
- main:
  - heading "Login" [level=1]
  - text: Email
  - textbox "Email"
  - text: Password
  - textbox "Password"
  - button "Login"
  - link "Don't have an account? Register":
    - /url: /register
- paragraph: Running in emulator mode. Do not use with production credentials.
- img
- img
```

# Test source

```ts
  1 | import { test, expect } from '@playwright/test';
  2 |
  3 | // See here how to get started:
  4 | // https://playwright.dev/docs/intro
  5 | test('visits the app root url', async ({ page }) => {
  6 |   await page.goto('/');
> 7 |   await expect(page.locator('h1')).toHaveText('You did it!');
    |                                    ^ Error: Timed out 5000ms waiting for expect(locator).toHaveText(expected)
  8 | })
  9 |
```