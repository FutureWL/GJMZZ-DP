// @ts-check
// Playwright 配置(高层角色 e2e)
const { defineConfig } = require('@playwright/test')

module.exports = defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [['list'], ['json', { outputFile: 'report.json' }]],
  use: {
    baseURL: 'http://127.0.0.1:33700',
    headless: true,
    viewport: { width: 1280, height: 800 },
    screenshot: 'only-on-failure',
    video: 'off',
    trace: 'retain-on-failure',
  },
  timeout: 30000,
  expect: { timeout: 8000 },
})
