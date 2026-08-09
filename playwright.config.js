// @ts-check
const { defineConfig } = require("@playwright/test");
const fs = require("fs");

// In omgevingen met een voorgeïnstalleerde Chromium (vast pad) die gebruiken;
// in CI downloadt "npx playwright install" de passende browser.
const localChromium = process.env.CI ? undefined
  : (fs.existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : undefined);

module.exports = defineConfig({
  testDir: "./tests",
  timeout: 30000,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: "http://localhost:8899",
    viewport: { width: 390, height: 844 },
    launchOptions: localChromium ? { executablePath: localChromium } : {}
  },
  webServer: {
    command: "python3 -m http.server 8899",
    url: "http://localhost:8899/index.html",
    reuseExistingServer: !process.env.CI
  }
});
